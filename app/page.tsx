"use client"

import React, { useState, useEffect } from "react"
import { fetchWeatherData, fetchWeatherByLocation } from "@/lib/weather-api"
import { WeatherData } from '@/lib/types'
import { cacheWeatherData, getCachedWeatherData } from '@/lib/cache'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import NavBar from '@/components/nav-bar'

console.log('MainPage module loaded');

const MainPage = () => {
  console.log('MainPage component rendered');
  
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [hasSearched, setHasSearched] = useState(false)
  const [locationInput, setLocationInput] = useState<string>("")
  const [isClient, setIsClient] = useState(false)
  const [remainingSearches, setRemainingSearches] = useState(10)
  const [rateLimitError, setRateLimitError] = useState<string>("")
  const [isOnCooldown, setIsOnCooldown] = useState(false)

  const { preferences } = useUserPreferences()

  // Rate limiting
  const MAX_REQUESTS_PER_HOUR = 10
  const COOLDOWN_SECONDS = 2

  // Client-side mount effect
  useEffect(() => {
    setIsClient(true)
    loadCachedData()
  }, [])

  const loadCachedData = () => {
    try {
      const cached = getCachedWeatherData()
      if (cached.data && cached.location) {
        setWeather(cached.data)
        setLocationInput(cached.location)
        setHasSearched(true)
      }
    } catch (error) {
      console.warn('Failed to load cached data:', error)
    }
  }

  const getRateLimitData = () => {
    try {
      const data = localStorage.getItem('weather-app-rate-limit')
      return data ? JSON.parse(data) : { requests: [], lastReset: Date.now() }
    } catch {
      return { requests: [], lastReset: Date.now() }
    }
  }

  const saveRateLimitData = (data: { requests: number[], lastReset: number }) => {
    try {
      localStorage.setItem('weather-app-rate-limit', JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save rate limit data:', error)
    }
  }

  const checkRateLimit = (): { allowed: boolean, remaining: number, message?: string } => {
    const now = Date.now()
    const data = getRateLimitData()
    
    // Reset if hour has passed
    if (now - data.lastReset > 3600000) {
      data.requests = []
      data.lastReset = now
      saveRateLimitData(data)
    }
    
    // Remove old requests
    data.requests = data.requests.filter((time: number) => now - time < 3600000)
    
    const remaining = MAX_REQUESTS_PER_HOUR - data.requests.length
    
    if (remaining <= 0) {
      return { 
        allowed: false, 
        remaining: 0, 
        message: `Rate limit reached. Try again in ${Math.ceil((3600000 - (now - data.lastReset)) / 60000)} minutes.` 
      }
    }
    
    return { allowed: true, remaining }
  }

  const recordRequest = () => {
    const data = getRateLimitData()
    data.requests.push(Date.now())
    saveRateLimitData(data)
    setRemainingSearches(data.requests.length < MAX_REQUESTS_PER_HOUR ? MAX_REQUESTS_PER_HOUR - data.requests.length : 0)
  }

  const handleSearch = async (locationInput: string) => {
    const rateLimit = checkRateLimit()
    if (!rateLimit.allowed) {
      setRateLimitError(rateLimit.message || 'Rate limit reached')
      return
    }

    setLoading(true)
    setError("")
    setRateLimitError("")
    setHasSearched(true)

    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.REACT_APP_OPENWEATHER_API_KEY
      
      if (!API_KEY) {
        throw new Error('Weather API key not configured')
      }

      const weatherData = await fetchWeatherData(locationInput, API_KEY)
      setWeather(weatherData)
      
      // Cache the data
      cacheWeatherData(locationInput, weatherData)
      
      // Record the request
      recordRequest()
      
    } catch (error: any) {
      console.error('Weather search error:', error)
      setError(error.message || 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSearch = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser')
      return
    }

    const rateLimit = checkRateLimit()
    if (!rateLimit.allowed) {
      setRateLimitError(rateLimit.message || 'Rate limit reached')
      return
    }

    setLoading(true)
    setError("")
    setRateLimitError("")

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.REACT_APP_OPENWEATHER_API_KEY
          
          if (!API_KEY) {
            throw new Error('Weather API key not configured')
          }

          const coords = `${position.coords.latitude},${position.coords.longitude}`
          const weatherData = await fetchWeatherByLocation(coords)
          setWeather(weatherData)
          setLocationInput(weatherData.location)
          setHasSearched(true)
          
          // Cache the data
          cacheWeatherData(weatherData.location, weatherData)
          
          // Record the request
          recordRequest()
          
        } catch (error: any) {
          console.error('Location weather error:', error)
          setError(error.message || 'Failed to fetch weather data')
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setError('Location access denied. Please search manually.')
        setLoading(false)
      }
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (locationInput.trim() && !loading) {
      handleSearch(locationInput.trim())
    }
  }

  // Get theme classes based on user preferences
  const getThemeClasses = () => {
    const theme = preferences.theme || 'dark-terminal'
    switch (theme) {
      case 'miami-vice':
        return 'bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 text-white'
      case 'tron-grid':
        return 'bg-gray-900 text-gray-100'
      case 'amber-monitor':
        return 'bg-black text-amber-400'
      default: // dark-terminal
        return 'bg-black text-cyan-400'
    }
  }

  // Don't render weather content during SSR
  if (!isClient) {
    return (
      <div className={`min-h-screen ${getThemeClasses()}`}>
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">16-BIT WEATHER</h1>
            <p>Loading weather dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${getThemeClasses()}`}>
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">16-BIT WEATHER</h1>
          <p className="text-lg opacity-80">Real-time weather data with retro interface</p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Enter city name..."
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !locationInput.trim()}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={handleLocationSearch}
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors"
            >
              📍 Location
            </button>
          </form>

          {/* Rate Limit Info */}
          <div className="mt-4 text-sm opacity-70">
            Searches remaining: {remainingSearches}
          </div>

          {/* Error Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-300">
              {error}
            </div>
          )}
          
          {rateLimitError && (
            <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-500 rounded text-yellow-300">
              {rateLimitError}
            </div>
          )}
        </div>

        {/* Weather Display */}
        {weather && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{weather.location}</h2>
                <p className="text-lg opacity-80">{weather.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Weather */}
                <div className="text-center">
                  <div className="text-6xl mb-2">{weather.temperature}°</div>
                  <div className="text-lg opacity-80">Temperature</div>
                </div>

                {/* Wind Speed */}
                <div className="text-center">
                  <div className="text-4xl mb-2">{weather.wind.speed} mph</div>
                  <div className="text-lg opacity-80">Wind Speed</div>
                </div>

                {/* Humidity */}
                <div className="text-center">
                  <div className="text-4xl mb-2">{weather.humidity}%</div>
                  <div className="text-lg opacity-80">Humidity</div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-sm opacity-60">Wind Speed</div>
                  <div className="text-lg">{weather.wind.speed} mph</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-60">Pressure</div>
                  <div className="text-lg">{weather.pressure} hPa</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-60">UV Index</div>
                  <div className="text-lg">{weather.uvIndex}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-60">AQI</div>
                  <div className="text-lg">{weather.aqi}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Message */}
        {!hasSearched && !loading && (
          <div className="text-center mt-12">
            <p className="text-lg opacity-70 mb-4">
              Enter a city name above to get started with your weather adventure!
            </p>
            <p className="text-sm opacity-50">
              Powered by OpenWeather API • Rate limited to 10 searches per hour
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default MainPage