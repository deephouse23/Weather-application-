/**
 * 16-Bit Weather Platform - Precipitation Data API
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Comprehensive precipitation data including snowfall and rainfall totals
 * for 24h, 48h, and 7-day periods using NOAA and OpenWeatherMap APIs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimitRequest } from '@/lib/services/weather-rate-limiter';

// Cache with 15-minute TTL for precipitation data
const precipCache = new Map<string, { data: PrecipitationResponse; expires: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export interface PrecipitationResponse {
  location: string;
  coordinates: { lat: number; lon: number };
  current: {
    snowDepth: number; // inches on ground (estimated)
    snowfall24h: number; // inches in last 24h
    snowfall48h: number; // inches in last 48h
    snowfall7d: number; // inches in last 7 days
    rainfall24h: number; // inches
    rainfall48h: number; // inches
    rainfall7d: number; // inches
  };
  forecast: {
    date: string;
    expectedSnow: number;
    expectedRain: number;
    probability: number;
  }[];
  source: string;
  timestamp: string;
}

// Get user from request (optional for this endpoint)
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

// Convert mm to inches for snow (different rounding)
function mmToInchesSnow(mm: number): number {
  return Math.round((mm / 25.4) * 10) / 10;
}

// Fetch day summary from OpenWeatherMap One Call 3.0
async function fetchDaySummary(
  lat: number,
  lon: number,
  date: string, // YYYY-MM-DD
  apiKey: string
): Promise<{ rain: number; snow: number; success: boolean }> {
  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall/day_summary?lat=${lat}&lon=${lon}&date=${date}&units=metric&appid=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      return { rain: 0, snow: 0, success: false };
    }

    const data = await response.json();

    // precipitation.total is in mm
    const totalPrecipMm = data.precipitation?.total || 0;

    // Determine if precipitation was snow based on temperature
    const maxTempC = data.temperature?.max;
    const minTempC = data.temperature?.min;
    const avgTemp = maxTempC !== undefined && minTempC !== undefined
      ? (maxTempC + minTempC) / 2
      : maxTempC || 0;

    // If avg temp <= 2°C, treat as snow
    const isSnow = avgTemp <= 2;

    return {
      rain: isSnow ? 0 : totalPrecipMm,
      snow: isSnow ? totalPrecipMm : 0,
      success: true
    };
  } catch {
    return { rain: 0, snow: 0, success: false };
  }
}

// Fetch current weather to get timezone and current precipitation
async function fetchCurrentWeather(lat: number, lon: number, apiKey: string): Promise<{
  timezoneOffset: number;
  snow1h: number;
  rain1h: number;
} | null> {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();

    return {
      timezoneOffset: data.timezone || 0,
      snow1h: data.snow?.['1h'] || 0,
      rain1h: data.rain?.['1h'] || 0
    };
  } catch {
    return null;
  }
}

// Fetch 8-day forecast from One Call 3.0
async function fetchForecast(lat: number, lon: number, apiKey: string): Promise<{
  date: string;
  expectedSnow: number;
  expectedRain: number;
  probability: number;
}[]> {
  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) return [];

    const data = await response.json();
    const forecast: { date: string; expectedSnow: number; expectedRain: number; probability: number }[] = [];

    for (const day of (data.daily || []).slice(0, 8)) {
      const date = new Date(day.dt * 1000).toISOString().split('T')[0];
      const snowMm = day.snow || 0;
      const rainMm = day.rain || 0;
      const pop = day.pop || 0; // Probability of precipitation (0-1)

      forecast.push({
        date,
        expectedSnow: mmToInchesSnow(snowMm),
        expectedRain: mmToInches(rainMm),
        probability: Math.round(pop * 100)
      });
    }

    return forecast;
  } catch {
    return [];
  }
}

// Get multi-day precipitation totals
async function getMultiDayPrecipitation(
  lat: number,
  lon: number,
  apiKey: string,
  timezoneOffset: number
): Promise<{
  rain24h: number;
  rain48h: number;
  rain7d: number;
  snow24h: number;
  snow48h: number;
  snow7d: number;
}> {
  // Calculate dates for the location's timezone
  const nowUtc = new Date();
  const locationTimeMs = nowUtc.getTime() + (timezoneOffset * 1000);

  // Generate dates for today and past 7 days
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dateMs = locationTimeMs - (i * 24 * 60 * 60 * 1000);
    const date = new Date(dateMs).toISOString().split('T')[0];
    dates.push(date);
  }

  // Fetch all days in parallel (limited to 3 concurrent to avoid rate limits)
  const results: { rain: number; snow: number; success: boolean }[] = [];

  for (let i = 0; i < dates.length; i += 3) {
    const batch = dates.slice(i, i + 3);
    const batchResults = await Promise.all(
      batch.map(date => fetchDaySummary(lat, lon, date, apiKey))
    );
    results.push(...batchResults);
  }

  // Calculate totals (results are in order: today, yesterday, 2 days ago, etc.)
  let rain24h = 0, rain48h = 0, rain7d = 0;
  let snow24h = 0, snow48h = 0, snow7d = 0;

  // Calculate based on current hour for weighted 24h
  const locationDate = new Date(locationTimeMs);
  const currentHour = locationDate.getUTCHours();
  const todayWeight = currentHour / 24;
  const yesterdayWeight = 1 - todayWeight;

  // Today (partial) + yesterday (partial) = 24h
  if (results[0]?.success && results[1]?.success) {
    rain24h = (results[0].rain * todayWeight) + (results[1].rain * yesterdayWeight);
    snow24h = (results[0].snow * todayWeight) + (results[1].snow * yesterdayWeight);
  } else if (results[0]?.success) {
    rain24h = results[0].rain;
    snow24h = results[0].snow;
  }

  // 48h: today + yesterday
  for (let i = 0; i < 2 && i < results.length; i++) {
    if (results[i]?.success) {
      rain48h += results[i].rain;
      snow48h += results[i].snow;
    }
  }

  // 7 day: all days
  for (let i = 0; i < results.length; i++) {
    if (results[i]?.success) {
      rain7d += results[i].rain;
      snow7d += results[i].snow;
    }
  }

  return {
    rain24h: mmToInches(rain24h),
    rain48h: mmToInches(rain48h),
    rain7d: mmToInches(rain7d),
    snow24h: mmToInchesSnow(snow24h),
    snow48h: mmToInchesSnow(snow48h),
    snow7d: mmToInchesSnow(snow7d)
  };
}

// Estimate snow depth based on recent snowfall and temperature
function estimateSnowDepth(snow7d: number, avgTemp: number = 30): number {
  // Snow melts faster in warmer temps
  // Rough estimate: snow depth is 70% of 7-day total if cold, less if warm
  const meltFactor = avgTemp <= 32 ? 0.7 : avgTemp <= 40 ? 0.4 : 0.2;
  return Math.round(snow7d * meltFactor * 10) / 10;
}

export async function GET(request: NextRequest) {
  try {
    // Check rate limit first
    const rateLimit = await rateLimitRequest(request);
    if (!rateLimit.allowed) {
      return rateLimit.response;
    }

    // Authentication is optional - reserved for future premium features
    // const user = await getAuthenticatedUser(request);

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Weather API not configured' },
        { status: 500 }
      );
    }

    const sp = request.nextUrl.searchParams;
    const lat = sp.get('lat');
    const lon = sp.get('lon');
    const city = sp.get('city');

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
    const cached = precipCache.get(cacheKey);

    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
          ...rateLimit.headers
        }
      });
    }

    // Fetch current weather first to get timezone
    const current = await fetchCurrentWeather(latitude, longitude, apiKey);
    const timezoneOffset = current?.timezoneOffset || 0;

    // Fetch precipitation data and forecast in parallel
    const [precipData, forecast] = await Promise.all([
      getMultiDayPrecipitation(latitude, longitude, apiKey, timezoneOffset),
      fetchForecast(latitude, longitude, apiKey)
    ]);

    // Build response
    const response: PrecipitationResponse = {
      location: city || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      coordinates: { lat: latitude, lon: longitude },
      current: {
        snowDepth: estimateSnowDepth(precipData.snow7d),
        snowfall24h: precipData.snow24h,
        snowfall48h: precipData.snow48h,
        snowfall7d: precipData.snow7d,
        rainfall24h: precipData.rain24h,
        rainfall48h: precipData.rain48h,
        rainfall7d: precipData.rain7d
      },
      forecast,
      source: 'OpenWeatherMap One Call 3.0',
      timestamp: new Date().toISOString()
    };

    // Cache the response
    precipCache.set(cacheKey, {
      data: response,
      expires: Date.now() + CACHE_TTL_MS
    });

    // Clean old cache entries
    const now = Date.now();
    const entries = Array.from(precipCache.entries());
    for (const [key, value] of entries) {
      if (value.expires < now) {
        precipCache.delete(key);
      }
    }

    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
        ...rateLimit.headers
      }
    });

  } catch (error) {
    console.error('[Precipitation API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch precipitation data' },
      { status: 500 }
    );
  }
}
