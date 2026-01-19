import 'server-only'

/**
 * Server-side weather data fetching
 *
 * PERFORMANCE: Fetching weather data on the server allows:
 * 1. Faster LCP - data is streamed with the initial HTML
 * 2. Better caching - server responses can be cached at edge
 * 3. Smaller client bundle - no weather fetching code needed on client
 */

export interface ServerWeatherData {
  location: string
  temperature: number
  unit: string
  condition: string
  description: string
  humidity: number
  wind: {
    speed: number
    direction: string
    gust: number | null
  }
  coordinates: {
    lat: number
    lon: number
  }
  country?: string
  sunrise?: string
  sunset?: string
  uvIndex?: number
  pressure?: string
  moonPhase?: {
    phase: string
    illumination: number
  }
  forecast?: Array<{
    date: string
    high: number
    low: number
    condition: string
    description: string
    icon: string
    pop: number
    humidity: number
    wind: {
      speed: number
      direction: string
      gust: number | null
    }
  }>
  hourlyForecast?: Array<{
    time: string
    temp: number
    condition: string
    icon: string
    pop: number
  }>
}

export async function fetchWeatherDataServer(
  lat?: number,
  lon?: number,
  city?: string
): Promise<ServerWeatherData | null> {
  try {
    const params = new URLSearchParams()
    if (lat !== undefined && lon !== undefined) {
      params.set('lat', lat.toString())
      params.set('lon', lon.toString())
    } else if (city) {
      params.set('city', city)
    } else {
      // No location provided
      return null
    }

    // Use internal API route to keep API keys on server
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const response = await fetch(
      `${baseUrl}/api/weather/current?${params}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) {
      console.error('[weather-server] API error:', response.status)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[weather-server] Fetch failed:', error)
    return null
  }
}

/**
 * Get weather for a specific city by name
 * Used for SSR when city is in URL params
 */
export async function getWeatherByCity(city: string): Promise<ServerWeatherData | null> {
  return fetchWeatherDataServer(undefined, undefined, city)
}

/**
 * Get weather for coordinates
 * Used when we have lat/lon from geolocation
 */
export async function getWeatherByCoords(lat: number, lon: number): Promise<ServerWeatherData | null> {
  return fetchWeatherDataServer(lat, lon)
}
