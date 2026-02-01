/**
 * 16-Bit Weather Platform - Air Quality API v0.3.32
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Primary: Google Air Quality API (https://developers.google.com/maps/documentation/air-quality)
 * Fallback: OpenWeather Air Pollution API
 */

import { NextRequest, NextResponse } from 'next/server'
import { rateLimitRequest } from '@/lib/services/weather-rate-limiter'

// Type definitions for Google Air Quality API responses
interface GoogleAQIIndex {
  code: string;
  aqi: number;
  category?: string;
  displayName?: string;
  dominantPollutant?: string;
}

interface GoogleAQIResponse {
  indexes?: GoogleAQIIndex[];
  healthRecommendations?: {
    generalPopulation?: string;
  };
  pollutants?: unknown[];
}

// Type definitions for OpenWeather API responses
interface OpenWeatherComponents {
  pm2_5?: number;
  pm10?: number;
  o3?: number;
  no2?: number;
  so2?: number;
  co?: number;
}

interface OpenWeatherAirPollutionResponse {
  list?: Array<{
    main?: {
      aqi?: number;
    };
    components?: OpenWeatherComponents;
  }>;
}

const CACHE_DURATION = 600; // 10 minutes

export async function GET(request: NextRequest) {
  try {
    // Check rate limit first
    const rateLimit = await rateLimitRequest(request)
    if (!rateLimit.allowed) {
      return rateLimit.response
    }

    // Get API keys from server-side environment
    const openWeatherApiKey = process.env.OPENWEATHER_API_KEY
    const googleApiKey = process.env.GOOGLE_AIR_QUALITY_API_KEY
    
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

    // PRIMARY: Try Google Air Quality API first
    if (googleApiKey && googleApiKey !== 'your_actual_google_air_quality_key_here') {
      try {
        // Google Air Quality API endpoint
        const googleUrl = 'https://airquality.googleapis.com/v1/currentConditions:lookup'
        
        // Request body according to Google's API documentation
        const requestBody = {
          location: { 
            latitude, 
            longitude 
          },
          extraComputations: [
            "LOCAL_AQI",
            "HEALTH_RECOMMENDATIONS",
            "POLLUTANT_CONCENTRATION",
            "POLLUTANT_ADDITIONAL_INFO"
          ],
          universalAqi: true,
          languageCode: "en",
          customLocalAqis: [
            { 
              regionCode: "US",
              aqi: "usa_epa"  // Request US EPA standard
            }
          ]
        }
        
        // Make request with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(`${googleUrl}?key=${googleApiKey}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        })
        
        clearTimeout(timeout);

        if (response.ok) {
          const data: GoogleAQIResponse = await response.json()
          
          // Process Google's response
          let aqiValue = 0;
          let category = 'No Data';
          let dominantPollutant = null;
          
          // Look for indexes in the response
          if (data.indexes && Array.isArray(data.indexes)) {
            // Priority order: US EPA > Universal AQI > Any available
            const usEpaIndex = data.indexes.find((idx: GoogleAQIIndex) => 
              idx.code === 'usa_epa' || 
              idx.code === 'US_EPA' ||
              idx.displayName?.toLowerCase().includes('us epa')
            );
            
            const universalIndex = data.indexes.find((idx: GoogleAQIIndex) => 
              idx.code === 'uaqi' || 
              idx.displayName?.toLowerCase().includes('universal')
            );
            
            const selectedIndex = usEpaIndex || universalIndex || data.indexes[0];
            
            if (selectedIndex && selectedIndex.aqi) {
              aqiValue = selectedIndex.aqi;
              category = selectedIndex.category || getAQICategory(aqiValue);
              dominantPollutant = selectedIndex.dominantPollutant;
              
              // If using Universal AQI, convert it (Universal is 0-100, higher is better)
              if (!usEpaIndex && universalIndex) {
                // Universal AQI: 100 = excellent, 0 = hazardous
                // EPA AQI: 0 = good, 500 = hazardous
                // Invert and scale
                aqiValue = Math.round((100 - aqiValue) * 3); // Simple conversion
                category = getAQICategory(aqiValue);
              }
              
              // Return Google data with proper source marking
              return NextResponse.json({
                aqi: aqiValue,
                category: category,
                dominantPollutant: dominantPollutant,
                source: 'google',  // ✅ Correctly marked as Google
                indexType: selectedIndex.code || 'google',
                healthRecommendations: data.healthRecommendations?.generalPopulation,
                pollutants: data.pollutants || [],
                debug: {
                  timestamp: new Date().toISOString(),
                  googleIndexUsed: selectedIndex.code,
                  originalValue: selectedIndex.aqi,
                  convertedValue: aqiValue,
                  allIndexes: data.indexes?.map((idx: GoogleAQIIndex) => ({
                    code: idx.code,
                    aqi: idx.aqi,
                    displayName: idx.displayName
                  }))
                }
              }, {
                status: 200,
                headers: {
                  'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
                  'X-AQI-Source': 'google',
                  ...rateLimit.headers
                }
              })
            }
          }
          
          console.warn('⚠️ Google API returned data but no valid AQI indexes found');
          
        } else {
          const errorText = await response.text();
          console.error('❌ Google API request failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
        }
      } catch (error: unknown) {
        console.error('❌ Google Air Quality API error:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'Unknown'
        });
      }
    }

    // FALLBACK: OpenWeather Air Pollution API
    if (!openWeatherApiKey) {
      console.error('❌ No OpenWeather API key for fallback');
      return NextResponse.json(
        { 
          aqi: 0,
          category: 'No Data',
          source: 'error',
          error: 'Air quality service not configured'
        },
        { status: 200 }
      )
    }

    const openWeatherUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}`
    
    const response = await fetch(openWeatherUrl, {
      next: { revalidate: CACHE_DURATION }
    });
    
    if (!response.ok) {
      console.error('❌ OpenWeather API failed:', response.status);
      return NextResponse.json(
        { 
          aqi: 0,
          category: 'No Data',
          source: 'error',
          error: 'Air quality data unavailable'
        },
        { status: 200 }
      )
    }

    const data: OpenWeatherAirPollutionResponse = await response.json()

    // Convert OpenWeather's 1-5 scale to EPA 0-500 scale
    const openWeatherAQI = data.list?.[0]?.main?.aqi || 1
    const components = data.list?.[0]?.components || {}
    
    // Calculate EPA AQI from pollutant concentrations
    let epaAqi = 50; // Default to "Good"
    
    if (components.pm2_5 || components.pm10) {
      const pm25Aqi = calculatePM25AQI(components.pm2_5 || 0);
      const pm10Aqi = calculatePM10AQI(components.pm10 || 0);
      epaAqi = Math.max(pm25Aqi, pm10Aqi);
    } else {
      // Simple conversion from OpenWeather's 1-5 scale
      const conversionMap: { [key: number]: number } = {
        1: 25,   // Good
        2: 75,   // Fair
        3: 125,  // Moderate
        4: 175,  // Poor
        5: 250   // Very Poor
      };
      epaAqi = conversionMap[openWeatherAQI] || 50;
    }
    
    // Return OpenWeather data with proper source marking
    return NextResponse.json({
      aqi: epaAqi,
      category: getAQICategory(epaAqi),
      source: 'openweather',  // ✅ Correctly marked as OpenWeather
      components: {
        pm25: components.pm2_5,
        pm10: components.pm10,
        o3: components.o3,
        no2: components.no2,
        so2: components.so2,
        co: components.co
      },
      debug: {
        timestamp: new Date().toISOString(),
        openWeatherOriginal: openWeatherAQI,
        convertedEPA: epaAqi
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
        'X-AQI-Source': 'openweather',
        ...rateLimit.headers
      }
    })

  } catch (error: unknown) {
    console.error('❌ Air quality API critical error:', error);
    return NextResponse.json(
      { 
        aqi: 0,
        category: 'No Data',
        source: 'error',
        error: 'Service temporarily unavailable'
      },
      { status: 200 }
    )
  }
}

// Calculate AQI from PM2.5 concentration (μg/m³) using EPA formula
function calculatePM25AQI(pm25: number): number {
  // EPA breakpoints for PM2.5
  const breakpoints = [
    { cLow: 0.0, cHigh: 12.0, aqiLow: 0, aqiHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, aqiLow: 51, aqiHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, aqiLow: 101, aqiHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, aqiLow: 151, aqiHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, aqiLow: 201, aqiHigh: 300 },
    { cLow: 250.5, cHigh: 350.4, aqiLow: 301, aqiHigh: 400 },
    { cLow: 350.5, cHigh: 500.4, aqiLow: 401, aqiHigh: 500 }
  ];
  
  for (const bp of breakpoints) {
    if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
      // EPA formula: AQI = ((AQI_high - AQI_low) / (C_high - C_low)) * (C - C_low) + AQI_low
      const aqi = ((bp.aqiHigh - bp.aqiLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.aqiLow;
      return Math.round(aqi);
    }
  }
  
  return 500; // Beyond scale
}

// Calculate AQI from PM10 concentration (μg/m³) using EPA formula
function calculatePM10AQI(pm10: number): number {
  // EPA breakpoints for PM10
  const breakpoints = [
    { cLow: 0, cHigh: 54, aqiLow: 0, aqiHigh: 50 },
    { cLow: 55, cHigh: 154, aqiLow: 51, aqiHigh: 100 },
    { cLow: 155, cHigh: 254, aqiLow: 101, aqiHigh: 150 },
    { cLow: 255, cHigh: 354, aqiLow: 151, aqiHigh: 200 },
    { cLow: 355, cHigh: 424, aqiLow: 201, aqiHigh: 300 },
    { cLow: 425, cHigh: 504, aqiLow: 301, aqiHigh: 400 },
    { cLow: 505, cHigh: 604, aqiLow: 401, aqiHigh: 500 }
  ];
  
  for (const bp of breakpoints) {
    if (pm10 >= bp.cLow && pm10 <= bp.cHigh) {
      // EPA formula
      const aqi = ((bp.aqiHigh - bp.aqiLow) / (bp.cHigh - bp.cLow)) * (pm10 - bp.cLow) + bp.aqiLow;
      return Math.round(aqi);
    }
  }
  
  return 500; // Beyond scale
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