import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Proxy OpenWeather map tiles with optional time parameter
// GET /api/weather/radar/{layer}/{time?}/{z}/{x}/{y}
// Examples:
// /api/weather/radar/precipitation_new/10/163/395/598
// /api/weather/radar/precipitation_new/163/395/598  (no time)

const LAYER_MAP: Record<string, string> = {
  // precipitation_new removed - use NOAA MRMS via WMS instead
  // OpenWeather free tier doesn't support time-series animation
  clouds_new: 'clouds_new',
  wind_new: 'wind_new',
  pressure_new: 'pressure_new',
  temp_new: 'temp_new',
}

export async function GET(
  request: Request,
  context: any
) {
  const { params } = context as { params: { layer: string; tile: string[] } }
  // Try both server-side and client-side env var names
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
  if (!apiKey) {
    console.error('[Radar Proxy] API key not found. Checked OPENWEATHER_API_KEY and NEXT_PUBLIC_OPENWEATHER_API_KEY')
    return new NextResponse('API key not configured', { status: 500 })
  }

  const { layer, tile } = params
  
  // Early return for unsupported precipitation layer
  if (layer === 'precipitation_new') {
    return new NextResponse(
      JSON.stringify({ 
        error: 'precipitation_new removed - use NOAA MRMS via WMS',
        message: 'OpenWeather radar replaced with NOAA MRMS for higher quality'
      }), 
      { 
        status: 410, // 410 Gone - resource permanently removed
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  
  const mapped = LAYER_MAP[layer]
  if (!mapped) {
    return new NextResponse('Unsupported layer', { status: 400 })
  }

  // tile may be [time, z, x, y] or [z, x, y]
  let time: string | undefined
  let z: string, x: string, y: string
  if (tile.length === 4) {
    ;[time, z, x, y] = tile
  } else if (tile.length === 3) {
    ;[z, x, y] = tile as [string, string, string]
  } else {
    return new NextResponse('Invalid tile path', { status: 400 })
  }

  const base = 'https://tile.openweathermap.org/map'
  const path = time
    ? `${mapped}/${time}/${z}/${x}/${y}.png`
    : `${mapped}/${z}/${x}/${y}.png`
  const url = `${base}/${path}?appid=${apiKey}`

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': '16-Bit-Weather/radar-proxy' },
      // Timeouts via AbortSignal timeout; keep short for "now" tiles
      // @ts-ignore
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Radar proxy 401 Unauthorized', { layer: mapped, path })
        return new NextResponse('Invalid API key', { status: 401 })
      }
      if (response.status === 429) {
        console.warn('Radar proxy 429 Rate limited', { layer: mapped, path })
        return new NextResponse('Rate limit exceeded', { status: 429 })
      }
      // transparent 1x1 png
      const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
      return new NextResponse(transparentPng, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=60',
        },
      })
    }

    const buf = await response.arrayBuffer()
    // Adaptive caching: short TTL for now-frame, longer for past frames
    const isNowFrame = !time || Math.abs(Date.now() - Number(time)) < 15 * 60 * 1000
    const headers = new Headers({
      'Content-Type': 'image/png',
      'Cache-Control': isNowFrame
        ? 'public, max-age=60, s-maxage=60, stale-while-revalidate=60'
        : 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=1800',
      'Access-Control-Allow-Origin': '*',
    })
    return new NextResponse(buf, { headers })
  } catch (e) {
    console.error('Radar proxy fetch error', { layer: mapped, path, error: String(e) })
    const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    return new NextResponse(transparentPng, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=30',
      },
    })
  }
}
