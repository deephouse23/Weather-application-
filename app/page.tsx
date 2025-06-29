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
        return {
          background: 'bg-gradient-to-br from-blue-900 to-purple-900',
          cardBg: 'bg-white/10 backdrop-blur-sm',
          borderColor: 'border-blue-400',
          text: 'text-white',
          headerText: 'text-white',
          secondaryText: 'text-blue-200',
          accentText: 'text-blue-300',
          successText: 'text-green-300',
          errorText: 'text-red-300',
          warningText: 'text-yellow-300',
          glow: 'shadow-blue-400/50',
          specialBorder: 'border-blue-400',
          buttonHover: 'hover:bg-blue-400 hover:text-white',
          placeholderText: 'placeholder-blue-200',
          hoverBorder: 'hover:border-blue-300',
          buttonBg: 'bg-blue-600',
          buttonBorder: 'border-blue-400',
          buttonText: 'text-white',
          errorBg: 'bg-red-900/20',
          warningBg: 'bg-yellow-900/20'
        }
      case 'tron-grid':
        return {
          background: 'bg-gray-900',
          cardBg: 'bg-gray-800',
          borderColor: 'border-gray-600',
          text: 'text-gray-100',
          headerText: 'text-white',
          secondaryText: 'text-gray-400',
          accentText: 'text-gray-300',
          successText: 'text-green-400',
          errorText: 'text-red-400',
          warningText: 'text-yellow-400',
          glow: 'shadow-gray-400/50',
          specialBorder: 'border-gray-600',
          buttonHover: 'hover:bg-gray-600 hover:text-white',
          placeholderText: 'placeholder-gray-400',
          hoverBorder: 'hover:border-gray-500',
          buttonBg: 'bg-gray-700',
          buttonBorder: 'border-gray-600',
          buttonText: 'text-gray-100',
          errorBg: 'bg-red-900/20',
          warningBg: 'bg-yellow-900/20'
        }
      case 'amber-monitor':
        return {
          background: 'bg-black',
          cardBg: 'bg-gray-900',
          borderColor: 'border-amber-400',
          text: 'text-amber-400',
          headerText: 'text-amber-400',
          secondaryText: 'text-amber-600',
          accentText: 'text-amber-300',
          successText: 'text-green-400',
          errorText: 'text-red-400',
          warningText: 'text-yellow-400',
          glow: 'shadow-amber-400/50',
          specialBorder: 'border-amber-400',
          buttonHover: 'hover:bg-amber-400 hover:text-black',
          placeholderText: 'placeholder-amber-600',
          hoverBorder: 'hover:border-amber-300',
          buttonBg: 'bg-black',
          buttonBorder: 'border-amber-400',
          buttonText: 'text-amber-400',
          errorBg: 'bg-red-900/20',
          warningBg: 'bg-yellow-900/20'
        }
      default: // dark-terminal
        return {
          background: 'bg-black',
          cardBg: 'bg-gray-900',
          borderColor: 'border-cyan-400',
          text: 'text-cyan-400',
          headerText: 'text-cyan-400',
          secondaryText: 'text-cyan-600',
          accentText: 'text-cyan-300',
          successText: 'text-green-400',
          errorText: 'text-red-400',
          warningText: 'text-yellow-400',
          glow: 'shadow-cyan-400/50',
          specialBorder: 'border-cyan-400',
          buttonHover: 'hover:bg-cyan-400 hover:text-black',
          placeholderText: 'placeholder-cyan-600',
          hoverBorder: 'hover:border-cyan-300',
          buttonBg: 'bg-black',
          buttonBorder: 'border-cyan-400',
          buttonText: 'text-cyan-400',
          errorBg: 'bg-red-900/20',
          warningBg: 'bg-yellow-900/20'
        }
    }
  }

  const themeClasses = getThemeClasses()

  if (!isClient) {
    return (
      <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} p-8 flex items-center justify-center`}>
        <div className="text-center">
          <div className={`${themeClasses.secondaryText} font-mono`}>LOADING...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text}`}>
      <NavBar />
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-mono uppercase tracking-wider ${themeClasses.headerText}`}>
              16-BIT WEATHER
            </h1>
            <p className={`text-lg ${themeClasses.secondaryText} font-mono mb-6`}>
              🌤️ Real-time weather data with {preferences.theme || 'dark-terminal'} interface
            </p>
          </div>

          {/* Search Form */}
          <div className="mb-8">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Enter ZIP, City+State, or City+Country..."
                  disabled={loading}
                  className={`w-full px-4 py-3 pr-12 ${themeClasses.cardBg} border-2 ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.placeholderText} 
                           font-mono text-base uppercase tracking-wider focus:outline-none ${themeClasses.hoverBorder} 
                           transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                           min-h-[48px]`}
                />
                <button
                  type="submit"
                  disabled={loading || !locationInput.trim()}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 ${themeClasses.secondaryText} ${themeClasses.accentText} 
                           transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                           min-w-[44px] min-h-[44px] flex items-center justify-center`}
                >
                  {loading ? (
                    <div className={`w-5 h-5 border-2 ${themeClasses.borderColor} border-t-transparent rounded-full animate-spin`} />
                  ) : (
                    <span className="text-lg">🔍</span>
                  )}
                </button>
              </div>
            </form>

            {/* Location Button */}
            <div className="text-center mt-4">
              <button
                onClick={handleLocationSearch}
                disabled={loading}
                className={`px-6 py-3 border-2 ${themeClasses.borderColor} ${themeClasses.text} font-mono text-sm font-bold uppercase tracking-wider 
                         transition-all duration-200 ${themeClasses.buttonHover} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                📍 USE MY LOCATION
              </button>
            </div>

            {/* Format Hints */}
            <div className="text-center mt-4">
              <div className={`text-xs ${themeClasses.secondaryText} uppercase tracking-wider`}>
                ► 90210 • NEW YORK, NY • LONDON, UK ◄
              </div>
            </div>

            {/* Rate Limit Info */}
            <div className="text-center mt-2">
              <div className={`text-xs ${themeClasses.secondaryText}`}>
                Searches remaining: {remainingSearches}/{MAX_REQUESTS_PER_HOUR}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {(error || rateLimitError) && (
            <div className={`p-4 mx-auto max-w-2xl ${themeClasses.errorBg} border ${themeClasses.errorText} 
                          text-sm text-center font-mono mb-6`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span>⚠</span>
                <span className="uppercase tracking-wider">{error || rateLimitError}</span>
              </div>
            </div>
          )}

          {/* Weather Display */}
          {weather && (
            <div className={`p-6 mx-auto max-w-4xl ${themeClasses.cardBg} border-2 ${themeClasses.borderColor}`}>
              <div className="text-center mb-6">
                <h2 className={`text-2xl font-mono font-bold mb-2 ${themeClasses.headerText}`}>{weather.location}</h2>
                <div className={`text-4xl font-mono font-bold mb-2 ${themeClasses.headerText}`}>
                  {Math.round(weather.temperature)}°{preferences.units.temperature === 'celsius' ? 'C' : 'F'}
                </div>
                <div className={`text-lg font-mono ${themeClasses.text}`}>{weather.description}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-mono">
                <div className={`text-center p-3 border ${themeClasses.borderColor}/30`}>
                  <div className={`${themeClasses.accentText} mb-1`}>HUMIDITY</div>
                  <div>{weather.humidity}%</div>
                </div>
                <div className={`text-center p-3 border ${themeClasses.borderColor}/30`}>
                  <div className={`${themeClasses.accentText} mb-1`}>WIND</div>
                  <div>{Math.round(weather.wind.speed)} {preferences.units.windSpeed === 'ms' ? 'm/s' : 'mph'} {weather.wind.direction}</div>
                </div>
                <div className={`text-center p-3 border ${themeClasses.borderColor}/30`}>
                  <div className={`${themeClasses.accentText} mb-1`}>PRESSURE</div>
                  <div>{weather.pressure}</div>
                </div>
                <div className={`text-center p-3 border ${themeClasses.borderColor}/30`}>
                  <div className={`${themeClasses.accentText} mb-1`}>UV INDEX</div>
                  <div>{weather.uvIndex}</div>
                </div>
              </div>

              {/* Forecast */}
              {weather.forecast && weather.forecast.length > 0 && (
                <div className="mt-6">
                  <h3 className={`text-lg font-mono font-bold mb-4 text-center ${themeClasses.headerText}`}>5-DAY FORECAST</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {weather.forecast.slice(0, 5).map((day, index) => (
                      <div key={index} className={`text-center p-3 border ${themeClasses.borderColor}/30`}>
                        <div className={`${themeClasses.accentText} mb-1 font-bold`}>{day.day}</div>
                        <div className="text-sm">{Math.round(day.highTemp)}° / {Math.round(day.lowTemp)}°</div>
                        <div className={`text-xs ${themeClasses.secondaryText} mt-1`}>{day.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 text-center">
            <div className={`text-sm ${themeClasses.secondaryText} font-mono`}>
              Explore: Weather Systems • Cloud Types • Fun Facts • Games • About
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

console.log('MainPage type:', typeof MainPage);
export default MainPage;