/**
 * 16-Bit Weather Platform - v1.0.0
 *
 * Precipitation History API Route
 * Fetches 24-hour precipitation totals using Open-Meteo
 * Available for all users with 1-hour cache TTL
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimitRequest } from '@/lib/services/weather-rate-limiter';
import { fetchOpenMeteoForecast } from '@/lib/open-meteo';

// Simple in-memory cache with 1-hour TTL
const precipitationCache = new Map<string, { data: PrecipitationResponse; expires: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface PrecipitationResponse {
  currentRain: number;
  currentSnow: number;
  rain24h: number;
  snow24h: number;
  todayRain: number;
  yesterdayRain: number;
  todaySnow: number;
  yesterdaySnow: number;
  lastUpdated: string;
  dataSource: 'day_summary' | 'timemachine';
  dataAvailable: boolean;
  dataQuality: 'full' | 'partial';
}

// Convert mm to inches
function mmToInches(mm: number): number {
  return Math.round((mm / 25.4) * 100) / 100;
}

export async function GET(request: NextRequest) {
  try {
    // Check rate limit first
    const rateLimit = await rateLimitRequest(request);
    if (!rateLimit.allowed) {
      return rateLimit.response;
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
          ...rateLimit.headers,
        },
      });
    }

    // Fetch from Open-Meteo with 2 days of data (today + yesterday)
    // Request in mm for precipitation, fahrenheit for temperature (to determine snow vs rain)
    const forecast = await fetchOpenMeteoForecast(latitude, longitude, {
      forecastDays: 2,
      temperatureUnit: 'fahrenheit',
      windSpeedUnit: 'mph',
      precipitationUnit: 'mm', // We convert to inches ourselves for precision
    });

    const current = forecast.current;
    const daily = forecast.daily;
    const hourly = forecast.hourly;

    // Current precipitation rate
    const currentPrecipMm = current?.precipitation ?? 0;
    const currentTempF = current?.temperature_2m ?? 40;
    const isSnow = currentTempF <= 32;

    const currentRain = isSnow ? 0 : mmToInches(currentPrecipMm);
    const currentSnow = isSnow ? mmToInches(currentPrecipMm) : 0;

    // Daily totals from Open-Meteo daily.precipitation_sum
    const todayPrecipMm = daily?.precipitation_sum?.[0] ?? 0;
    const yesterdayPrecipMm = daily?.precipitation_sum?.[1] ?? 0;

    // Determine snow vs rain for daily totals using daily temperature
    // If max temp is <= 32F, classify as snow
    const todayMaxF = daily?.temperature_2m_max?.[0] ?? 40;
    const yesterdayMaxF = daily?.temperature_2m_max?.[1] ?? 40;

    const todayIsSnow = todayMaxF <= 32;
    const yesterdayIsSnow = yesterdayMaxF <= 32;

    const todayRain = todayIsSnow ? 0 : mmToInches(todayPrecipMm);
    const todaySnow = todayIsSnow ? mmToInches(todayPrecipMm) : 0;
    const yesterdayRain = yesterdayIsSnow ? 0 : mmToInches(yesterdayPrecipMm);
    const yesterdaySnow = yesterdayIsSnow ? mmToInches(yesterdayPrecipMm) : 0;

    // Calculate 24h rolling total using weighted average
    // Get current local hour from hourly data timezone
    const now = new Date();
    let currentHour = now.getUTCHours();
    if (forecast.utc_offset_seconds) {
      currentHour = (currentHour + Math.round(forecast.utc_offset_seconds / 3600)) % 24;
      if (currentHour < 0) currentHour += 24;
    }

    // Also sum hourly precipitation for last 24 hours if available
    let hourly24hPrecipMm = 0;
    let hourlyDataAvailable = false;
    if (hourly?.time && hourly?.precipitation) {
      const nowMs = now.getTime();
      const oneDayAgo = nowMs - 24 * 60 * 60 * 1000;
      for (let i = 0; i < hourly.time.length; i++) {
        const hourMs = new Date(hourly.time[i]).getTime();
        if (hourMs >= oneDayAgo && hourMs <= nowMs) {
          hourly24hPrecipMm += hourly.precipitation[i] ?? 0;
          hourlyDataAvailable = true;
        }
      }
    }

    // Prefer hourly sum if available, otherwise use weighted daily
    let rain24h: number;
    let snow24h: number;
    if (hourlyDataAvailable && hourly24hPrecipMm > 0) {
      // Use hourly sum — more accurate
      const avg24hTempBelow32 = currentTempF <= 32; // simplified
      rain24h = avg24hTempBelow32 ? 0 : mmToInches(hourly24hPrecipMm);
      snow24h = avg24hTempBelow32 ? mmToInches(hourly24hPrecipMm) : 0;
    } else {
      // Weighted daily approach
      const todayWeight = currentHour / 24;
      const yesterdayWeight = 1 - todayWeight;
      rain24h = Math.round(((todayRain * todayWeight) + (yesterdayRain * yesterdayWeight)) * 100) / 100;
      snow24h = Math.round(((todaySnow * todayWeight) + (yesterdaySnow * yesterdayWeight)) * 10) / 10;
    }

    const dataAvailable = daily?.time != null && daily.time.length > 0;

    const precipitationData: PrecipitationResponse = {
      currentRain,
      currentSnow,
      rain24h,
      snow24h,
      todayRain,
      yesterdayRain,
      todaySnow,
      yesterdaySnow,
      lastUpdated: new Date().toISOString(),
      dataSource: 'day_summary',
      dataAvailable,
      dataQuality: daily?.time && daily.time.length >= 2 ? 'full' : 'partial',
    };

    // Only cache successful responses
    if (dataAvailable) {
      precipitationCache.set(cacheKey, {
        data: precipitationData,
        expires: Date.now() + CACHE_TTL_MS,
      });
    }

    // Clean up old cache entries
    const nowCleanup = Date.now();
    for (const [key, value] of precipitationCache.entries()) {
      if (value.expires < nowCleanup) {
        precipitationCache.delete(key);
      }
    }

    return NextResponse.json(precipitationData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'private, max-age=3600',
        ...rateLimit.headers,
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

// [OWM ROLLBACK] Previous OpenWeatherMap implementation used:
// - https://api.openweathermap.org/data/2.5/weather (current precip rate)
// - https://api.openweathermap.org/data/3.0/onecall/day_summary (daily totals)
// See git history for full original implementation.
