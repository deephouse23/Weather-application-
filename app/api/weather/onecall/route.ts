import { NextRequest, NextResponse } from 'next/server'

// One Call 3.0 aggregation endpoint
// GET /api/weather/onecall?lat=..&lon=..&units=metric|imperial[&exclude=parts]
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenWeather API key not configured' }, { status: 500 })
    }

    const sp = request.nextUrl.searchParams
    const lat = sp.get('lat')
    const lon = sp.get('lon')
    const units = sp.get('units') || 'imperial'
    const exclude = sp.get('exclude') || ''

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Missing required parameters: lat, lon' }, { status: 400 })
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return NextResponse.json({ error: 'Invalid coordinates provided' }, { status: 400 })
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: 'Coordinates out of valid range' }, { status: 400 })
    }

    const url = new URL('https://api.openweathermap.org/data/3.0/onecall')
    url.searchParams.set('lat', latitude.toString())
    url.searchParams.set('lon', longitude.toString())
    url.searchParams.set('appid', apiKey)
    url.searchParams.set('units', units)
    if (exclude) url.searchParams.set('exclude', exclude)

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 },
      cache: 'no-store',
      headers: { 'User-Agent': '16-Bit-Weather/onecall' },
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      const status = response.status
      if (status === 400) return NextResponse.json({ error: 'Bad Request', detail: text }, { status })
      if (status === 401) {
        console.error('OneCall 401 Unauthorized')
        return NextResponse.json({ error: 'Unauthorized (API key)', detail: text }, { status })
      }
      if (status === 404) return NextResponse.json({ error: 'Not Found', detail: text }, { status })
      if (status === 429) {
        console.warn('OneCall 429 Rate Limited')
        return NextResponse.json({ error: 'Too Many Requests', detail: text }, { status })
      }
      return NextResponse.json({ error: 'Weather service unavailable', detail: text }, { status })
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


