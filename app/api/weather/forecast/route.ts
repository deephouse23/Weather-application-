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

import { NextRequest, NextResponse } from 'next/server'
import { rateLimitRequest } from '@/lib/services/weather-rate-limiter'

const BASE_URL = 'https://api.openweathermap.org/data/2.5'

export async function GET(request: NextRequest) {
  try {
    // Check rate limit first
    const rateLimit = await rateLimitRequest(request)
    if (!rateLimit.allowed) {
      return rateLimit.response
    }

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
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const units = searchParams.get('units') || 'imperial'

    // Validate required parameters
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon' },
        { status: 400 }
      )
    }

    // Validate coordinates
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates provided' },
        { status: 400 }
      )
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Coordinates out of valid range' },
        { status: 400 }
      )
    }

    // Make request to OpenWeatherMap API
    const forecastUrl = `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}`
    
    const response = await fetch(forecastUrl)
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenWeatherMap forecast API error:', response.status, errorData)
      
      return NextResponse.json(
        { error: `Forecast service unavailable: ${response.status}` },
        { status: response.status }
      )
    }

    const forecastData = await response.json()
    
    // Return the forecast data with rate limit headers
    return NextResponse.json(forecastData, { headers: rateLimit.headers })

  } catch (error) {
    console.error('Forecast API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}