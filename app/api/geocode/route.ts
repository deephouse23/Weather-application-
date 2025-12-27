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
const tryGeocoding = async (queries: string[], apiKey: string, limit: string): Promise<GeocodingResponse[]> => {
  for (const query of queries) {
    const geocodingUrl = `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${apiKey}`

    const response = await fetch(geocodingUrl)

    if (response.ok) {
      const data = await response.json()

      if (data && data.length > 0) {
        console.log(`✓ Geocoding success with fallback query: "${query}"`)
        return data
      }
    }
    // Try next fallback query if this one failed
  }

  return []
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
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = searchParams.get('limit') || '1'

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      console.error('OPENWEATHER_API_KEY is not configured')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Check if query looks like a US ZIP code (5 digits)
    const isZipCode = /^\d{5}$/.test(query.trim())

    if (isZipCode) {
      // Use ZIP code geocoding endpoint
      const zipUrl = `${GEO_URL}/zip?zip=${query},US&appid=${apiKey}`
      const response = await fetch(zipUrl)

      if (response.ok) {
        const data = await response.json()
        if (data && data.lat && data.lon) {
          // Transform to match the direct geocoding response format
          const result: GeocodingResponse[] = [{
            name: data.name,
            lat: data.lat,
            lon: data.lon,
            country: data.country || 'US',
            state: undefined // ZIP endpoint doesn't return state
          }]
          return NextResponse.json(result)
        }
      }

      // If ZIP lookup failed, try regular geocoding as fallback
      console.log(`ZIP code lookup failed for ${query}, trying city name fallback`)
    }

    // Generate fallback queries
    const queries = generateFallbackQueries(query)

    // Try each query in sequence until one works
    const geocodingData = await tryGeocoding(queries, apiKey, limit)

    if (!geocodingData || geocodingData.length === 0) {
      console.log(`Geocoding failed for all queries: ${queries.join(', ')}`)
      return NextResponse.json(
        { error: 'Location not found. Please try a different search term.' },
        { status: 404 }
      )
    }

    return NextResponse.json(geocodingData)

  } catch (error) {
    console.error('Dashboard geocoding API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}