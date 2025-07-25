"use client"

import { useEffect, useState } from 'react'
import { fetchWeatherData } from '@/lib/weather-api'
import { WeatherData } from '@/lib/types'
import PageWrapper from '@/components/page-wrapper'
import WeatherSearch from '@/components/weather-search'
import { useTheme } from '@/components/theme-provider'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LazyEnvironmentalDisplay, LazyForecast, LazyForecastDetails } from '@/components/lazy-weather-components'
import { ResponsiveContainer, ResponsiveGrid } from '@/components/responsive-container'


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
    } catch (err) {
      console.error('Error loading city weather:', err)
      setError(err instanceof Error ? err.message : 'Failed to load weather data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (city) {
      // Load city-specific weather data first (city pages should show city data, not user location)
      loadCityWeather()
    }
  }, [city?.searchTerm])

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
        <ResponsiveContainer maxWidth="xl" padding="md">
          
          {/* City Header */}
          <div className="text-center mb-6">
            <h1 className={cn(
              "text-2xl md:text-3xl font-bold uppercase tracking-wider font-mono mb-2",
              theme === "dark" && "text-[#00d4ff]",
              theme === "miami" && "text-[#00d4ff]", 
              theme === "tron" && "text-[#00d4ff]"
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
                theme === "tron" && "text-[#00d4ff]"
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
              <ResponsiveGrid cols={{ sm: 1, md: 3 }} className="gap-4">
                {/* Temperature Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-[#0f0f0f] border-[#00d4ff]",
                  theme === "miami" && "bg-[#0a0025] border-[#00d4ff]",
                  theme === "tron" && "bg-black border-[#00d4ff]"
                )}>
                  <h2 className={cn(
                    "text-xl font-semibold mb-2",
                    theme === "dark" && "text-[#00d4ff]",
                    theme === "miami" && "text-[#00d4ff]",
                    theme === "tron" && "text-[#00d4ff]"
                  )}>Temperature</h2>
                  <p className="text-3xl font-bold text-white">{weather.temperature}{weather.unit}</p>
                </div>

                {/* Conditions Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-[#0f0f0f] border-[#00d4ff]",
                  theme === "miami" && "bg-[#0a0025] border-[#00d4ff]",
                  theme === "tron" && "bg-black border-[#00d4ff]"
                )}>
                  <h2 className={cn(
                    "text-xl font-semibold mb-2",
                    theme === "dark" && "text-[#00d4ff]",
                    theme === "miami" && "text-[#00d4ff]",
                    theme === "tron" && "text-[#00d4ff]"
                  )}>Conditions</h2>
                  <p className="text-lg text-white">{weather.condition}</p>
                  <p className="text-sm text-gray-300">{weather.description}</p>
                </div>

                {/* Wind Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-[#0f0f0f] border-[#00d4ff]",
                  theme === "miami" && "bg-[#0a0025] border-[#00d4ff]",
                  theme === "tron" && "bg-black border-[#00d4ff]"
                )}>
                  <h2 className={cn(
                    "text-xl font-semibold mb-2",
                    theme === "dark" && "text-[#00d4ff]",
                    theme === "miami" && "text-[#00d4ff]",
                    theme === "tron" && "text-[#00d4ff]"
                  )}>Wind</h2>
                  <p className="text-lg text-white">
                    {weather.wind.direction ? `${weather.wind.direction} ` : ''}
                    {weather.wind.speed} mph
                    {weather.wind.gust ? ` (gusts ${weather.wind.gust} mph)` : ''}
                  </p>
                </div>
              </ResponsiveGrid>

              {/* AQI and Pollen Count - Using Lazy Loaded Shared Components */}
              <LazyEnvironmentalDisplay weather={weather} theme={theme} />

              {/* Forecast Components - Lazy Loaded */}
              <LazyForecast 
                forecast={weather.forecast.map(day => ({
                  ...day,
                  country: weather.country
                }))} 
                theme={theme}
                onDayClick={handleDayClick}
                selectedDay={selectedDay}
              />

              <LazyForecastDetails 
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
            theme === "miami" && "bg-[#0a0025] border-[#00d4ff] text-[#00d4ff]",
            theme === "tron" && "bg-black border-[#00d4ff] text-white"
          )}>
            <h2 className={cn(
              "text-xl font-bold mb-4 uppercase tracking-wider font-mono",
              theme === "dark" && "text-[#00d4ff]",
              theme === "miami" && "text-[#00d4ff]",
              theme === "tron" && "text-[#00d4ff]"
            )}>
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