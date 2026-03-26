/**
 * 16-Bit Weather Platform - Vibe Check API Route
 *
 * Returns comfort score for current conditions + 7-day forecast.
 * Proxies through internal onecall route to reuse rate limiting.
 */

import { NextRequest, NextResponse } from 'next/server'
import { calculateVibeScore, type VibeInput } from '@/lib/services/vibe-check'

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Missing required parameters: lat, lon' }, { status: 400 })
    }

    // Use internal onecall route
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/weather/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,alerts`
    const response = await fetch(url)

    if (!response.ok) {
      console.error('[Vibe API] OneCall failed:', response.status)
      return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 502 })
    }

    const data = await response.json()

    // Current vibe
    const currentInput: VibeInput = {
      tempF: data.current?.temp ?? 72,
      humidity: data.current?.humidity ?? 50,
      windMph: data.current?.wind_speed ?? 5,
      precipChance: (data.hourly?.[0]?.pop ?? 0) * 100,
      uvIndex: data.current?.uvi ?? 3,
      cloudCover: data.current?.clouds ?? 20,
    }
    const current = calculateVibeScore(currentInput)

    // 7-day forecast vibes
    const daily = (data.daily ?? []).slice(0, 7).map((day: {
      dt: number
      temp: { max: number; min: number }
      humidity: number
      wind_speed: number
      pop: number
      uvi: number
      clouds: number
      weather: Array<{ main: string; description: string; icon: string }>
    }) => {
      const avgTemp = (day.temp.max + day.temp.min) / 2
      const input: VibeInput = {
        tempF: avgTemp,
        humidity: day.humidity ?? 50,
        windMph: day.wind_speed ?? 5,
        precipChance: (day.pop ?? 0) * 100,
        uvIndex: day.uvi ?? 3,
        cloudCover: day.clouds ?? 20,
      }
      const vibe = calculateVibeScore(input)
      return {
        dt: day.dt,
        highTemp: Math.round(day.temp.max),
        lowTemp: Math.round(day.temp.min),
        condition: day.weather?.[0]?.main ?? 'Clear',
        icon: day.weather?.[0]?.icon ?? '01d',
        ...vibe,
      }
    })

    // Find best day
    const bestDay = daily.reduce((best: { score: number; dt: number } | null, day: { score: number; dt: number }) =>
      !best || day.score > best.score ? day : best,
    null)

    return NextResponse.json({
      current,
      daily,
      bestDay,
      location: data.timezone ?? '',
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=60' },
    })
  } catch (error) {
    console.error('[Vibe API]', error)
    return NextResponse.json({ error: 'Failed to compute vibe check' }, { status: 500 })
  }
}
