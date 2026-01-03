/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * Precipitation History API Route
 * Fetches 24-hour precipitation totals using One Call 3.0 timemachine
 * Only available for authenticated users with 1-hour cache TTL
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simple in-memory cache with 1-hour TTL
const precipitationCache = new Map<string, { data: PrecipitationResponse; expires: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface PrecipitationResponse {
  currentRain: number;
  currentSnow: number;
  rain24h: number;
  snow24h: number;
  lastUpdated: string;
  dataSource: 'onecall' | 'timemachine';
  dataAvailable: boolean; // true if API returned valid data, false if all calls failed
}

// Get user from request
async function getAuthenticatedUser(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

// Convert mm to inches
function mmToInches(mm: number): number {
  return Math.round((mm / 25.4) * 100) / 100;
}

// Fetch current weather with precipitation data
async function fetchCurrentWeather(lat: number, lon: number, apiKey: string): Promise<{
  rain1h: number;
  snow1h: number;
} | null> {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      rain1h: data.rain?.['1h'] ? mmToInches(data.rain['1h']) : 0,
      snow1h: data.snow?.['1h'] ? mmToInches(data.snow['1h']) : 0,
    };
  } catch {
    return null;
  }
}

// Fetch historical data using One Call 3.0 timemachine
async function fetchHistoricalPrecipitation(
  lat: number,
  lon: number,
  apiKey: string
): Promise<{ rain24h: number; snow24h: number; dataAvailable: boolean }> {
  const now = Math.floor(Date.now() / 1000);
  let totalRainMm = 0;
  let totalSnowMm = 0;
  let successfulApiCalls = 0;

  // Track processed hours to prevent double-counting from overlapping API responses
  const processedHours = new Set<number>();

  // One Call 3.0 timemachine returns data for ONE timestamp per call
  // To get 24 hours of data, we need to make multiple calls
  // We'll sample every 3 hours (8 calls) and multiply by 3 for estimation
  // This balances API usage with data accuracy
  const timestamps: number[] = [];
  for (let hoursAgo = 3; hoursAgo <= 24; hoursAgo += 3) {
    timestamps.push(now - (hoursAgo * 60 * 60));
  }
  // timestamps: [3h ago, 6h ago, 9h ago, 12h ago, 15h ago, 18h ago, 21h ago, 24h ago]

  for (const dt of timestamps) {
    try {
      const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${dt}&units=imperial&appid=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`[Precipitation] Timemachine call failed for dt=${dt}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      successfulApiCalls++;

      // Debug: Log the API response structure
      console.log(`[Precipitation] Timemachine response for dt=${dt}:`, {
        hasData: !!data.data,
        dataLength: data.data?.length || 0,
        sampleHour: data.data?.[0] ? {
          dt: data.data[0].dt,
          hasRain: !!data.data[0].rain,
          hasPrecipitation: !!data.data[0].precipitation,
          rain: data.data[0].rain,
          weather: data.data[0].weather?.[0]?.main,
        } : null,
      });

      // Sum up hourly precipitation (in mm, convert only at the end)
      if (data.data && Array.isArray(data.data)) {
        for (const hour of data.data) {
          // Skip if already processed or outside 24h window
          if (processedHours.has(hour.dt)) continue;
          if (hour.dt < now - (24 * 60 * 60) || hour.dt > now) continue;

          processedHours.add(hour.dt);

          // Sum raw mm values to avoid accumulated rounding errors
          // Handle multiple possible formats from OpenWeatherMap:
          // - rain.1h (object with 1h key)
          // - rain (direct number)
          // - precipitation (alternative field)
          const rainAmount =
            (typeof hour.rain === 'object' && hour.rain?.['1h']) ? hour.rain['1h'] :
            (typeof hour.rain === 'number') ? hour.rain :
            (typeof hour.precipitation === 'number') ? hour.precipitation : 0;

          const snowAmount =
            (typeof hour.snow === 'object' && hour.snow?.['1h']) ? hour.snow['1h'] :
            (typeof hour.snow === 'number') ? hour.snow : 0;

          if (rainAmount > 0) {
            totalRainMm += rainAmount;
          }
          if (snowAmount > 0) {
            totalSnowMm += snowAmount;
          }
        }
      }
    } catch (error) {
      console.error(`[Precipitation] Error fetching timemachine data:`, error);
    }
  }

  // Since we sample every 3 hours, multiply by 3 to estimate hourly totals
  // This assumes precipitation rate was relatively constant within each 3-hour window
  const estimatedRainMm = totalRainMm * 3;
  const estimatedSnowMm = totalSnowMm * 3;

  // Debug: Log final totals
  console.log(`[Precipitation] Final totals:`, {
    successfulApiCalls,
    processedHours: processedHours.size,
    sampledRainMm: totalRainMm,
    sampledSnowMm: totalSnowMm,
    estimatedRainMm,
    estimatedSnowMm,
    rain24hInches: Math.round((estimatedRainMm / 25.4) * 100) / 100,
    snow24hInches: Math.round((estimatedSnowMm / 25.4) * 10) / 10,
  });

  // Convert mm to inches only after summing all values
  return {
    rain24h: Math.round((estimatedRainMm / 25.4) * 100) / 100,
    snow24h: Math.round((estimatedSnowMm / 25.4) * 10) / 10,
    dataAvailable: successfulApiCalls > 0, // At least one API call succeeded
  };
}

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required for precipitation history' },
        { status: 401 }
      );
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenWeather API key not configured' },
        { status: 500 }
      );
    }

    const sp = request.nextUrl.searchParams;
    const lat = sp.get('lat');
    const lon = sp.get('lon');

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
    const cached = precipitationCache.get(cacheKey);
    
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }

    // Fetch current and historical precipitation
    const [current, historical] = await Promise.all([
      fetchCurrentWeather(latitude, longitude, apiKey),
      fetchHistoricalPrecipitation(latitude, longitude, apiKey),
    ]);

    const precipitationData: PrecipitationResponse = {
      currentRain: current?.rain1h || 0,
      currentSnow: current?.snow1h || 0,
      rain24h: historical.rain24h,
      snow24h: historical.snow24h,
      lastUpdated: new Date().toISOString(),
      dataSource: 'timemachine',
      dataAvailable: historical.dataAvailable,
    };

    // Only cache successful responses - don't cache failures so retry works
    if (historical.dataAvailable) {
      precipitationCache.set(cacheKey, {
        data: precipitationData,
        expires: Date.now() + CACHE_TTL_MS,
      });
    }

    // Clean up old cache entries
    const now = Date.now();
    for (const [key, value] of precipitationCache.entries()) {
      if (value.expires < now) {
        precipitationCache.delete(key);
      }
    }

    return NextResponse.json(precipitationData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'private, max-age=3600',
      },
    });

  } catch (error) {
    console.error('[Precipitation API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch precipitation data' },
      { status: 500 }
    );
  }
}
