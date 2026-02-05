"use client"

/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 */


import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWeatherData } from '@/lib/weather-api'
import { useAuth } from '@/lib/auth'
import { WeatherData } from '@/lib/types'
import PageWrapper from '@/components/page-wrapper'
import WeatherSearch from '@/components/weather-search'
import { useTheme } from '@/components/theme-provider'
import { Loader2 } from 'lucide-react'
import { ResponsiveContainer } from '@/components/responsive-container'
import { useLocationContext } from '@/components/location-context'
import { WeatherDisplay } from '@/components/weather-display'

interface CityWeatherClientProps {
  city: {
    name: string
    state: string
    searchTerm: string
    title: string
    description: string
    content: {
      intro: string
      climate: string
      patterns: string
    }
  }
  citySlug: string
  isPredefinedCity?: boolean
}

export default function CityWeatherClient({ city, citySlug, isPredefinedCity = false }: CityWeatherClientProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const { preferences } = useAuth()
  const {
    setLocationInput,
    setCurrentLocation,
    clearLocationState,
    setShouldClearOnRouteChange
  } = useLocationContext()

  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [precipitation, setPrecipitation] = useState<{rain24h: number; snow24h: number} | null>(null)

  // Fetch 24h precipitation data when weather loads
  useEffect(() => {
    if (weather?.coordinates) {
      fetch(`/api/weather/precipitation-history?lat=${weather.coordinates.lat}&lon=${weather.coordinates.lon}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => data?.dataAvailable ? setPrecipitation({rain24h: data.rain24h, snow24h: data.snow24h}) : setPrecipitation(null))
        .catch(() => setPrecipitation(null))
    }
  }, [weather?.coordinates?.lat, weather?.coordinates?.lon])

  // Helper: normalize "San Ramon, CA" -> "san-ramon-ca"
  const toSlug = (input: string) =>
    input
      .trim()
      .toLowerCase()
      .replace(/,/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

  // Load weather data for the specific city
  const loadCityWeather = async () => {
    try {
      setLoading(true)
      setError("")

      const unitSystem: 'metric' | 'imperial' = preferences?.temperature_unit === 'celsius' ? 'metric' : 'imperial'
      const weatherData = await fetchWeatherData(city.searchTerm, unitSystem)
      setWeather(weatherData)

      // Update location context with city data
      setLocationInput(city.searchTerm)
      setCurrentLocation(weatherData.location || city.searchTerm)
    } catch (err) {
      console.error('Error loading city weather:', err)
      setError(err instanceof Error ? err.message : 'Failed to load weather data')
    } finally {
      setLoading(false)
    }
  }

  // CLEAR local state whenever the route/citySlug changes (prevents ghost data)
  useEffect(() => {
    setWeather(null)
    setSelectedDay(null)
    setError("")
    // Clear the location context completely to prevent history from carrying over
    clearLocationState()
    // Then set the current city as the location
    setLocationInput(city.searchTerm)
    setCurrentLocation(city.searchTerm)
  }, [citySlug])

  // Existing effect: load weather for this page's city (runs after reset above)
  useEffect(() => {
    setShouldClearOnRouteChange(false)

    if (city) {
      // Load city-specific weather data first (city pages should show city data, not user location)
      loadCityWeather()
    }

    // Cleanup: enable route change clearing when leaving city pages
    return () => {
      setShouldClearOnRouteChange(true)
    }
  }, [city?.searchTerm, setShouldClearOnRouteChange])

  // REPLACE handleSearch to navigate instead of only setting local weather
  const handleSearch = async (locationInput: string) => {
    if (!locationInput?.trim()) return
    const slug = toSlug(locationInput)
    // optional: optimistic UI clear before navigating
    setWeather(null)
    setSelectedDay(null)
    setError("")
    setLocationInput('') // clear search field in context
    router.push(`/weather/${slug}`)
  }

  const handleLocationSearch = async () => {
    // Geolocation functionality - same as main page
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setLoading(true)
    setError("")

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        })
      })

      const { latitude, longitude } = position.coords
      // API key is now handled by internal API routes

      const { fetchWeatherByLocation } = await import('@/lib/weather-api')
      const unitSystem: 'metric' | 'imperial' = preferences?.temperature_unit === 'celsius' ? 'metric' : 'imperial'
      const weatherData = await fetchWeatherByLocation(`${latitude},${longitude}`, unitSystem)
      setWeather(weatherData)
    } catch (err) {
      console.error("Location error:", err)
      setError(err instanceof Error ? err.message : "Failed to get your location")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper
      weatherLocation={weather?.location}
      weatherTemperature={weather?.temperature}
      weatherUnit={weather?.unit}
    >
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-weather-bg">
        <ResponsiveContainer maxWidth="xl" padding="md">

          {/* City Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider font-mono mb-2 text-weather-primary">
              {city.name}, {city.state} WEATHER
            </h1>
          </div>

          {/* Weather Search Component */}
          <WeatherSearch
            key={citySlug}
            onSearch={handleSearch}
            onLocationSearch={handleLocationSearch}
            isLoading={loading}
            error={error}
            rateLimitError=""
            isDisabled={false}
            hideLocationButton={true}
          />

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center mt-8">
              <Loader2 className="h-8 w-8 animate-spin text-weather-primary" />
              <span className="ml-2 text-weather-text">Loading weather data...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-weather-danger text-center mt-4">
              {error}
            </div>
          )}

          {/* Weather Display - Unified with homepage */}
          {weather && !loading && !error && (
            <WeatherDisplay
              weather={weather}
              theme={theme || 'nord'}
              selectedDay={selectedDay}
              onDayClick={(index) => setSelectedDay(selectedDay === index ? null : index)}
              precipitation={precipitation}
              showRadar={true}
            />
          )}

          {/* SEO Content Section - Only show for predefined cities */}
          {isPredefinedCity && (
            <div className="mt-12 p-6 border-2 rounded-lg bg-weather-bg-elev border-weather-border text-weather-text">
              <h2 className="text-xl font-bold mb-4 uppercase tracking-wider font-mono text-weather-primary">
                About {city.name} Weather
              </h2>

              <div className="space-y-4 text-sm leading-relaxed font-mono">
                <p>{city.content.intro}</p>
                <p>{city.content.climate}</p>
                <p>{city.content.patterns}</p>
              </div>
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </PageWrapper>
  )
}
