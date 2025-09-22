import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Proxy OpenWeather map tiles with optional time parameter
// GET /api/weather/radar/{layer}/{time?}/{z}/{x}/{y}
// Examples:
// /api/weather/radar/precipitation_new/10/163/395/598
// /api/weather/radar/precipitation_new/163/395/598  (no time)

const LAYER_MAP: Record<string, string> = {
  precipitation_new: 'precipitation_new',
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
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
  if (!apiKey) {
    return new NextResponse('API key not configured', { status: 500 })
  }

  const { layer, tile } = params
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
    })

    if (!response.ok) {
      if (response.status === 401) return new NextResponse('Invalid API key', { status: 401 })
      if (response.status === 429) return new NextResponse('Rate limit exceeded', { status: 429 })
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
    const headers = new Headers({
      'Content-Type': 'image/png',
      // cache 10 minutes on edge, allow SWR
      'Cache-Control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=300',
      'Access-Control-Allow-Origin': '*',
    })
    return new NextResponse(buf, { headers })
  } catch (e) {
    const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    return new NextResponse(transparentPng, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=60',
      },
    })
  }
}
