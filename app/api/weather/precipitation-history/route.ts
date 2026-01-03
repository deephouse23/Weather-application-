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

  // Fetch data for the past 24 hours in 8-hour chunks (3 API calls)
  // One Call timemachine returns hourly data for the requested day
  const timestamps = [
    now - (24 * 60 * 60), // 24 hours ago
    now - (16 * 60 * 60), // 16 hours ago
    now - (8 * 60 * 60),  // 8 hours ago
  ];

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

      // Sum up hourly precipitation (in mm, convert only at the end)
      if (data.data && Array.isArray(data.data)) {
        for (const hour of data.data) {
          // Skip if already processed or outside 24h window
          if (processedHours.has(hour.dt)) continue;
          if (hour.dt < now - (24 * 60 * 60) || hour.dt > now) continue;

          processedHours.add(hour.dt);

          // Sum raw mm values to avoid accumulated rounding errors
          if (hour.rain?.['1h']) {
            totalRainMm += hour.rain['1h'];
          }
          if (hour.snow?.['1h']) {
            totalSnowMm += hour.snow['1h'];
          }
        }
      }
    } catch (error) {
      console.error(`[Precipitation] Error fetching timemachine data:`, error);
    }
  }

  // Convert mm to inches only after summing all values
  return {
    rain24h: Math.round((totalRainMm / 25.4) * 100) / 100,
    snow24h: Math.round((totalSnowMm / 25.4) * 10) / 10,
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
