/**
 * 16-Bit Weather Platform - Air Quality API v0.4.0
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Primary: Open-Meteo Air Quality API (free, no key required)
 * Reference: https://open-meteo.com/en/docs/air-quality-api
 */

import { NextRequest, NextResponse } from 'next/server'
import { rateLimitRequest } from '@/lib/services/weather-rate-limiter'
import { fetchOpenMeteoAirQuality } from '@/lib/open-meteo'

const CACHE_DURATION = 3600; // 1 hour (Open-Meteo updates hourly)

export async function GET(request: NextRequest) {
  try {
    // Check rate limit first
    const rateLimit = await rateLimitRequest(request)
    if (!rateLimit.allowed) {
      return rateLimit.response
    }

    // Extract and validate parameters
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    if (!lat || !lon) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters: lat, lon',
          aqi: 0,
          category: 'No Data',
          source: 'error'
        },
        { status: 400 }
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { 
          error: 'Invalid coordinates',
          aqi: 0,
          category: 'No Data',
          source: 'error'
        },
        { status: 400 }
      )
    }

    // Fetch from Open-Meteo Air Quality API
    const data = await fetchOpenMeteoAirQuality(latitude, longitude)
    const current = data.current

    const aqiValue = current.us_aqi ?? 0
    const category = getAQICategory(aqiValue)

    return NextResponse.json({
      aqi: aqiValue,
      category: category,
      source: 'open-meteo',
      pollutants: {
        pm2_5: current.pm2_5,
        pm10: current.pm10,
        ozone: current.ozone,
        nitrogen_dioxide: current.nitrogen_dioxide,
        sulphur_dioxide: current.sulphur_dioxide,
        carbon_monoxide: current.carbon_monoxide,
      },
      debug: {
        timestamp: new Date().toISOString(),
        dust: current.dust,
        uv_index: current.uv_index,
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
        'X-AQI-Source': 'open-meteo',
        ...rateLimit.headers
      }
    })

  } catch (error: unknown) {
    console.error('[air-quality] Open-Meteo API error:', error);
    return NextResponse.json(
      { 
        aqi: 0,
        category: 'No Data',
        source: 'error',
        error: 'Air quality service temporarily unavailable'
      },
      { status: 200 }
    )
  }
}

// Get AQI category based on EPA scale
function getAQICategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

// =============================================================================
// PREVIOUS IMPLEMENTATION (Google + OWM) — kept for rollback reference
// =============================================================================
//
// // Type definitions for Google Air Quality API responses
// interface GoogleAQIIndex {
//   code: string;
//   aqi: number;
//   category?: string;
//   displayName?: string;
//   dominantPollutant?: string;
// }
//
// interface GoogleAQIResponse {
//   indexes?: GoogleAQIIndex[];
//   healthRecommendations?: {
//     generalPopulation?: string;
//   };
//   pollutants?: unknown[];
// }
//
// // Type definitions for OpenWeather API responses
// interface OpenWeatherComponents {
//   pm2_5?: number;
//   pm10?: number;
//   o3?: number;
//   no2?: number;
//   so2?: number;
//   co?: number;
// }
//
// interface OpenWeatherAirPollutionResponse {
//   list?: Array<{
//     main?: {
//       aqi?: number;
//     };
//     components?: OpenWeatherComponents;
//   }>;
// }
//
// // PRIMARY: Google Air Quality API
// // if (googleApiKey && googleApiKey !== 'your_actual_google_air_quality_key_here') {
// //   const googleUrl = 'https://airquality.googleapis.com/v1/currentConditions:lookup'
// //   ...
// // }
//
// // FALLBACK: OpenWeather Air Pollution API
// // const openWeatherUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}`
// // ...
//
// // Calculate AQI from PM2.5 concentration (μg/m³) using EPA formula
// function calculatePM25AQI(pm25: number): number {
//   const breakpoints = [
//     { cLow: 0.0, cHigh: 12.0, aqiLow: 0, aqiHigh: 50 },
//     { cLow: 12.1, cHigh: 35.4, aqiLow: 51, aqiHigh: 100 },
//     { cLow: 35.5, cHigh: 55.4, aqiLow: 101, aqiHigh: 150 },
//     { cLow: 55.5, cHigh: 150.4, aqiLow: 151, aqiHigh: 200 },
//     { cLow: 150.5, cHigh: 250.4, aqiLow: 201, aqiHigh: 300 },
//     { cLow: 250.5, cHigh: 350.4, aqiLow: 301, aqiHigh: 400 },
//     { cLow: 350.5, cHigh: 500.4, aqiLow: 401, aqiHigh: 500 }
//   ];
//   for (const bp of breakpoints) {
//     if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
//       const aqi = ((bp.aqiHigh - bp.aqiLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.aqiLow;
//       return Math.round(aqi);
//     }
//   }
//   return 500;
// }
//
// function calculatePM10AQI(pm10: number): number {
//   const breakpoints = [
//     { cLow: 0, cHigh: 54, aqiLow: 0, aqiHigh: 50 },
//     { cLow: 55, cHigh: 154, aqiLow: 51, aqiHigh: 100 },
//     { cLow: 155, cHigh: 254, aqiLow: 101, aqiHigh: 150 },
//     { cLow: 255, cHigh: 354, aqiLow: 151, aqiHigh: 200 },
//     { cLow: 355, cHigh: 424, aqiLow: 201, aqiHigh: 300 },
//     { cLow: 425, cHigh: 504, aqiLow: 301, aqiHigh: 400 },
//     { cLow: 505, cHigh: 604, aqiLow: 401, aqiHigh: 500 }
//   ];
//   for (const bp of breakpoints) {
//     if (pm10 >= bp.cLow && pm10 <= bp.cHigh) {
//       const aqi = ((bp.aqiHigh - bp.aqiLow) / (bp.cHigh - bp.cLow)) * (pm10 - bp.cLow) + bp.aqiLow;
//       return Math.round(aqi);
//     }
//   }
//   return 500;
// }
