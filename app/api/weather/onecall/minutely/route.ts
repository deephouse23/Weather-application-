import { NextRequest, NextResponse } from 'next/server'
import { rateLimitRequest } from '@/lib/services/weather-rate-limiter'

export const runtime = 'nodejs'

// GET /api/weather/onecall/minutely?lat=..&lon=..&units=metric|imperial
export async function GET(request: NextRequest) {
  try {
    // Check rate limit first
    const rateLimit = await rateLimitRequest(request)
    if (!rateLimit.allowed) {
      return rateLimit.response
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

    const sp = request.nextUrl.searchParams
    const lat = sp.get('lat')
    const lon = sp.get('lon')
    const units = sp.get('units') || 'imperial'
    if (!lat || !lon) return NextResponse.json({ error: 'Missing lat/lon' }, { status: 400 })

    const url = new URL('https://api.openweathermap.org/data/3.0/onecall')
    url.searchParams.set('lat', lat)
    url.searchParams.set('lon', lon)
    url.searchParams.set('units', units)
    url.searchParams.set('exclude', 'current,hourly,daily,alerts')
    url.searchParams.set('appid', apiKey)

    const res = await fetch(url.toString(), {
      cache: 'no-store',
      headers: { 'User-Agent': '16-Bit-Weather/onecall-minutely' },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      if (res.status === 401) {
        console.error('OneCall minutely 401')
        return NextResponse.json({ error: 'Unauthorized', detail: text }, { status: res.status })
      }
      if (res.status === 429) {
        console.warn('OneCall minutely 429')
        return NextResponse.json({ error: 'Too Many Requests', detail: text }, { status: res.status })
      }
      return NextResponse.json({ error: 'Upstream error', detail: text }, { status: res.status })
    }

    const data = await res.json()
    // Only return minutely array for smaller payload
    return NextResponse.json({ lat, lon, units, minutely: data.minutely || [] }, {
      headers: { 
        'Cache-Control': 'public, max-age=30, s-maxage=30',
        ...rateLimit.headers 
      }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


