/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */

/**
 * API Route for Temperature Extremes
 * Version 0.3.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { HOT_LOCATIONS, COLD_LOCATIONS, LOCATION_FACTS, HISTORICAL_AVERAGES } from '@/lib/extremes/extremes-data';

interface LocationTemperature {
  name: string;
  country: string;
  lat: number;
  lon: number;
  emoji: string;
  temp: number;
  tempC: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  fact?: string;
  historicalAvg?: { summer: number; winter: number };
  lastUpdated: number;
}

/**
 * Fetch temperature data for a specific location using server-side API
 */
async function fetchLocationTemperature(
  location: typeof HOT_LOCATIONS[0],
  apiKey: string
): Promise<LocationTemperature | null> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=imperial&appid=${apiKey}`,
      { next: { revalidate: 1800 } } // Cache for 30 minutes
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch ${location.name}:`, response.status);
      return null;
    }
    
    const data = await response.json();
    
    return {
      name: location.name,
      country: location.country,
      lat: location.lat,
      lon: location.lon,
      emoji: location.emoji,
      temp: Math.round(data.main.temp),
      tempC: Math.round((data.main.temp - 32) * 5/9),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      fact: LOCATION_FACTS[location.name],
      historicalAvg: HISTORICAL_AVERAGES[location.name],
      lastUpdated: Date.now()
    };
  } catch (error) {
    console.error(`Error fetching ${location.name}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get API key from server-side environment (without NEXT_PUBLIC_ prefix)
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      console.error('OpenWeatherMap API key not configured in environment variables');
      return NextResponse.json(
        { error: 'OpenWeatherMap API key not configured' },
        { status: 500 }
      );
    }
    
    // Get user coordinates from query params (optional)
    const searchParams = request.nextUrl.searchParams;
    const userLat = searchParams.get('lat');
    const userLon = searchParams.get('lon');
    
    // Fetch all hot locations
    const hotPromises = HOT_LOCATIONS.map(loc => fetchLocationTemperature(loc, apiKey));
    const hotResults = await Promise.all(hotPromises);
    const validHotResults = hotResults.filter(r => r !== null) as LocationTemperature[];
    
    // Fetch all cold locations
    const coldPromises = COLD_LOCATIONS.map(loc => fetchLocationTemperature(loc, apiKey));
    const coldResults = await Promise.all(coldPromises);
    const validColdResults = coldResults.filter(r => r !== null) as LocationTemperature[];
    
    // Sort by temperature
    validHotResults.sort((a, b) => b.temp - a.temp);
    validColdResults.sort((a, b) => a.temp - b.temp);
    
    // Get user location temperature if provided
    let userLocation;
    if (userLat !== undefined && userLon !== undefined) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${userLat}&lon=${userLon}&units=imperial&appid=${apiKey}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const userTemp = Math.round(data.main.temp);
          
          // Calculate global rank
          const allTemps = [...validHotResults, ...validColdResults]
            .map(l => l.temp)
            .sort((a, b) => b - a);
          
          const globalRank = allTemps.findIndex(t => t <= userTemp) + 1;
          
          userLocation = {
            temp: userTemp,
            tempC: Math.round((userTemp - 32) * 5/9),
            globalRank,
            totalLocations: allTemps.length
          };
        }
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    }
    
    const extremesData = {
      hottest: validHotResults[0],
      coldest: validColdResults[0],
      topHot: validHotResults.slice(0, 5),
      topCold: validColdResults.slice(0, 5),
      userLocation,
      lastUpdated: Date.now()
    };
    
    return NextResponse.json(extremesData);
    
  } catch (error) {
    console.error('Error in extremes API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch extreme temperatures', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
