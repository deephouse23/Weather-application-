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
  todayRain: number; // Today's total so far
  yesterdayRain: number; // Yesterday's total
  lastUpdated: string;
  dataSource: 'day_summary' | 'timemachine';
  dataAvailable: boolean; // true if API returned valid data, false if all calls failed
  dataQuality: 'full' | 'partial'; // 'full' = both days available, 'partial' = only one day
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

// Fetch a single day's precipitation using One Call 3.0 Day Summary API
async function fetchDaySummary(
  lat: number,
  lon: number,
  date: string, // YYYY-MM-DD format
  apiKey: string
): Promise<{ rain: number; snow: number; success: boolean }> {
  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall/day_summary?lat=${lat}&lon=${lon}&date=${date}&appid=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[Precipitation] Day summary call failed for ${date}: ${response.status}`);
      return { rain: 0, snow: 0, success: false };
    }

    const data = await response.json();

    // Day summary returns precipitation.total in mm
    const rainMm = data.precipitation?.total || 0;
    // Snow is not directly available in day_summary, but we can check temperature
    // If max temp was below freezing, treat precipitation as snow
    const maxTempC = data.temperature?.max;
    const snowMm = (maxTempC !== undefined && maxTempC <= 0) ? rainMm : 0;
    const actualRainMm = (maxTempC !== undefined && maxTempC <= 0) ? 0 : rainMm;

    return { rain: actualRainMm, snow: snowMm, success: true };
  } catch (error) {
    console.error(`[Precipitation] Error fetching day summary for ${date}:`, error);
    return { rain: 0, snow: 0, success: false };
  }
}

// Fetch 24-hour precipitation using Daily Aggregation API
// Uses weighted average of today and yesterday for rolling 24h total
async function fetchDailyPrecipitation(
  lat: number,
  lon: number,
  apiKey: string
): Promise<{
  rain24h: number;
  snow24h: number;
  todayRain: number;
  yesterdayRain: number;
  dataAvailable: boolean;
  dataQuality: 'full' | 'partial';
}> {
  const now = new Date();

  // Get today and yesterday in YYYY-MM-DD format (local timezone)
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Fetch both days in parallel
  const [todayData, yesterdayData] = await Promise.all([
    fetchDaySummary(lat, lon, today, apiKey),
    fetchDaySummary(lat, lon, yesterday, apiKey),
  ]);

  // Calculate weighted 24-hour rolling total based on current hour
  // At midnight (0h): 0% today, 100% yesterday
  // At noon (12h): 50% today, 50% yesterday
  // At 11pm (23h): ~96% today, ~4% yesterday
  const currentHour = now.getHours();
  const todayWeight = currentHour / 24;
  const yesterdayWeight = 1 - todayWeight;

  // Convert mm to inches
  const todayRainInches = Math.round((todayData.rain / 25.4) * 100) / 100;
  const yesterdayRainInches = Math.round((yesterdayData.rain / 25.4) * 100) / 100;
  const todaySnowInches = Math.round((todayData.snow / 25.4) * 10) / 10;
  const yesterdaySnowInches = Math.round((yesterdayData.snow / 25.4) * 10) / 10;

  // Calculate weighted 24h totals
  const rain24h = Math.round((
    (todayRainInches * todayWeight) + (yesterdayRainInches * yesterdayWeight)
  ) * 100) / 100;

  const snow24h = Math.round((
    (todaySnowInches * todayWeight) + (yesterdaySnowInches * yesterdayWeight)
  ) * 10) / 10;

  const dataAvailable = todayData.success || yesterdayData.success;
  const dataQuality = (todayData.success && yesterdayData.success) ? 'full' : 'partial';

  return {
    rain24h,
    snow24h,
    todayRain: todayRainInches,
    yesterdayRain: yesterdayRainInches,
    dataAvailable,
    dataQuality,
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

    // Fetch current weather and daily precipitation totals
    const [current, daily] = await Promise.all([
      fetchCurrentWeather(latitude, longitude, apiKey),
      fetchDailyPrecipitation(latitude, longitude, apiKey),
    ]);

    const precipitationData: PrecipitationResponse = {
      currentRain: current?.rain1h || 0,
      currentSnow: current?.snow1h || 0,
      rain24h: daily.rain24h,
      snow24h: daily.snow24h,
      todayRain: daily.todayRain,
      yesterdayRain: daily.yesterdayRain,
      lastUpdated: new Date().toISOString(),
      dataSource: 'day_summary',
      dataAvailable: daily.dataAvailable,
      dataQuality: daily.dataQuality,
    };

    // Only cache successful responses - don't cache failures so retry works
    if (daily.dataAvailable) {
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
