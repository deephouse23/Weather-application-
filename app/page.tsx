"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchWeatherData, fetchWeatherByLocation } from "@/lib/weather-api"
import WeatherSearch from "@/components/weather-search"
import Forecast from "@/components/forecast"

// Get the API key from environment variables
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || process.env.OPENWEATHERMAP_API_KEY;

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    humidity: number;
    wind: number;
    windDirection?: number; // Wind direction in degrees
    windDisplay: string; // Formatted wind display (e.g., "SW 6 mph" or "Calm")
    location: string;
    description: string;
    sunrise: string; // Formatted sunrise time (e.g., "6:23 am")
    sunset: string; // Formatted sunset time (e.g., "7:45 pm")
    dewPoint: number; // Dew point in Fahrenheit
    uvIndex: number; // UV Index (0-11+) - current real-time value
    uvDescription: string; // UV intensity description (Low/Moderate/High/Very High/Extreme)
    pressure: number; // Atmospheric pressure in hPa
    pressureDisplay: string; // Formatted pressure with regional units
    country: string; // Country code (e.g., "US", "GB", "CA")
  };
  forecast: Array<{
    day: string;
    highTemp: number;
    lowTemp: number;
    condition: string;
    description: string;
  }>;
  moonPhase: {
    phase: string; // Phase name (e.g., "Waxing Crescent")
    illumination: number; // Percentage of illumination (0-100)
    emoji: string; // Unicode moon symbol
    phaseAngle: number; // Phase angle in degrees (0-360)
  };
}

export default function WeatherApp() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [hasSearched, setHasSearched] = useState(false)
  const [lastSearchTerm, setLastSearchTerm] = useState<string>("")
  const [currentLocation, setCurrentLocation] = useState<string>("")
  const [isOnCooldown, setIsOnCooldown] = useState(false)
  const [remainingSearches, setRemainingSearches] = useState(10)
  const [rateLimitError, setRateLimitError] = useState<string>("")
  const [isDarkMode, setIsDarkMode] = useState(true) // Default to dark mode

  // localStorage keys
  const CACHE_KEY = 'weather-app-last-location'
  const RATE_LIMIT_KEY = 'weather-app-rate-limit'
  const THEME_KEY = 'weather-app-theme'
  const MAX_REQUESTS_PER_HOUR = 10
  const COOLDOWN_SECONDS = 2

  // Theme management functions
  const getStoredTheme = (): boolean => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(THEME_KEY)
        return stored ? JSON.parse(stored) : true // Default to dark mode
      }
    } catch (error) {
      console.warn('Failed to get stored theme:', error)
    }
    return true // Default to dark mode
  }

  const saveTheme = (isDark: boolean) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(THEME_KEY, JSON.stringify(isDark))
      }
    } catch (error) {
      console.warn('Failed to save theme:', error)
    }
  }

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    saveTheme(newTheme)
  }

  // Load theme on mount
  useEffect(() => {
    const storedTheme = getStoredTheme()
    setIsDarkMode(storedTheme)
  }, [])

  // Rate limiting functions
  const getRateLimitData = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(RATE_LIMIT_KEY)
        if (data) {
          return JSON.parse(data)
        }
      }
    } catch (error) {
      console.warn('Failed to get rate limit data:', error)
    }
    return { requests: [], lastReset: Date.now() }
  }

  const saveRateLimitData = (data: { requests: number[], lastReset: number }) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data))
      }
    } catch (error) {
      console.warn('Failed to save rate limit data:', error)
    }
  }

  const checkRateLimit = (): { allowed: boolean, remaining: number, message?: string } => {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
    let data = getRateLimitData()

    // Reset if more than an hour has passed
    if (now - data.lastReset > oneHour) {
      data = { requests: [], lastReset: now }
      saveRateLimitData(data)
    }

    // Filter out requests older than 1 hour
    const recentRequests = data.requests.filter((timestamp: number) => now - timestamp < oneHour)
    
    const remaining = MAX_REQUESTS_PER_HOUR - recentRequests.length

    if (recentRequests.length >= MAX_REQUESTS_PER_HOUR) {
      const oldestRequest = Math.min(...recentRequests)
      const waitTime = Math.ceil((oneHour - (now - oldestRequest)) / 1000 / 60) // minutes
      return {
        allowed: false,
        remaining: 0,
        message: `Too many requests. Please wait ${waitTime} minutes before searching again.`
      }
    }

    return { allowed: true, remaining }
  }

  const recordRequest = () => {
    const now = Date.now()
    let data = getRateLimitData()
    
    // Add current request
    data.requests.push(now)
    
    // Clean up old requests (older than 1 hour)
    const oneHour = 60 * 60 * 1000
    data.requests = data.requests.filter((timestamp: number) => now - timestamp < oneHour)
    
    saveRateLimitData(data)
  }

  // Update remaining searches on mount and after each request
  useEffect(() => {
    const { remaining } = checkRateLimit()
    setRemainingSearches(remaining)
  }, [])

  // Save location to cache (silent)
  const saveLocationToCache = (location: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(CACHE_KEY, location)
      }
    } catch (error) {
      console.warn('Failed to save location to cache:', error)
    }
  }

  // Load cached location and fetch weather on first mount
  useEffect(() => {
    const loadCachedLocation = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const cachedLocation = localStorage.getItem(CACHE_KEY)
          if (cachedLocation) {
            setLastSearchTerm(cachedLocation)
            handleSearch(cachedLocation, true, true) // Load from cache with rate limit bypass
            return
          }
        }
      } catch (error) {
        console.warn('Failed to load cached location:', error)
      }
      
      // No cached location found, use San Francisco as default
      const defaultLocation = 'San Francisco, CA'
      setLastSearchTerm(defaultLocation)
      handleSearch(defaultLocation, true, true) // Load default with rate limit bypass
    }

    // Theme-aware default loading
    if (!hasSearched) {
      loadCachedLocation()
    }
  }, [hasSearched, isDarkMode]) // Include isDarkMode in dependencies for theme-aware loading

  // Ensure default location loads properly when theme changes on first visit
  useEffect(() => {
    // If no weather data and no search has happened, ensure we load San Francisco
    // This handles cases where theme switching might interfere with initial load
    if (!weather && !hasSearched && !loading && !error) {
      console.log('🔍 [DEBUG] Theme-aware check: Loading San Francisco as default for', isDarkMode ? 'dark mode' : 'Miami Vice mode')
      handleSearch("San Francisco, CA", false, true)
    }
  }, [isDarkMode, weather, hasSearched, loading, error])

  const handleSearch = async (locationInput: string, fromCache: boolean = false, bypassRateLimit: boolean = false) => {
    if (!API_KEY) {
      setError("API key not configured. Please check your environment variables.")
      return
    }

    // Clear any previous rate limit errors
    setRateLimitError("")

    // Check rate limiting (unless bypassing for initial load)
    if (!bypassRateLimit) {
      const rateLimitCheck = checkRateLimit()
      if (!rateLimitCheck.allowed) {
        setRateLimitError(rateLimitCheck.message || "Rate limit exceeded")
        setRemainingSearches(rateLimitCheck.remaining)
        return
      }

      // Check cooldown
      if (isOnCooldown) {
        setRateLimitError("Please wait a moment before searching again.")
        return
      }
    }

    setLoading(true)
    setError("")
    setHasSearched(true)
    setLastSearchTerm(locationInput)

    // Set cooldown (unless bypassing for initial load)
    if (!bypassRateLimit) {
      setIsOnCooldown(true)
      setTimeout(() => {
        setIsOnCooldown(false)
      }, COOLDOWN_SECONDS * 1000)
    }

    try {
      const weatherData = await fetchWeatherData(locationInput, API_KEY)
      setWeather(weatherData)
      setCurrentLocation(weatherData.current.location)
      
      // Always save to cache (silently, regardless of source)
      saveLocationToCache(locationInput)

      // Record the request for rate limiting (unless bypassing)
      if (!bypassRateLimit) {
        recordRequest()
        const { remaining } = checkRateLimit()
        setRemainingSearches(remaining)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data")
      setWeather(null)
      setCurrentLocation("")
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSearch = async () => {
    if (!API_KEY) {
      setError("API key not configured. Please check your environment variables.")
      return
    }

    // Clear any previous rate limit errors
    setRateLimitError("")

    // Check rate limiting
    const rateLimitCheck = checkRateLimit()
    if (!rateLimitCheck.allowed) {
      setRateLimitError(rateLimitCheck.message || "Rate limit exceeded")
      setRemainingSearches(rateLimitCheck.remaining)
      return
    }

    // Check cooldown
    if (isOnCooldown) {
      setRateLimitError("Please wait a moment before searching again.")
      return
    }

    setLoading(true)
    setError("")
    setHasSearched(true)
    setLastSearchTerm("your location")

    // Set cooldown
    setIsOnCooldown(true)
    setTimeout(() => {
      setIsOnCooldown(false)
    }, COOLDOWN_SECONDS * 1000)

    try {
      const weatherData = await fetchWeatherByLocation(API_KEY)
      setWeather(weatherData)
      setCurrentLocation(weatherData.current.location)
      
      // Save the actual location name to cache (silently)
      saveLocationToCache(weatherData.current.location)

      // Record the request for rate limiting
      recordRequest()
      const { remaining } = checkRateLimit()
      setRemainingSearches(remaining)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get location weather")
      setCurrentLocation("")
    } finally {
      setLoading(false)
    }
  }

  const showingWeather = weather && !loading && !error

  // Theme-based color classes
  const themeClasses = {
    background: isDarkMode ? 'bg-[#1a1a2e]' : 'bg-gradient-to-br from-[#2d1b69] via-[#11001c] to-[#0f0026]',
    text: isDarkMode ? 'text-[#e0e0e0]' : 'text-[#00ffff]',
    cardBg: isDarkMode ? 'bg-[#16213e]' : 'bg-gradient-to-br from-[#4a0e4e] via-[#2d1b69] to-[#1a0033]',
    inputBg: isDarkMode ? 'bg-[#16213e]' : 'bg-[#1a0033]',
    borderColor: isDarkMode ? 'border-[#00d4ff]' : 'border-[#ff1493]', // Hot pink borders in Miami Vice mode
    headerText: isDarkMode ? 'text-[#00d4ff]' : 'text-[#ff007f]', // Hot pink for headers
    accentText: isDarkMode ? 'text-[#ff6b6b]' : 'text-[#ff1493]', // Bright pink
    secondaryText: isDarkMode ? 'text-[#4ecdc4]' : 'text-[#00ffff]', // Electric cyan
    warningText: 'text-[#ff6b6b]', // Keep warning red consistent
    successText: isDarkMode ? 'text-[#ffe66d]' : 'text-[#ff1493]', // Pink for success in Miami Vice
    miamiViceGlow: isDarkMode ? '' : 'drop-shadow-[0_0_10px_#ff007f] text-shadow-[0_0_10px_#ff007f]',
    miamiViceText: isDarkMode ? '' : 'text-[#ff007f]',
    miamiViceBorder: isDarkMode ? '' : 'border-[#00ffff] shadow-[0_0_15px_#00ffff]',
    gradientBg: isDarkMode ? '' : 'bg-gradient-to-r from-[#ff007f] via-[#8a2be2] to-[#00ffff]',
  }

  // Format wind display with smaller gust text
  const formatWindDisplayHTML = (windDisplay: string): string => {
    // Check if the wind display contains gust information
    if (windDisplay.includes('(gusts ')) {
      // Split the wind display to separate main wind and gust info
      const parts = windDisplay.split(' (gusts ');
      const mainWind = parts[0]; // e.g., "SW 12 mph"
      const gustPart = parts[1].replace(')', ''); // e.g., "18 mph"
      
      return `
        <div class="text-lg font-bold ${isDarkMode ? 'text-[#ffe66d]' : 'text-[#ff1493]'} ${!isDarkMode ? themeClasses.miamiViceGlow : ''}" ${!isDarkMode ? 'style="text-shadow: 0 0 10px #ff1493, 0 0 20px #ff1493"' : ''}>${mainWind}</div>
        <div class="text-xs ${isDarkMode ? 'text-[#4ecdc4]' : 'text-[#ff1493]'} mt-1 opacity-80 ${!isDarkMode ? themeClasses.miamiViceGlow : ''}">Gusts ${gustPart}</div>
      `;
    }
    
    // For wind without gusts, return normal formatting
    return `<div class="text-lg font-bold ${isDarkMode ? 'text-[#ffe66d]' : 'text-[#ff1493]'} ${!isDarkMode ? themeClasses.miamiViceGlow : ''}" ${!isDarkMode ? 'style="text-shadow: 0 0 10px #ff1493, 0 0 20px #ff1493"' : ''}>${windDisplay}</div>`;
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} p-4 pixel-font relative transition-colors duration-300`}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-50 p-3 ${themeClasses.cardBg} border-2 ${themeClasses.borderColor} 
                   hover:bg-[#00d4ff] hover:text-[#1a1a2e] transition-all duration-200 pixel-font ${!isDarkMode ? themeClasses.miamiViceBorder : ''}`}
        style={{ 
          imageRendering: "pixelated",
          ...(isDarkMode ? {} : {
            background: 'linear-gradient(135deg, #ff007f, #8a2be2, #00ffff)',
            boxShadow: '0 0 20px #ff007f, inset 0 0 20px rgba(255, 0, 127, 0.3)'
          })
        }}
        aria-label={isDarkMode ? "Switch to Miami Vice mode" : "Switch to dark mode"}
        title={isDarkMode ? "Switch to Miami Vice mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          // Miami Vice icon for switching to light mode
          <div className="relative w-6 h-6">
            <div className="absolute inset-1 bg-[#ff007f] rounded-full" style={{ boxShadow: '0 0 10px #ff007f' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#00ffff] rounded-full"></div>
            {/* Neon rays */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-1.5 bg-[#ff1493]"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-1.5 bg-[#ff1493]"></div>
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-1.5 h-0.5 bg-[#00ffff]"></div>
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1.5 h-0.5 bg-[#00ffff]"></div>
          </div>
        ) : (
          // Dark mode moon icon
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 bg-[#4ecdc4] rounded-full opacity-80"></div>
            <div className="absolute top-1 right-1 w-4 h-4 bg-[#1a1a2e] rounded-full"></div>
          </div>
        )}
      </button>

      {/* Moon Phase Watermark */}
      {showingWeather && (
        <MoonPhaseWatermark 
          phase={weather.moonPhase.phase}
          phaseAngle={weather.moonPhase.phaseAngle}
          illumination={weather.moonPhase.illumination}
          isDarkMode={isDarkMode}
        />
      )}

      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <header className="text-center mb-8 pt-4 relative z-10">
          <h1 className={`text-3xl font-bold tracking-wider ${themeClasses.headerText} pixel-glow mb-2 ${themeClasses.miamiViceGlow}`}>16-BIT WEATHER</h1>
          
          {/* Miami Vice Mode Indicator (only in light mode) */}
          {!isDarkMode && (
            <div className="mb-2">
              <div className={`text-sm ${themeClasses.miamiViceText} uppercase tracking-wider font-bold ${themeClasses.miamiViceGlow}`} 
                   style={{ 
                     fontFamily: 'monospace',
                     textShadow: '0 0 10px #ff007f, 0 0 20px #ff007f, 0 0 30px #ff007f',
                     filter: 'drop-shadow(0 0 5px #ff007f)'
                   }}>
                🌴 MIAMI VICE MODE 🌴
              </div>
            </div>
          )}

          {/* Rate Limit Error Message */}
          {rateLimitError && (
            <div className={`mb-3 p-2 ${themeClasses.cardBg} border ${themeClasses.warningText} text-sm ${!isDarkMode ? themeClasses.miamiViceBorder : ''}`} 
                 style={{ borderColor: '#ff6b6b' }}>
              ⚠ {rateLimitError}
            </div>
          )}
          
          {/* Current Location Display */}
          {currentLocation && (
            <div className="mb-2">
              <div className={`text-lg ${themeClasses.accentText} font-bold uppercase tracking-wider ${themeClasses.miamiViceGlow}`}>
                {currentLocation}
              </div>
            </div>
          )}
          
          {/* Loading indicator */}
          {loading && lastSearchTerm && (
            <div className={`text-sm ${themeClasses.secondaryText} mb-2 ${themeClasses.miamiViceGlow}`}>
              {lastSearchTerm === "your location" ? "🔍 DETECTING LOCATION..." : `🔍 SEARCHING: ${lastSearchTerm.toUpperCase()}`}
            </div>
          )}
          
          {/* Error state location info */}
          {!currentLocation && lastSearchTerm && !loading && error && (
            <div className={`text-xs ${themeClasses.warningText} mb-2`}>
              ❌ FAILED: {lastSearchTerm.toUpperCase()}
            </div>
          )}
        </header>

        {/* Search Component */}
        <div className="relative z-10">
          <WeatherSearch
            onSearch={handleSearch}
            onLocationSearch={handleLocationSearch}
            isLoading={loading}
            error={error}
            isDisabled={isOnCooldown || remainingSearches <= 0}
            rateLimitError={rateLimitError}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 relative z-10">
            <Loader2 className={`w-12 h-12 mx-auto animate-spin ${themeClasses.headerText}`} />
            <p className={`mt-4 text-xl ${themeClasses.headerText} uppercase tracking-wider`}>LOADING...</p>
            <p className={`mt-2 text-sm ${themeClasses.secondaryText}`}>
              {lastSearchTerm === "your location" ? "Getting your location..." : `Searching for: ${lastSearchTerm}`}
            </p>
          </div>
        )}

        {/* Weather Display */}
        {showingWeather && (
          <div className="relative z-10">
            {/* Current Weather */}
            <div className={`${themeClasses.cardBg} p-6 rounded-none mb-6 border-2 ${themeClasses.borderColor} pixel-shadow relative ${!isDarkMode ? themeClasses.miamiViceBorder : ''}`}
                 style={!isDarkMode ? {
                   boxShadow: '0 0 30px #ff007f, 0 0 60px rgba(255, 0, 127, 0.3), inset 0 0 30px rgba(138, 43, 226, 0.2)'
                 } : {}}>
              <div className="flex flex-col items-center justify-center mb-4">
                {/* Weather Icon Container - ensure perfect centering */}
                <div className="flex justify-center items-center mb-4 w-full">
                  <WeatherIcon condition={weather.current.condition} size="large" />
                </div>
                {/* Temperature Display - ensure perfect centering */}
                <div className="flex justify-center items-center w-full">
                  <div className={`text-6xl font-bold ${themeClasses.headerText} pixel-glow mb-2 ${themeClasses.miamiViceGlow}`}
                       style={!isDarkMode ? {
                         textShadow: '0 0 20px #ff007f, 0 0 40px #ff007f, 0 0 60px #ff007f'
                       } : {}}>{weather.current.temp}°</div>
                </div>
                <div className={`text-lg uppercase tracking-wider ${themeClasses.accentText} mb-1 text-center ${themeClasses.miamiViceGlow}`}>{weather.current.condition}</div>
                <div className={`text-xs ${themeClasses.secondaryText} capitalize text-center ${themeClasses.miamiViceGlow}`}>{weather.current.description}</div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className={`${themeClasses.background} p-3 border ${themeClasses.secondaryText} text-center ${!isDarkMode ? 'border-[#ff1493] shadow-[0_0_10px_#ff1493]' : ''}`} 
                     style={!isDarkMode ? { 
                       borderColor: '#ff1493',
                       background: 'linear-gradient(135deg, #1a0033, #2d1b69)',
                       boxShadow: '0 0 15px #ff1493, inset 0 0 10px rgba(255, 20, 147, 0.1)'
                     } : { borderColor: '#4ecdc4' }}>
                  <div className={`text-xs ${themeClasses.secondaryText} mb-1`}>HUMIDITY</div>
                  <div className={`text-lg font-bold ${themeClasses.successText} ${themeClasses.miamiViceGlow}`}>{weather.current.humidity}%</div>
                </div>
                <div className={`${themeClasses.background} p-3 border ${themeClasses.secondaryText} text-center ${!isDarkMode ? 'border-[#ff1493] shadow-[0_0_10px_#ff1493]' : ''}`} 
                     style={!isDarkMode ? { 
                       borderColor: '#ff1493',
                       background: 'linear-gradient(135deg, #1a0033, #2d1b69)',
                       boxShadow: '0 0 15px #ff1493, inset 0 0 10px rgba(255, 20, 147, 0.1)'
                     } : { borderColor: '#4ecdc4' }}>
                  <div className={`text-xs ${themeClasses.secondaryText} mb-1`}>WIND</div>
                  <div dangerouslySetInnerHTML={{ __html: formatWindDisplayHTML(weather.current.windDisplay) }}></div>
                </div>
                <div className={`${themeClasses.background} p-3 border ${themeClasses.secondaryText} text-center ${!isDarkMode ? 'border-[#ff1493] shadow-[0_0_10px_#ff1493]' : ''}`} 
                     style={!isDarkMode ? { 
                       borderColor: '#ff1493',
                       background: 'linear-gradient(135deg, #1a0033, #2d1b69)',
                       boxShadow: '0 0 15px #ff1493, inset 0 0 10px rgba(255, 20, 147, 0.1)'
                     } : { borderColor: '#4ecdc4' }}>
                  <div className={`text-xs ${themeClasses.secondaryText} mb-1`}>DEW POINT</div>
                  <div className={`text-lg font-bold ${themeClasses.successText} ${themeClasses.miamiViceGlow}`}>{weather.current.dewPoint}°</div>
                </div>
                <div className={`${themeClasses.background} p-3 border ${themeClasses.secondaryText} text-center ${!isDarkMode ? 'border-[#ff1493] shadow-[0_0_10px_#ff1493]' : ''}`} 
                     style={!isDarkMode ? { 
                       borderColor: '#ff1493',
                       background: 'linear-gradient(135deg, #1a0033, #2d1b69)',
                       boxShadow: '0 0 15px #ff1493, inset 0 0 10px rgba(255, 20, 147, 0.1)'
                     } : { borderColor: '#4ecdc4' }}>
                  <div className={`text-xs ${themeClasses.secondaryText} mb-1`}>UV INDEX</div>
                  <div className={`text-lg font-bold ${themeClasses.successText} ${themeClasses.miamiViceGlow}`}>{weather.current.uvIndex}</div>
                  <div className={`text-xs ${themeClasses.secondaryText} mt-1`}>{weather.current.uvDescription}</div>
                </div>
                
                {/* Pressure Display - spans two columns */}
                <div className={`col-span-2 ${themeClasses.background} p-4 border ${themeClasses.secondaryText} text-center ${!isDarkMode ? 'border-[#ff1493] shadow-[0_0_15px_#ff1493]' : ''}`} 
                     style={!isDarkMode ? { 
                       borderColor: '#ff1493',
                       background: 'linear-gradient(135deg, #4a0e4e, #2d1b69)',
                       boxShadow: '0 0 20px #ff1493, inset 0 0 15px rgba(255, 20, 147, 0.1)'
                     } : { borderColor: '#4ecdc4' }}>
                  <div className={`text-xs ${themeClasses.secondaryText} mb-2 uppercase tracking-wider`}>BAROMETRIC PRESSURE</div>
                  <div className="flex items-center justify-center space-x-3">
                    {/* 16-bit Pressure Gauge */}
                    <div className="relative">
                      <PressureGauge 
                        pressure={weather.current.pressure} 
                        unit={weather.current.country === 'US' ? 'inHg' : 'hPa'}
                        isDarkMode={isDarkMode} 
                      />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${themeClasses.successText} ${themeClasses.miamiViceGlow}`}>{weather.current.pressureDisplay.split(' ')[0]}</div>
                      <div className={`text-xs ${themeClasses.secondaryText} uppercase tracking-wider`}>{weather.current.pressureDisplay.split(' ')[1]}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sunrise/Sunset Info */}
              <div className="mt-4">
                <div className={`flex justify-center space-x-8 px-4 py-3 ${themeClasses.background} border ${themeClasses.secondaryText} ${!isDarkMode ? 'border-[#ff1493] shadow-[0_0_15px_#ff1493]' : ''}`} 
                     style={!isDarkMode ? { 
                       borderColor: '#ff1493',
                       background: 'linear-gradient(135deg, #2d1b69, #4a0e4e)',
                       boxShadow: '0 0 20px #ff1493, inset 0 0 15px rgba(255, 20, 147, 0.2)'
                     } : { borderColor: '#4ecdc4' }}>
                  {/* Sunrise */}
                  <div className="flex items-center space-x-2">
                    <SunriseIcon />
                    <div className="text-center">
                      <div className={`text-xs ${themeClasses.secondaryText} uppercase tracking-wider`}>SUNRISE</div>
                      <div className={`text-sm font-bold ${themeClasses.successText} ${themeClasses.miamiViceGlow}`}>{weather.current.sunrise}</div>
                    </div>
                  </div>

                  {/* Sunset */}
                  <div className="flex items-center space-x-2">
                    <SunsetIcon />
                    <div className="text-center">
                      <div className={`text-xs ${themeClasses.secondaryText} uppercase tracking-wider`}>SUNSET</div>
                      <div className={`text-sm font-bold ${themeClasses.accentText} ${themeClasses.miamiViceGlow}`}>{weather.current.sunset}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Forecast */}
            <Forecast forecast={weather.forecast} isDarkMode={isDarkMode} />

            {/* Moon Phase Info */}
            <div className="mt-4 text-center">
              <div className={`inline-block ${themeClasses.background} border ${themeClasses.secondaryText} px-3 py-2 ${!isDarkMode ? 'border-[#8a2be2] shadow-[0_0_15px_#8a2be2]' : ''}`} 
                   style={!isDarkMode ? { 
                     borderColor: '#8a2be2',
                     background: 'linear-gradient(135deg, #4a0e4e, #2d1b69)',
                     boxShadow: '0 0 15px #8a2be2, inset 0 0 10px rgba(138, 43, 226, 0.2)'
                   } : { borderColor: '#4ecdc4' }}>
                <div className={`text-xs ${themeClasses.secondaryText} uppercase tracking-wider ${themeClasses.miamiViceGlow}`}>
                  🌙 LUNAR: {weather.moonPhase.phase} • {weather.moonPhase.illumination}% LIT
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome message for first-time users */}
        {!hasSearched && !loading && !weather && !error && (
          <div className="text-center py-8 relative z-10">
            <div className={`${themeClasses.secondaryText} mb-4`}>
              <div className="text-2xl mb-2">🌤️</div>
              <div className="text-lg uppercase tracking-wider">WELCOME TO 16-BIT WEATHER</div>
            </div>
            <div className={`text-sm ${themeClasses.accentText} uppercase tracking-wider mb-4 ${themeClasses.miamiViceGlow}`}>
              {!isDarkMode && 'MIAMI VICE MODE • '}MULTIPLE FORMAT SUPPORT
            </div>
            <div className={`text-xs ${themeClasses.secondaryText} space-y-1`}>
              <div>► ZIP CODES: 90210, 10001</div>
              <div>► US CITIES: Los Angeles, CA</div>
              <div>► INTERNATIONAL: London, UK</div>
              <div>► OR USE YOUR LOCATION</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className={`mt-8 text-center text-xs ${themeClasses.secondaryText} relative z-10`}>
          {!API_KEY && (
            <div className={`${themeClasses.warningText} text-center`}>
              ⚠ API KEY NOT CONFIGURED
            </div>
          )}
        </footer>
      </div>
    </div>
  )
}

// Custom 8-bit style weather icons
function WeatherIcon({ condition, size }: { condition: string; size: "small" | "large" }) {
  const sizeClass = size === "large" ? "w-20 h-20" : "w-8 h-8"

  const iconStyle = {
    imageRendering: "pixelated" as const,
    filter: "contrast(1.2) saturate(1.3)",
  }

  switch (condition.toLowerCase()) {
    case "sunny":
      return (
        <div className={cn("relative mx-auto", sizeClass)} style={iconStyle}>
          <div className="absolute inset-1 bg-[#ffe66d] rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/5 h-3/5 bg-[#ffcc02] rounded-full"></div>
          {/* Sun rays - contained within boundary */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-[#ffe66d]"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-[#ffe66d]"></div>
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-2 h-0.5 bg-[#ffe66d]"></div>
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-0.5 bg-[#ffe66d]"></div>
        </div>
      )
    case "cloudy":
      return (
        <div className={cn("relative mx-auto", sizeClass)} style={iconStyle}>
          <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-[#e0e0e0] rounded-full"></div>
          <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-[#b0b0b0] rounded-full"></div>
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-[#d0d0d0] rounded-full"></div>
        </div>
      )
    case "rainy":
      return (
        <div className={cn("relative mx-auto", sizeClass)} style={iconStyle}>
          {/* Cloud */}
          <div className="absolute top-0 left-0 w-3/4 h-1/2 bg-[#6c7b7f] rounded-full"></div>
          <div className="absolute top-1/4 right-0 w-3/4 h-1/2 bg-[#5a6c70] rounded-full"></div>
          {/* Rain drops */}
          <div className="absolute bottom-0 left-1/4 w-1 h-1/3 bg-[#00d4ff]"></div>
          <div className="absolute bottom-0 left-1/2 w-1 h-1/4 bg-[#00d4ff]"></div>
          <div className="absolute bottom-0 right-1/4 w-1 h-1/3 bg-[#00d4ff]"></div>
        </div>
      )
    case "snowy":
      return (
        <div className={cn("relative mx-auto", sizeClass)} style={iconStyle}>
          {/* Cloud */}
          <div className="absolute top-0 left-0 w-3/4 h-1/2 bg-[#d0d0d0] rounded-full"></div>
          <div className="absolute top-1/4 right-0 w-3/4 h-1/2 bg-[#b8b8b8] rounded-full"></div>
          {/* Snow flakes */}
          <div className="absolute bottom-1 left-1/4 w-2 h-2 bg-white transform rotate-45"></div>
          <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-white transform rotate-45"></div>
          <div className="absolute bottom-1 right-1/4 w-2 h-2 bg-white transform rotate-45"></div>
        </div>
      )
    default:
      return (
        <div className={cn("relative mx-auto", sizeClass)} style={iconStyle}>
          <div className="absolute inset-0 bg-[#ffe66d] rounded-full"></div>
        </div>
      )
  }
}

// Moon Phase Watermark Component
function MoonPhaseWatermark({ phase, phaseAngle, illumination, isDarkMode }: { 
  phase: string; 
  phaseAngle: number; 
  illumination: number; 
  isDarkMode: boolean; 
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
      <div className={`opacity-[0.06] transform scale-125 translate-x-8 translate-y-4 ${isDarkMode ? 'text-[#4ecdc4]' : 'text-[#e0e0e0]'}`}>
        <MoonSVG phase={phase} phaseAngle={phaseAngle} illumination={illumination} />
      </div>
    </div>
  );
}

// Custom SVG Moon Phase Component
function MoonSVG({ phase, phaseAngle, illumination }: { 
  phase: string; 
  phaseAngle: number; 
  illumination: number; 
}) {
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  
  // Simplified moon phase visualization using emoji-style approach
  const getMoonShape = () => {
    if (phase === 'New Moon') {
      return (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          opacity="0.3"
        />
      );
    }
    
    if (phase === 'Full Moon') {
      return (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="currentColor"
          opacity="0.3"
        />
      );
    }
    
    // For crescent and gibbous phases, use a simple approach
    const isWaxing = phaseAngle <= 180;
    const phaseProgress = phaseAngle <= 180 ? phaseAngle / 180 : (360 - phaseAngle) / 180;
    
    // Calculate illuminated width
    const illuminatedWidth = radius * 2 * (illumination / 100);
    
    return (
      <g>
        {/* Moon outline */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.2"
        />
        
        {/* Illuminated portion */}
        <ellipse
          cx={isWaxing ? centerX - radius + illuminatedWidth/2 : centerX + radius - illuminatedWidth/2}
          cy={centerY}
          rx={illuminatedWidth/2}
          ry={radius}
          fill="currentColor"
          opacity="0.25"
        />
      </g>
    );
  };

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="text-[#4ecdc4]">
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      
      {/* Glow effect */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius + 20}
        fill="url(#moonGlow)"
      />
      
      {/* Moon shape */}
      {getMoonShape()}
      
      {/* Phase name and illumination - positioned below */}
      <text
        x={centerX}
        y={centerY + radius + 25}
        textAnchor="middle"
        className="fill-current text-[10px] font-mono uppercase tracking-wider opacity-40"
      >
        {phase.replace(' ', '\u00A0')}
      </text>
      <text
        x={centerX}
        y={centerY + radius + 38}
        textAnchor="middle"
        className="fill-current text-[9px] font-mono opacity-30"
      >
        {illumination}% ILLUMINATED
      </text>
    </svg>
  );
}

// 16-bit pixel art sunrise icon
function SunriseIcon() {
  return (
    <div className="relative w-8 h-8" style={{ imageRendering: "pixelated" as const }}>
      {/* Ground line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#4ecdc4]"></div>
      
      {/* Sun */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#ffe66d] rounded-full"></div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#ffcc02] rounded-full"></div>
      
      {/* Sun rays */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-[#ffe66d]"></div>
      <div className="absolute bottom-2 left-2 w-1.5 h-0.5 bg-[#ffe66d] transform rotate-45 origin-right"></div>
      <div className="absolute bottom-2 right-2 w-1.5 h-0.5 bg-[#ffe66d] transform -rotate-45 origin-left"></div>
      
      {/* Upward arrow indicating sunrise */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-[#4ecdc4]"></div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-0.5">
        <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-[#4ecdc4]"></div>
      </div>
    </div>
  );
}

// 16-bit pixel art sunset icon
function SunsetIcon() {
  return (
    <div className="w-5 h-5 relative">
      {/* Sunset rays */}
      <div className="absolute top-0 left-1 w-0.5 h-1 bg-[#ff6b6b]"></div>
      <div className="absolute top-0 right-1 w-0.5 h-1 bg-[#ff6b6b]"></div>
      <div className="absolute top-1 left-0 w-1 h-0.5 bg-[#ff6b6b]"></div>
      <div className="absolute top-1 right-0 w-1 h-0.5 bg-[#ff6b6b]"></div>
      
      {/* Sun (lower position for sunset) */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#ff6b6b] rounded-full"></div>
      <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#ff9999] rounded-full"></div>
      
      {/* Horizon line */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4ecdc4]"></div>
    </div>
  )
}

// 16-bit Pressure Gauge Component
function PressureGauge({ pressure, unit, isDarkMode }: { pressure: number; unit: 'hPa' | 'inHg'; isDarkMode: boolean }) {
  // Convert pressure to display unit
  const displayPressure = unit === 'inHg' ? pressure * 0.02953 : pressure;
  
  // Pressure ranges for visual indication (adjusted for unit)
  const getPressureLevel = (pressure: number, unit: 'hPa' | 'inHg'): 'low' | 'normal' | 'high' => {
    if (unit === 'inHg') {
      // inHg ranges: Low < 29.53, Normal 29.53-30.12, High > 30.12
      if (pressure < 29.53) return 'low';
      if (pressure > 30.12) return 'high';
      return 'normal';
    } else {
      // hPa ranges: Low < 1000, Normal 1000-1020, High > 1020
      if (pressure < 1000) return 'low';
      if (pressure > 1020) return 'high';
      return 'normal';
    }
  };

  const pressureLevel = getPressureLevel(displayPressure, unit);
  
  // Calculate gauge fill percentage (normalized for each unit)
  let fillPercentage: number;
  if (unit === 'inHg') {
    // inHg range: 28.90 - 30.70 inHg
    const minPressure = 28.90;
    const maxPressure = 30.70;
    fillPercentage = Math.max(0, Math.min(100, ((displayPressure - minPressure) / (maxPressure - minPressure)) * 100));
  } else {
    // hPa range: 980-1040 hPa
    const minPressure = 980;
    const maxPressure = 1040;
    fillPercentage = Math.max(0, Math.min(100, ((displayPressure - minPressure) / (maxPressure - minPressure)) * 100));
  }

  // Color schemes for different pressure levels
  const getGaugeColors = () => {
    if (!isDarkMode) {
      // Miami Vice colors
      switch (pressureLevel) {
        case 'low': return { fill: '#ff1493', bg: '#4a0e4e', border: '#ff007f' };
        case 'high': return { fill: '#00ffff', bg: '#1a0033', border: '#00d4ff' };
        default: return { fill: '#ff69b4', bg: '#4a0e4e', border: '#ff1493' };
      }
    } else {
      // Dark mode colors
      switch (pressureLevel) {
        case 'low': return { fill: '#ff6b6b', bg: '#2d1b1b', border: '#ff4444' };
        case 'high': return { fill: '#4ecdc4', bg: '#1a2d2b', border: '#36b3aa' };
        default: return { fill: '#ffe66d', bg: '#2d2b1a', border: '#ffcc02' };
      }
    }
  };

  const colors = getGaugeColors();

  return (
    <div className="relative w-12 h-8">
      {/* Gauge Background */}
      <div 
        className="absolute inset-0 border-2 rounded-sm"
        style={{ 
          backgroundColor: colors.bg,
          borderColor: colors.border,
          boxShadow: `0 0 8px ${colors.border}`
        }}
      >
        {/* Gauge Fill */}
        <div 
          className="absolute bottom-0 left-0 rounded-sm transition-all duration-300"
          style={{ 
            width: '100%',
            height: `${fillPercentage}%`,
            backgroundColor: colors.fill,
            boxShadow: `inset 0 0 4px ${colors.fill}`
          }}
        />
        
        {/* Gauge Markers */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Top marker */}
          <div 
            className="absolute top-0 left-0 w-full h-0.5 opacity-60"
            style={{ backgroundColor: colors.border }}
          />
          {/* Middle marker */}
          <div 
            className="absolute top-1/2 left-0 w-full h-0.5 opacity-40 transform -translate-y-1/2"
            style={{ backgroundColor: colors.border }}
          />
          {/* Bottom marker */}
          <div 
            className="absolute bottom-0 left-0 w-full h-0.5 opacity-60"
            style={{ backgroundColor: colors.border }}
          />
        </div>
      </div>
      
      {/* Pressure Status Indicator */}
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
        <div 
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: colors.fill }}
        />
      </div>
    </div>
  );
}
