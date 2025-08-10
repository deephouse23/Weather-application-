/**
 * 16-Bit Weather Platform - BETA v0.3.2
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

import { NextRequest, NextResponse } from 'next/server'

const GEO_URL = 'https://api.openweathermap.org/geo/1.0'

export async function GET(request: NextRequest) {
  try {
    // Get API key from server-side environment
    const apiKey = process.env.OPENWEATHER_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenWeather API key not configured' },
        { status: 500 }
      )
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q') // Direct geocoding query (city, state, country)
    const zip = searchParams.get('zip') // ZIP code query
    const limit = searchParams.get('limit') || '1'

    // Validate parameters - either q or zip must be provided
    if (!q && !zip) {
      return NextResponse.json(
        { error: 'Missing required parameter: either q (location query) or zip (ZIP code)' },
        { status: 400 }
      )
    }

    let geocodingUrl: string

    if (zip) {
      // ZIP code geocoding
      geocodingUrl = `${GEO_URL}/zip?zip=${encodeURIComponent(zip)}&appid=${apiKey}`
    } else {
      // Direct geocoding
      const limitNum = parseInt(limit, 10)
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 5) {
        return NextResponse.json(
          { error: 'Limit must be a number between 1 and 5' },
          { status: 400 }
        )
      }
      
      geocodingUrl = `${GEO_URL}/direct?q=${encodeURIComponent(q!)}&limit=${limitNum}&appid=${apiKey}`
    }

    // Make request to OpenWeatherMap Geocoding API
    const response = await fetch(geocodingUrl)
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenWeatherMap geocoding API error:', response.status, errorData)
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Location not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: `Geocoding service unavailable: ${response.status}` },
        { status: response.status }
      )
    }

    const geocodingData = await response.json()
    
    // Return the geocoding data
    return NextResponse.json(geocodingData)

  } catch (error) {
    console.error('Geocoding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}