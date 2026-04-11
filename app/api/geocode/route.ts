import { sanitizeLogValue } from "@/lib/sanitize-log"
/**
 * 16-Bit Weather Platform - Dashboard Geocoding API Route
 *
 * Parallel geocoding route used by the dashboard "Add Location" modal.
 * Direct + ZIP only (no reverse). Backed by Open-Meteo + Zippopotam.us,
 * no API key required. Response shape matches legacy OpenWeatherMap
 * `/geo/1.0/direct` output so the caller at
 * components/dashboard/add-location-modal.tsx does not need to change.
 */

import { NextRequest, NextResponse } from 'next/server'
import { toStateAbbr } from '@/lib/us-states'
import type { GeocodingResponse } from '@/lib/weather'

const OPEN_METEO_GEO = 'https://geocoding-api.open-meteo.com/v1/search'
const ZIPPOPOTAM = 'https://api.zippopotam.us'

interface OpenMeteoGeoResult {
  name: string
  latitude: number
  longitude: number
  country_code?: string
  admin1?: string
}

interface OpenMeteoGeoResponse {
  results?: OpenMeteoGeoResult[]
}

interface ZippopotamPlace {
  'place name': string
  latitude: string
  longitude: string
  'state abbreviation': string
}

interface ZippopotamResponse {
  places: ZippopotamPlace[]
}

const mapOpenMeteoResult = (r: OpenMeteoGeoResult): GeocodingResponse => {
  const country = (r.country_code || '').toUpperCase() || 'XX'
  const stateAbbr = country === 'US' ? (toStateAbbr(r.admin1) ?? r.admin1) : r.admin1
  return {
    name: r.name,
    lat: r.latitude,
    lon: r.longitude,
    country,
    ...(stateAbbr ? { state: stateAbbr } : {}),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limitRaw = searchParams.get('limit') || '1'

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    const limit = Math.max(1, Math.min(5, parseInt(limitRaw, 10) || 1))
    const trimmed = query.trim()

    // ZIP fast path (US 5-digit).
    if (/^\d{5}$/.test(trimmed)) {
      try {
        const res = await fetch(`${ZIPPOPOTAM}/us/${trimmed}`, {
          next: { revalidate: 86400 },
        })
        if (res.ok) {
          const data = (await res.json()) as ZippopotamResponse
          const place = data.places?.[0]
          if (place) {
            const result: GeocodingResponse[] = [{
              name: place['place name'],
              lat: parseFloat(place.latitude),
              lon: parseFloat(place.longitude),
              country: 'US',
              state: place['state abbreviation'],
            }]
            return NextResponse.json(result)
          }
        }
      } catch (err) {
        console.error('ZIP lookup error:', sanitizeLogValue(err instanceof Error ? err.message : err))
        // Fall through to direct search.
      }
    }

    // Direct search via Open-Meteo.
    const parts = trimmed.split(',').map((s) => s.trim()).filter(Boolean)
    const name = parts[0] || trimmed
    const filterHint = parts[1]?.toUpperCase() || null

    const url = `${OPEN_METEO_GEO}?name=${encodeURIComponent(name)}&count=10&language=en&format=json`
    const res = await fetch(url, { next: { revalidate: 3600 } })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Geocoding service error: ${res.status}` },
        { status: 502 }
      )
    }

    const data = (await res.json()) as OpenMeteoGeoResponse
    let results = data.results || []

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Location not found. Please try a different search term.' },
        { status: 404 }
      )
    }

    if (filterHint) {
      const filtered = results.filter((r) => {
        const stateAbbr = toStateAbbr(r.admin1)
        if (stateAbbr && stateAbbr === filterHint) return true
        if (r.admin1?.toUpperCase() === filterHint) return true
        if (r.country_code?.toUpperCase() === filterHint) return true
        if (filterHint === 'UK' && r.country_code?.toUpperCase() === 'GB') return true
        return false
      })
      if (filtered.length > 0) results = filtered
    }

    const mapped = results.slice(0, limit).map(mapOpenMeteoResult)
    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Dashboard geocoding API error:', error instanceof Error ? error.message : sanitizeLogValue(error))
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
