"use client"

import { useEffect, useState } from 'react'
import { fetchWeatherData } from '@/lib/weather-api'
import { WeatherData } from '@/lib/types'
import PageWrapper from '@/components/page-wrapper'
import WeatherSearch from '@/components/weather-search'
import Forecast from '@/components/forecast'
import ForecastDetails from '@/components/forecast-details'
import { useTheme } from '@/components/theme-provider'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const { theme } = useTheme()
  
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false)

  // Silent auto-location function for city pages
  const tryAutoLocation = async () => {
    if (!navigator.geolocation || hasAutoLoaded) {
      return
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        })
      })

      const { latitude, longitude } = position.coords
      console.log("City page auto-location coordinates:", { latitude, longitude })

      setLoading(true)
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.REACT_APP_OPENWEATHER_API_KEY
      if (!API_KEY) {
        throw new Error('API key not configured')
      }
      
      const { fetchWeatherByLocation } = await import('@/lib/weather-api')
      const weatherData = await fetchWeatherByLocation(`${latitude},${longitude}`)
      
      if (weatherData) {
        setWeather(weatherData)
        setHasAutoLoaded(true)
      }
    } catch (error) {
      console.log("City page auto-location failed silently:", error)
      // Fall back to loading the city-specific weather
      loadCityWeather()
    } finally {
      setLoading(false)
    }
  }

  // Load weather data for the city on mount
  const loadCityWeather = async () => {
    try {
      setLoading(true)
      setError("")
      
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.REACT_APP_OPENWEATHER_API_KEY
      if (!API_KEY) {
        throw new Error('API key not configured')
      }
      
      const weatherData = await fetchWeatherData(city.searchTerm, API_KEY)
      setWeather(weatherData)
    } catch (err) {
      console.error('Error loading city weather:', err)
      setError(err instanceof Error ? err.message : 'Failed to load weather data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (city) {
      // Try auto-location first, fall back to city weather if it fails
      tryAutoLocation()
    }
  }, [city?.searchTerm, hasAutoLoaded])

  // Search handler for the search component
  const handleSearch = async (locationInput: string) => {
    try {
      setLoading(true)
      setError("")
      
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.REACT_APP_OPENWEATHER_API_KEY
      if (!API_KEY) {
        throw new Error('API key not configured')
      }
      
      const weatherData = await fetchWeatherData(locationInput, API_KEY)
      setWeather(weatherData)
    } catch (err) {
      console.error('Error searching weather:', err)
      setError(err instanceof Error ? err.message : 'Failed to load weather data')
    } finally {
      setLoading(false)
    }
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
      <div className={cn(
        "min-h-screen",
        theme === "dark" && "bg-gradient-to-b from-gray-900 to-black",
        theme === "miami" && "bg-gradient-to-b from-pink-900 to-purple-900",
        theme === "tron" && "bg-gradient-to-b from-black to-blue-900"
      )}>
        <div className="container mx-auto px-4 py-8">
          
          {/* City Header */}
          <div className="text-center mb-6">
            <h1 className={cn(
              "text-2xl md:text-3xl font-bold uppercase tracking-wider font-mono mb-2",
              theme === "dark" && "text-[#00d4ff]",
              theme === "miami" && "text-[#ff1493]", 
              theme === "tron" && "text-[#00FFFF]"
            )}>
              {city.name}, {city.state} WEATHER
            </h1>
          </div>

          {/* Weather Search Component */}
          <WeatherSearch
            onSearch={handleSearch}
            onLocationSearch={handleLocationSearch}
            isLoading={loading}
            error={error}
            rateLimitError=""
            isDisabled={false}
            theme={theme}
            hideLocationButton={true}
          />

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center mt-8">
              <Loader2 className={cn(
                "h-8 w-8 animate-spin",
                theme === "dark" && "text-blue-500",
                theme === "miami" && "text-pink-500",
                theme === "tron" && "text-cyan-500"
              )} />
              <span className="ml-2 text-white">Loading weather data...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-red-500 text-center mt-4">
              {error}
            </div>
          )}

          {/* Weather Display - Same as homepage */}
          {weather && !loading && !error && (
            <div className="space-y-4 sm:space-y-6">
              {/* Current Weather - Same styling as homepage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Temperature Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-[#0f0f0f] border-[#00d4ff]",
                  theme === "miami" && "bg-[#0a0025] border-[#ff1493]",
                  theme === "tron" && "bg-black border-[#00FFFF]"
                )}>
                  <h2 className={cn(
                    "text-xl font-semibold mb-2",
                    theme === "dark" && "text-[#00d4ff]",
                    theme === "miami" && "text-[#ff1493]",
                    theme === "tron" && "text-[#00FFFF]"
                  )}>Temperature</h2>
                  <p className="text-3xl font-bold text-white">{weather.temperature}{weather.unit}</p>
                </div>

                {/* Conditions Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-[#0f0f0f] border-[#00d4ff]",
                  theme === "miami" && "bg-[#0a0025] border-[#ff1493]",
                  theme === "tron" && "bg-black border-[#00FFFF]"
                )}>
                  <h2 className={cn(
                    "text-xl font-semibold mb-2",
                    theme === "dark" && "text-[#00d4ff]",
                    theme === "miami" && "text-[#ff1493]",
                    theme === "tron" && "text-[#00FFFF]"
                  )}>Conditions</h2>
                  <p className="text-lg text-white">{weather.condition}</p>
                  <p className="text-sm text-gray-300">{weather.description}</p>
                </div>

                {/* Wind Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-[#0f0f0f] border-[#00d4ff]",
                  theme === "miami" && "bg-[#0a0025] border-[#ff1493]",
                  theme === "tron" && "bg-black border-[#00FFFF]"
                )}>
                  <h2 className={cn(
                    "text-xl font-semibold mb-2",
                    theme === "dark" && "text-[#00d4ff]",
                    theme === "miami" && "text-[#ff1493]",
                    theme === "tron" && "text-[#00FFFF]"
                  )}>Wind</h2>
                  <p className="text-lg text-white">
                    {weather.wind.direction ? `${weather.wind.direction} ` : ''}
                    {weather.wind.speed} mph
                    {weather.wind.gust ? ` (gusts ${weather.wind.gust} mph)` : ''}
                  </p>
                </div>
              </div>

              {/* Forecast Components - Same as homepage */}
              <Forecast 
                forecast={weather.forecast.map(day => ({
                  ...day,
                  country: weather.country
                }))} 
                theme={theme}
                onDayClick={handleDayClick}
                selectedDay={selectedDay}
              />

              <ForecastDetails 
                forecast={weather.forecast.map(day => ({
                  ...day,
                  country: weather.country
                }))} 
                theme={theme}
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
          <div className={cn(
            "mt-12 p-6 border-2 rounded-lg",
            theme === "dark" && "bg-[#0f0f0f] border-[#00d4ff] text-[#e0e0e0]",
            theme === "miami" && "bg-[#0a0025] border-[#ff1493] text-[#00ffff]",
            theme === "tron" && "bg-black border-[#00FFFF] text-white"
          )}>
            <h2 className={cn(
              "text-xl font-bold mb-4 uppercase tracking-wider font-mono",
              theme === "dark" && "text-[#00d4ff]",
              theme === "miami" && "text-[#ff1493]",
              theme === "tron" && "text-[#00FFFF]"
            )}>
              About {city.name} Weather
            </h2>
            
            <div className="space-y-4 text-sm leading-relaxed font-mono">
              <p>{city.content.intro}</p>
              <p>{city.content.climate}</p>
              <p>{city.content.patterns}</p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}