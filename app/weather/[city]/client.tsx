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

  // Helper function to check if weather is from a major city
  const isMajorCityWeather = (location: string) => {
    const majorCities = [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 
      'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin'
    ];
    return majorCities.some(city => location.includes(city));
  };

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

  // Helper function to get moon phase icon
  const getMoonPhaseIcon = (phase: string): string => {
    const phaseLower = phase.toLowerCase();
    
    if (phaseLower.includes('new')) return '●';
    if (phaseLower.includes('waxing crescent')) return '🌒';
    if (phaseLower.includes('first quarter')) return '🌓';
    if (phaseLower.includes('waxing gibbous')) return '🌔';
    if (phaseLower.includes('full')) return '🌕';
    if (phaseLower.includes('waning gibbous')) return '🌖';
    if (phaseLower.includes('last quarter')) return '🌗';
    if (phaseLower.includes('waning crescent')) return '🌘';
    
    // Fallback for any other phases
    return '🌑';
  };

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
              <ResponsiveGrid cols={{ sm: 1, md: 3 }} className="gap-4">
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
                  {weather.precipitationProbability && weather.precipitationProbability > 0 && (
                    <p className="text-sm text-gray-300 mt-2 opacity-80">
                      {weather.precipitationProbability}% chance of rain
                    </p>
                  )}
                  {(!weather.precipitationProbability || weather.precipitationProbability === 0) && (
                    <p className="text-sm text-gray-300 mt-2 opacity-80">
                      0% rain
                    </p>
                  )}
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
              </ResponsiveGrid>

              {/* Sun Times, UV Index, Moon Phase */}
              <ResponsiveGrid cols={{ sm: 1, md: 3 }} className="gap-4">
                {/* Sun Times Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-[#0f0f0f] border-[#00d4ff]",
                  theme === "miami" && "bg-[#0a0025] border-[#ff1493]",
                  theme === "tron" && "bg-black border-[#00FFFF]"
                )}
                     style={{ boxShadow: `0 0 15px ${theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF'}33` }}>
                  <h2 className={cn(
                    "text-xl font-semibold mb-2",
                    theme === "dark" && "text-[#00d4ff]",
                    theme === "miami" && "text-[#ff1493]",
                    theme === "tron" && "text-[#00FFFF]"
                  )}>Sun Times</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-yellow-400">☀️</span>
                      <p className="text-white">Sunrise: {weather.sunrise}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-orange-400">🌅</span>
                      <p className="text-white">Sunset: {weather.sunset}</p>
                    </div>
                  </div>
                </div>

                {/* UV Index Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-[#0f0f0f] border-[#00d4ff]",
                  theme === "miami" && "bg-[#0a0025] border-[#ff1493]",
                  theme === "tron" && "bg-black border-[#00FFFF]"
                )}
                     style={{ boxShadow: `0 0 15px ${theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF'}33` }}>
                  <h2 className={cn(
                    "text-xl font-semibold mb-2",
                    theme === "dark" && "text-[#00d4ff]",
                    theme === "miami" && "text-[#ff1493]",
                    theme === "tron" && "text-[#00FFFF]"
                  )}>UV Index</h2>
                  <p className="text-lg font-bold text-white">{weather.uvIndex}</p>
                </div>

                {/* Moon Phase Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-[#0f0f0f] border-[#00d4ff]",
                  theme === "miami" && "bg-[#0a0025] border-[#ff1493]",
                  theme === "tron" && "bg-black border-[#00FFFF]"
                )}
                     style={{ boxShadow: `0 0 15px ${theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF'}33` }}>
                  <h2 className={cn(
                    "text-xl font-semibold mb-2",
                    theme === "dark" && "text-[#00d4ff]",
                    theme === "miami" && "text-[#ff1493]",
                    theme === "tron" && "text-[#00FFFF]"
                  )}>Moon Phase</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">{getMoonPhaseIcon(weather.moonPhase.phase)}</span>
                      <p className="text-lg font-semibold text-white">{weather.moonPhase.phase}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-300">
                      {weather.moonPhase.illumination}% illuminated
                    </p>
                  </div>
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

          {/* SEO Content Section - Only show for major cities, hide when searching other locations */}
          {(!weather || isMajorCityWeather(weather.location)) && (
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
          )}

          {/* City Links Section - Always visible on city pages */}
          <div className={cn(
            "mt-16 pt-8 border-t-2 text-center",
            theme === "dark" && "border-[#00d4ff]",
            theme === "miami" && "border-[#ff1493]",
            theme === "tron" && "border-[#00FFFF]"
          )}>
            <h2 className={cn(
              "text-lg font-bold mb-4 uppercase tracking-wider font-mono",
              theme === "dark" && "text-[#00d4ff]",
              theme === "miami" && "text-[#ff1493]",
              theme === "tron" && "text-[#00FFFF]"
            )}>
              WEATHER BY CITY
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
              <a 
                href="/weather/new-york-ny" 
                className={cn(
                  "block px-3 py-2 text-sm font-mono rounded border transition-colors",
                  theme === "dark" && "border-[#00d4ff] text-[#e0e0e0] hover:bg-[#00d4ff] hover:text-[#0f0f0f]",
                  theme === "miami" && "border-[#ff1493] text-[#00ffff] hover:bg-[#ff1493] hover:text-[#0a0025]",
                  theme === "tron" && "border-[#00FFFF] text-white hover:bg-[#00FFFF] hover:text-black"
                )}
              >
                NEW YORK
              </a>
              <a 
                href="/weather/los-angeles-ca" 
                className={cn(
                  "block px-3 py-2 text-sm font-mono rounded border transition-colors",
                  theme === "dark" && "border-[#00d4ff] text-[#e0e0e0] hover:bg-[#00d4ff] hover:text-[#0f0f0f]",
                  theme === "miami" && "border-[#ff1493] text-[#00ffff] hover:bg-[#ff1493] hover:text-[#0a0025]",
                  theme === "tron" && "border-[#00FFFF] text-white hover:bg-[#00FFFF] hover:text-black"
                )}
              >
                LOS ANGELES
              </a>
              <a 
                href="/weather/chicago-il" 
                className={cn(
                  "block px-3 py-2 text-sm font-mono rounded border transition-colors",
                  theme === "dark" && "border-[#00d4ff] text-[#e0e0e0] hover:bg-[#00d4ff] hover:text-[#0f0f0f]",
                  theme === "miami" && "border-[#ff1493] text-[#00ffff] hover:bg-[#ff1493] hover:text-[#0a0025]",
                  theme === "tron" && "border-[#00FFFF] text-white hover:bg-[#00FFFF] hover:text-black"
                )}
              >
                CHICAGO
              </a>
              <a 
                href="/weather/houston-tx" 
                className={cn(
                  "block px-3 py-2 text-sm font-mono rounded border transition-colors",
                  theme === "dark" && "border-[#00d4ff] text-[#e0e0e0] hover:bg-[#00d4ff] hover:text-[#0f0f0f]",
                  theme === "miami" && "border-[#ff1493] text-[#00ffff] hover:bg-[#ff1493] hover:text-[#0a0025]",
                  theme === "tron" && "border-[#00FFFF] text-white hover:bg-[#00FFFF] hover:text-black"
                )}
              >
                HOUSTON
              </a>
              <a 
                href="/weather/phoenix-az" 
                className={cn(
                  "block px-3 py-2 text-sm font-mono rounded border transition-colors",
                  theme === "dark" && "border-[#00d4ff] text-[#e0e0e0] hover:bg-[#00d4ff] hover:text-[#0f0f0f]",
                  theme === "miami" && "border-[#ff1493] text-[#00ffff] hover:bg-[#ff1493] hover:text-[#0a0025]",
                  theme === "tron" && "border-[#00FFFF] text-white hover:bg-[#00FFFF] hover:text-black"
                )}
              >
                PHOENIX
              </a>
              <a 
                href="/weather/philadelphia-pa" 
                className={cn(
                  "block px-3 py-2 text-sm font-mono rounded border transition-colors",
                  theme === "dark" && "border-[#00d4ff] text-[#e0e0e0] hover:bg-[#00d4ff] hover:text-[#0f0f0f]",
                  theme === "miami" && "border-[#ff1493] text-[#00ffff] hover:bg-[#ff1493] hover:text-[#0a0025]",
                  theme === "tron" && "border-[#00FFFF] text-white hover:bg-[#00FFFF] hover:text-black"
                )}
              >
                PHILADELPHIA
              </a>
              <a 
                href="/weather/san-antonio-tx" 
                className={cn(
                  "block px-3 py-2 text-sm font-mono rounded border transition-colors",
                  theme === "dark" && "border-[#00d4ff] text-[#e0e0e0] hover:bg-[#00d4ff] hover:text-[#0f0f0f]",
                  theme === "miami" && "border-[#ff1493] text-[#00ffff] hover:bg-[#ff1493] hover:text-[#0a0025]",
                  theme === "tron" && "border-[#00FFFF] text-white hover:bg-[#00FFFF] hover:text-black"
                )}
              >
                SAN ANTONIO
              </a>
              <a 
                href="/weather/san-diego-ca" 
                className={cn(
                  "block px-3 py-2 text-sm font-mono rounded border transition-colors",
                  theme === "dark" && "border-[#00d4ff] text-[#e0e0e0] hover:bg-[#00d4ff] hover:text-[#0f0f0f]",
                  theme === "miami" && "border-[#ff1493] text-[#00ffff] hover:bg-[#ff1493] hover:text-[#0a0025]",
                  theme === "tron" && "border-[#00FFFF] text-white hover:bg-[#00FFFF] hover:text-black"
                )}
              >
                SAN DIEGO
              </a>
              <a 
                href="/weather/dallas-tx" 
                className={cn(
                  "block px-3 py-2 text-sm font-mono rounded border transition-colors",
                  theme === "dark" && "border-[#00d4ff] text-[#e0e0e0] hover:bg-[#00d4ff] hover:text-[#0f0f0f]",
                  theme === "miami" && "border-[#ff1493] text-[#00ffff] hover:bg-[#ff1493] hover:text-[#0a0025]",
                  theme === "tron" && "border-[#00FFFF] text-white hover:bg-[#00FFFF] hover:text-black"
                )}
              >
                DALLAS
              </a>
              <a 
                href="/weather/austin-tx" 
                className={cn(
                  "block px-3 py-2 text-sm font-mono rounded border transition-colors",
                  theme === "dark" && "border-[#00d4ff] text-[#e0e0e0] hover:bg-[#00d4ff] hover:text-[#0f0f0f]",
                  theme === "miami" && "border-[#ff1493] text-[#00ffff] hover:bg-[#ff1493] hover:text-[#0a0025]",
                  theme === "tron" && "border-[#00FFFF] text-white hover:bg-[#00FFFF] hover:text-black"
                )}
              >
                AUSTIN
              </a>
            </div>
          </div>
        </ResponsiveContainer>
      </div>
    </PageWrapper>
  )
}