"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWeatherData } from '@/lib/weather-api'
import { WeatherData } from '@/lib/types'
import PageWrapper from '@/components/page-wrapper'
import WeatherSearch from '@/components/weather-search'
import { useTheme } from '@/components/theme-provider'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LazyEnvironmentalDisplay, LazyForecast, LazyForecastDetails } from '@/components/lazy-weather-components'
import { ResponsiveContainer, ResponsiveGrid } from '@/components/responsive-container'
import { useLocationContext } from '@/components/location-context'


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
}

export default function CityWeatherClient({ city, citySlug }: CityWeatherClientProps) {
  const router = useRouter()
  const { theme } = useTheme()
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
      
      console.log(`Loading weather for city: ${city.name}, ${city.state} (${city.searchTerm})`)
      
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.REACT_APP_OPENWEATHER_API_KEY
      if (!API_KEY) {
        throw new Error('API key not configured')
      }
      
      const weatherData = await fetchWeatherData(city.searchTerm, API_KEY)
      console.log(`Weather data loaded for ${city.name}:`, weatherData.location)
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
    // also clear any location input stored in context if desired
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
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.REACT_APP_OPENWEATHER_API_KEY
      
      if (!API_KEY) {
        throw new Error('API key not configured')
      }
      
      const { fetchWeatherByLocation } = await import('@/lib/weather-api')
      const weatherData = await fetchWeatherByLocation(`${latitude},${longitude}`)
      setWeather(weatherData)
    } catch (err) {
      console.error("Location error:", err)
      setError(err instanceof Error ? err.message : "Failed to get your location")
    } finally {
      setLoading(false)
    }
  }

  const handleDayClick = (index: number) => {
    setSelectedDay(selectedDay === index ? null : index)
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

          {/* Weather Display - Same as homepage */}
          {weather && !loading && !error && (
            <div className="space-y-4 sm:space-y-6">
              {/* Current Weather - Same styling as homepage */}
              <ResponsiveGrid cols={{ sm: 1, md: 3 }} className="gap-4">
                {/* Temperature Box */}
                <div className="p-4 rounded-lg text-center border-2 shadow-lg bg-weather-bg-elev border-weather-border">
                  <h2 className="text-xl font-semibold mb-2 text-weather-primary">Temperature</h2>
                  <p className="text-3xl font-bold text-weather-text">{weather.temperature}{weather.unit}</p>
                </div>

                {/* Conditions Box */}
                <div className="p-4 rounded-lg text-center border-2 shadow-lg bg-weather-bg-elev border-weather-border">
                  <h2 className="text-xl font-semibold mb-2 text-weather-primary">Conditions</h2>
                  <p className="text-lg text-weather-text">{weather.condition}</p>
                  <p className="text-sm text-weather-muted">{weather.description}</p>
                </div>

                {/* Wind Box */}
                <div className="p-4 rounded-lg text-center border-2 shadow-lg bg-weather-bg-elev border-weather-border">
                  <h2 className="text-xl font-semibold mb-2 text-weather-primary">Wind</h2>
                  <p className="text-lg text-weather-text">
                    {weather.wind.direction ? `${weather.wind.direction} ` : ''}
                    {weather.wind.speed} mph
                    {weather.wind.gust ? ` (gusts ${weather.wind.gust} mph)` : ''}
                  </p>
                </div>
              </ResponsiveGrid>

              {/* AQI and Pollen Count - Using Lazy Loaded Shared Components */}
              <LazyEnvironmentalDisplay weather={weather} theme={theme || 'dark'} />

              {/* Forecast Components - Lazy Loaded */}
              <LazyForecast 
                forecast={weather.forecast.map(day => ({
                  ...day,
                  country: weather.country
                }))} 
                theme={theme || 'dark'}
                onDayClick={handleDayClick}
                selectedDay={selectedDay}
              />

              <LazyForecastDetails 
                forecast={weather.forecast.map(day => ({
                  ...day,
                  country: weather.country
                }))} 
                theme={theme || 'dark'}
                selectedDay={selectedDay}
                currentWeatherData={{
                  humidity: weather.humidity,
                  wind: weather.wind,
                  pressure: weather.pressure,
                  uvIndex: weather.uvIndex,
                  sunrise: weather.sunrise,
                  sunset: weather.sunset
                }}
              />
            </div>
          )}

          {/* SEO Content Section - Added below weather display */}
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
        </ResponsiveContainer>
      </div>
    </PageWrapper>
  )
}