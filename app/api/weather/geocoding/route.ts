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

const GEO_URL = 'https://api.openweathermap.org/geo/1.0'

interface GeocodingResponse {
  name: string;
  local_names?: { [key: string]: string };
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

// Helper function to try multiple geocoding strategies
// Returns { data, error } to distinguish between "not found" and "API error"
const tryGeocoding = async (queries: string[], apiKey: string, limit: string): Promise<{ data: GeocodingResponse[], error?: { status: number, message: string } }> => {
  let lastError: { status: number, message: string } | undefined

  for (const query of queries) {
    const geocodingUrl = `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${apiKey}`

    const response = await fetch(geocodingUrl)

    if (response.ok) {
      const data = await response.json()

      if (data && data.length > 0) {
        return { data }
      }
      // Empty result - try next query
    } else {
      // Track the error for potential propagation
      // 401/403 errors indicate API key issues and should be reported
      if (response.status === 401 || response.status === 403) {
        console.error(`OpenWeatherMap API auth error: ${response.status} for query "${query}"`)
        lastError = { status: response.status, message: 'OpenWeatherMap API authentication error' }
        // Don't try more queries for auth errors - they'll all fail
        break
      }
      // For other errors (429 rate limit, 500 server error), continue trying
      lastError = { status: response.status, message: `OpenWeatherMap API error: ${response.status}` }
    }
  }

  return { data: [], error: lastError }
}

// US State mapping for fallback queries
const US_STATE_MAPPING: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  'DC': 'District of Columbia'
}

// Generate fallback queries for US locations
const generateFallbackQueries = (originalQuery: string): string[] => {
  const queries = [originalQuery]
  
  // Parse comma-separated input
  if (originalQuery.includes(',')) {
    const parts = originalQuery.split(',').map(p => p.trim())
    
    if (parts.length === 2) {
      const [city, stateOrCountry] = parts
      const stateAbbrev = stateOrCountry.toUpperCase()
      
      // If it's a US state abbreviation, try multiple formats
      if (US_STATE_MAPPING[stateAbbrev]) {
        const fullStateName = US_STATE_MAPPING[stateAbbrev]
        
        // Try with full state name + US
        queries.push(`${city},${fullStateName},US`)
        // Try with just city + US
        queries.push(`${city},US`)
        // Try with just the city
        queries.push(city)
        // Try original with US at the end
        queries.push(`${originalQuery},US`)
      } else {
        // Not a US state, try adding city alone as fallback
        queries.push(city)
      }
    }
  } else {
    // Single word query, try as-is
    // No additional fallbacks needed for simple city names
  }
  
  return queries
}

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

    if (zip) {
      // ZIP code geocoding - this usually works reliably
      const geocodingUrl = `${GEO_URL}/zip?zip=${encodeURIComponent(zip)}&appid=${apiKey}`

      const response = await fetch(geocodingUrl)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('OpenWeatherMap ZIP geocoding API error:', response.status, errorData)
        
        return NextResponse.json(
          { error: 'ZIP code not found' },
          { status: 404 }
        )
      }

      const geocodingData = await response.json()
      return NextResponse.json(geocodingData)
    } else {
      // Direct geocoding with fallback strategies
      const limitNum = parseInt(limit, 10)
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 5) {
        return NextResponse.json(
          { error: 'Limit must be a number between 1 and 5' },
          { status: 400 }
        )
      }
      
      // Generate fallback queries
      const queries = generateFallbackQueries(q!)

      // Try each query in sequence until one works
      const result = await tryGeocoding(queries, apiKey, limit)

      if (!result.data || result.data.length === 0) {
        // If there was an API error (401/403/etc), propagate it
        if (result.error) {
          return NextResponse.json(
            { error: result.error.message },
            { status: result.error.status }
          )
        }
        // Otherwise it's just not found
        return NextResponse.json(
          { error: 'Location not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(result.data)
    }

  } catch (error) {
    console.error('Geocoding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}