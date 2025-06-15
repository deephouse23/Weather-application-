"use client"

import React, { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchWeatherData, fetchWeatherByLocation } from "@/lib/weather-api"

// Note: UV Index data is now only available in One Call API 3.0 (paid subscription required)
// The main weather API handles UV index estimation for free accounts

const formatPressureByRegion = (pressureHPa: number, countryCode: string): string => {
  const shouldUseInchesOfMercury = (countryCode: string): boolean => {
    const inHgCountries = ['US', 'CA', 'PR', 'VI', 'GU', 'AS', 'MP'];
    return inHgCountries.includes(countryCode);
  };

  if (shouldUseInchesOfMercury(countryCode)) {
    const inHg = pressureHPa * 0.02953;
    return `${inHg.toFixed(2)} inHg`;
  } else {
    return `${Math.round(pressureHPa)} hPa`;
  }
};
import WeatherSearch from "@/components/weather-search"
import Forecast from "@/components/forecast"
import RadarDisplay from "@/components/radar-display"
import PageWrapper from "@/components/page-wrapper"
import HistoricalChart from "@/components/historical-chart"
import { Analytics } from "@vercel/analytics/react"
import Link from "next/link"
import { Cloud, Zap, Flame } from "lucide-react"

// Get API key from environment variables for production deployment
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

// Theme types
type ThemeType = 'dark' | 'miami' | 'tron';

// Helper function to determine pressure unit (matches weather API logic)
const getPressureUnit = (countryCode: string): 'hPa' | 'inHg' => {
  const inHgCountries = ['US', 'CA', 'PR', 'VI', 'GU', 'AS', 'MP'];
  return inHgCountries.includes(countryCode) ? 'inHg' : 'hPa';
};

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
    lat: number; // Latitude coordinates for radar
    lon: number; // Longitude coordinates for radar
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

function WeatherApp() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [hasSearched, setHasSearched] = useState(false)
  const [lastSearchTerm, setLastSearchTerm] = useState<string>("")
  const [currentLocation, setCurrentLocation] = useState<string>("")
  const [locationInput, setLocationInput] = useState<string>("")
  const [isOnCooldown, setIsOnCooldown] = useState(false)
  const [remainingSearches, setRemainingSearches] = useState(10)
  const [rateLimitError, setRateLimitError] = useState<string>("")
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('dark')
  const [showRadar, setShowRadar] = useState(false)
  const [historicalData, setHistoricalData] = useState<any>(null)
  const [showHistoricalChart, setShowHistoricalChart] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // localStorage keys
  const CACHE_KEY = 'bitweather_city'
  const WEATHER_KEY = 'bitweather_weather_data'
  const CACHE_TIMESTAMP_KEY = 'bitweather_cache_timestamp'
  const RATE_LIMIT_KEY = 'weather-app-rate-limit'
  const MAX_REQUESTS_PER_HOUR = 10
  const COOLDOWN_SECONDS = 2

  // Rate limiting for API calls (5 per minute max)
  const RATE_LIMIT_WINDOW = 60000 // 1 minute
  const MAX_REQUESTS = 5

  // Client-side mount effect
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load cached location function
  const loadCachedLocation = () => {
    if (!isClient) return
    try {
      const cachedLocation = localStorage.getItem(CACHE_KEY)
      if (cachedLocation) {
        setLocationInput(cachedLocation)
        setCurrentLocation(cachedLocation)
      }
    } catch (error) {
      console.warn('Failed to load cached location:', error)
    }
  }

  // Load theme function
  const loadTheme = () => {
    if (!isClient) return
    const storedTheme = getStoredTheme()
    setCurrentTheme(storedTheme)
  }

  // Set data function (for cached weather data)
  const setData = (weatherData: WeatherData) => {
    setWeather(weatherData)
    setError("")
  }

  // Load cached data and theme on component mount
  useEffect(() => {
    if (!isClient) return
    
    loadCachedLocation()
    loadTheme()
    
    // Check for existing cached data when component mounts
    const checkCacheAndLoad = async () => {
      try {
        const cachedLocationData = localStorage.getItem(CACHE_KEY)
        const cachedWeatherData = localStorage.getItem(WEATHER_KEY)
        const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
        
        if (cachedLocationData && cachedWeatherData && cacheTimestamp) {
          const cacheAge = Date.now() - parseInt(cacheTimestamp)
          
          // Only auto-load if cache is fresh (less than 10 minutes) and user had a previous session
          if (cacheAge < 10 * 60 * 1000) {
            const weather = JSON.parse(cachedWeatherData)
            
            // Note: UV index selective refresh removed since One Call API 2.5 was deprecated
            // UV index is now estimated by the main weather API function
            
            setData(weather)
            setLocationInput(cachedLocationData)
            setHasSearched(true)
          }
        }
      } catch (error) {
        console.warn('Cache check failed:', error)
      }
    }
    
    checkCacheAndLoad()
  }, [isClient])

  // Load historical weather data for today's date
  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        const today = new Date()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        const currentYear = today.getFullYear()
        const startYear = currentYear - 30
        
        // Use New York as default location for historical data
        const response = await fetch(
          `https://archive-api.open-meteo.com/v1/archive?latitude=40.7128&longitude=-74.0060&start_date=${startYear}-${month}-${day}&end_date=${currentYear}-${month}-${day}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
        )
        
        if (response.ok) {
          const data = await response.json()
          setHistoricalData(data)
        }
      } catch (error) {
        console.warn('Historical data unavailable:', error)
      }
    }
    
    loadHistoricalData()
  }, [])

  // Enhanced theme management functions
  const getStoredTheme = (): ThemeType => {
    if (!isClient) return 'dark'
    try {
      const stored = localStorage.getItem('weather-edu-theme')
      if (stored && ['dark', 'miami', 'tron'].includes(stored)) {
        return stored as ThemeType
      }
    } catch (error) {
      console.warn('Failed to get stored theme:', error)
    }
    return 'dark' // Default to dark theme
  }

  // Load theme on mount and sync with navigation
  useEffect(() => {
    if (!isClient) return
    
    const storedTheme = getStoredTheme()
    setCurrentTheme(storedTheme)
    
    // Listen for theme changes from navigation
    const handleStorageChange = () => {
      const newTheme = getStoredTheme()
      setCurrentTheme(newTheme)
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Poll for theme changes (in case of same-tab changes)
    const interval = setInterval(() => {
      const newTheme = getStoredTheme()
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme)
      }
    }, 100)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [isClient, currentTheme])

  // Enhanced theme classes for three themes with authentic Tron movie colors
  const getThemeClasses = (theme: ThemeType) => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-[#0f0f0f]',
          cardBg: 'bg-[#0f0f0f]',
          borderColor: 'border-[#00d4ff]',
          text: 'text-[#e0e0e0]',
          headerText: 'text-[#00d4ff]',
          secondaryText: 'text-[#e0e0e0]',
          accentText: 'text-[#00d4ff]',
          successText: 'text-[#00ff00]',
          glow: 'glow-dark',
          specialBorder: 'border-[#00d4ff]',
          buttonHover: 'hover:bg-[#00d4ff] hover:text-[#0f0f0f]'
        }
      case 'miami':
        return {
          background: 'bg-[#0a0025]',
          cardBg: 'bg-[#0a0025]',
          borderColor: 'border-[#ff1493]',
          text: 'text-[#00ffff]',
          headerText: 'text-[#ff1493]',
          secondaryText: 'text-[#00ffff]',
          accentText: 'text-[#ff1493]',
          successText: 'text-[#00ff00]',
          glow: 'glow-miami',
          specialBorder: 'border-[#ff1493]',
          buttonHover: 'hover:bg-[#ff1493] hover:text-[#0a0025]'
        }
      case 'tron':
        return {
          background: 'bg-black',
          cardBg: 'bg-black',
          borderColor: 'border-[#00FFFF]',
          text: 'text-white',
          headerText: 'text-[#00FFFF]',
          secondaryText: 'text-[#00FFFF]',
          accentText: 'text-[#00FFFF]',
          successText: 'text-[#00ff00]',
          glow: 'glow-tron',
          specialBorder: 'border-[#00FFFF]',
          buttonHover: 'hover:bg-[#00FFFF] hover:text-black'
        }
    }
  }

  const themeClasses = getThemeClasses(currentTheme)

  // Rate limiting functions
  const getRateLimitData = () => {
    if (!isClient) return { requests: [], lastReset: Date.now() }
    try {
      const data = localStorage.getItem(RATE_LIMIT_KEY)
      if (data) {
        return JSON.parse(data)
      }
    } catch (error) {
      console.warn('Failed to get rate limit data:', error)
    }
    return { requests: [], lastReset: Date.now() }
  }

  const saveRateLimitData = (data: { requests: number[], lastReset: number }) => {
    if (!isClient) return
    try {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data))
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
    if (!isClient) return
    const { remaining } = checkRateLimit()
    setRemainingSearches(remaining)
  }, [isClient])

  // Save location to cache (silent)
  const saveLocationToCache = (location: string) => {
    if (!isClient) return
    try {
      localStorage.setItem(CACHE_KEY, location)
    } catch (error) {
      console.warn('Failed to save location to cache:', error)
    }
  }

  // Save weather data to cache
  const saveWeatherToCache = (weatherData: WeatherData) => {
    if (!isClient) return
    try {
      localStorage.setItem(WEATHER_KEY, JSON.stringify(weatherData))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (error) {
      console.warn('Failed to save weather data to cache:', error)
    }
  }

  const handleSearchWrapper = (locationInput: string) => {
    handleSearch(locationInput)
  }

  const handleSearch = async (locationInput: string, fromCache: boolean = false, bypassRateLimit: boolean = false) => {
    if (!locationInput.trim()) {
      setError("Please enter a location")
      return
    }

    // Check if API key is available
    if (!API_KEY) {
      setError("🔧 Weather service is temporarily unavailable. Please try again later or contact support.")
      return
    }

    // Check rate limit only for non-cached requests
    if (!bypassRateLimit) {
      const rateLimitCheck = checkRateLimit()
      if (!rateLimitCheck.allowed) {
        setRateLimitError(rateLimitCheck.message || "Rate limit exceeded")
        return
      }
    }

    setLoading(true)
    setError("")
    setRateLimitError("")
    setHasSearched(true)
    setCurrentLocation(locationInput)
    
    // Show cooldown state
    setIsOnCooldown(true)
    setTimeout(() => setIsOnCooldown(false), COOLDOWN_SECONDS * 1000)

    try {
      // Fix API call - fetchWeatherData expects (locationInput, apiKey)
      const weatherData = await fetchWeatherData(locationInput, API_KEY)
      setWeather(weatherData)
      setLastSearchTerm(locationInput)

      // Record the request for rate limiting (only for non-cached)
      if (!bypassRateLimit) {
        recordRequest()
        const { remaining } = checkRateLimit()
        setRemainingSearches(remaining)
      }

      // Save to cache (silent) - now using bitweather_city key
      if (!fromCache) {
        saveLocationToCache(locationInput)
      }

      // Save weather data to cache
      saveWeatherToCache(weatherData)
    } catch (err) {
      // Enhanced error handling with friendly fallbacks
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch weather data"
      
      // If this was our default San Francisco load and it failed, try a different fallback
      if (locationInput.includes("San Francisco") && fromCache) {
        console.warn("San Francisco default failed, trying New York as fallback")
        try {
          const fallbackData = await fetchWeatherData("New York, NY", API_KEY)
          setWeather(fallbackData)
          setLastSearchTerm("New York, NY")
          saveLocationToCache("New York, NY")
          return
        } catch (fallbackErr) {
          setError("🌡️ Weather services are temporarily unavailable. Please try again in a moment.")
        }
      } else {
        // User search failed - show friendly error
        if (errorMessage.includes("not found") || errorMessage.includes("404")) {
          setError(`🔍 Location "${locationInput}" not found. Please try a different city name, ZIP code, or format.`)
        } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
          setError("🌐 Network connection issue. Please check your internet and try again.")
        } else {
          setError("🌡️ Weather data temporarily unavailable. Please try again in a moment.")
        }
      }
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSearch = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      return
    }

    // Check if API key is available
    if (!API_KEY) {
      setError("🔧 Weather service is temporarily unavailable. Please try again later or contact support.")
      return
    }

    // Check rate limit
    const rateLimitCheck = checkRateLimit()
    if (!rateLimitCheck.allowed) {
      setRateLimitError(rateLimitCheck.message || "Rate limit exceeded")
      return
    }

    setLoading(true)
    setError("")
    setRateLimitError("")
    setHasSearched(true)
    setCurrentLocation("Getting your location...")
    
    // Show cooldown state
    setIsOnCooldown(true)
    setTimeout(() => setIsOnCooldown(false), COOLDOWN_SECONDS * 1000)

    try {
      // Fix API call - fetchWeatherByLocation expects only (apiKey)
      const weatherData = await fetchWeatherByLocation(API_KEY)
      setWeather(weatherData)
      setCurrentLocation(weatherData.current.location)
      setLastSearchTerm(weatherData.current.location)

      // Record the request for rate limiting
      recordRequest()
      const { remaining } = checkRateLimit()
      setRemainingSearches(remaining)

      // Save to cache (silent)
      saveLocationToCache(weatherData.current.location)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data")
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const formatWindDisplayHTML = (windDisplay: string): string => {
    // Convert wind display to HTML for colored wind speeds
    return windDisplay.replace(/(\d+)\s*(mph|km\/h)/gi, '<span class="wind-speed">$1 $2</span>')
  }

  // Tron Animated Grid Background Component - Same as PageWrapper
  const TronGridBackground = () => {
    if (currentTheme !== 'tron') return null;
    
    return (
      <>
        <style jsx>{`
          @keyframes tronWave {
            0% {
              transform: translateY(100vh);
              opacity: 0.8;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translateY(-100vh);
              opacity: 0.8;
            }
          }

          .tron-grid-base {
            background-image: 
              linear-gradient(rgba(0, 220, 255, 0.18) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 220, 255, 0.18) 1px, transparent 1px);
            background-size: 50px 50px;
          }

          .tron-grid-detail {
            background-image: 
              linear-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 240, 255, 0.08) 1px, transparent 1px);
            background-size: 10px 10px;
          }

          .tron-wave {
            background: linear-gradient(
              to top,
              transparent 0%,
              rgba(0, 204, 255, 0.4) 45%,
              rgba(0, 240, 255, 0.6) 50%,
              rgba(0, 204, 255, 0.4) 55%,
              transparent 100%
            );
            height: 200px;
            width: 100%;
            animation: tronWave 3.5s infinite linear;
            filter: blur(2px);
          }

          .tron-wave-glow {
            background: linear-gradient(
              to top,
              transparent 0%,
              rgba(0, 220, 255, 0.2) 40%,
              rgba(0, 240, 255, 0.35) 50%,
              rgba(0, 220, 255, 0.2) 60%,
              transparent 100%
            );
            height: 300px;
            width: 100%;
            animation: tronWave 3.5s infinite linear;
            animation-delay: 0.2s;
            filter: blur(4px);
          }

          .tron-pulse-grid {
            background-image: 
              linear-gradient(rgba(0, 220, 255, 0.25) 2px, transparent 2px),
              linear-gradient(90deg, rgba(0, 220, 255, 0.25) 2px, transparent 2px);
            background-size: 50px 50px;
            animation: tronGridPulse 3.5s infinite linear;
          }

          @keyframes tronGridPulse {
            0%, 100% {
              opacity: 0.1;
            }
            50% {
              opacity: 0.3;
            }
          }
        `}</style>
        
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Base static grid */}
          <div className="absolute inset-0 tron-grid-base opacity-15" />
          
          {/* Detail grid */}
          <div className="absolute inset-0 tron-grid-detail opacity-8" />
          
          {/* Pulsing grid overlay */}
          <div className="absolute inset-0 tron-pulse-grid" />
          
          {/* Animated wave effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="tron-wave absolute left-0 right-0" />
          </div>
          
          {/* Secondary wave with glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="tron-wave-glow absolute left-0 right-0" />
          </div>
          
          {/* Subtle corner accent lines */}
          <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#00DCFF] opacity-25"></div>
          <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[#00DCFF] opacity-25"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[#00DCFF] opacity-25"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#00DCFF] opacity-25"></div>
        </div>
      </>
    );
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} relative overflow-x-hidden`}>
      {/* Tron Light Cycle Watermark - only in Tron theme */}
      {currentTheme === 'tron' && <TronLightCycleWatermark />}
      
      {/* Mobile-optimized main container with proper responsive padding */}
      <div className="w-full min-h-screen flex flex-col items-center px-2 sm:px-4 py-4">
        {/* Hero Section - Mobile responsive */}
        <div className="w-full max-w-7xl mx-auto text-center mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6">
            <h1 className={`text-2xl sm:text-4xl md:text-6xl font-bold mb-2 sm:mb-4 font-mono uppercase tracking-wider ${themeClasses.headerText} ${themeClasses.glow} break-words`}>
              16-BIT WEATHER
            </h1>
          </div>

          {/* Weather Search Component - Mobile optimized */}
          <div className="mb-6 sm:mb-8 w-full">
            <WeatherSearch
              onSearch={handleSearchWrapper}
              onLocationSearch={handleLocationSearch}
              isLoading={loading}
              error={error}
              isDisabled={isOnCooldown || remainingSearches <= 0}
              rateLimitError={rateLimitError}
              theme={currentTheme}
            />
          </div>
        </div>

        {/* Main Content - Mobile responsive container */}
        <div className="w-full max-w-7xl mx-auto">
          {/* Error Display - Mobile optimized */}
          {error && (
            <div className={`${themeClasses.cardBg} p-3 sm:p-6 border-2 sm:border-4 pixel-border text-center ${themeClasses.borderColor} mb-4 sm:mb-6 mx-2 sm:mx-0`}>
              <p className={`${themeClasses.accentText} font-mono text-sm sm:text-lg font-bold`}>⚠ ERROR</p>
              <p className={`${themeClasses.text} mt-1 sm:mt-2 text-xs sm:text-base break-words`}>{error}</p>
            </div>
          )}

          {weather && (
            <div className="space-y-4 sm:space-y-6">
              {/* Current Weather */}
              <div className={`${themeClasses.cardBg} p-4 sm:p-6 lg:p-8 border-2 sm:border-4 pixel-border ${themeClasses.borderColor} ${themeClasses.specialBorder} text-center`}>
                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 font-mono uppercase tracking-wider ${themeClasses.headerText}`}>
                  CURRENT CONDITIONS
                </h2>
                
                <div className="mb-4 sm:mb-6">
                  <p className={`${themeClasses.secondaryText} font-mono text-sm sm:text-base`}>
                    {weather.current.location}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Temperature */}
                  <div className={`${themeClasses.background} p-4 border-2 ${themeClasses.secondaryText} ${themeClasses.specialBorder}`}>
                    <h3 className={`${themeClasses.headerText} font-mono text-lg mb-2`}>Temperature</h3>
                    <p className={`${themeClasses.text} text-2xl sm:text-3xl`}>
                      {weather.current.temp}°F
                    </p>
                  </div>

                  {/* Conditions */}
                  <div className={`${themeClasses.background} p-4 border-2 ${themeClasses.secondaryText} ${themeClasses.specialBorder}`}>
                    <h3 className={`${themeClasses.headerText} font-mono text-lg mb-2`}>Conditions</h3>
                    <p className={`${themeClasses.text} text-2xl sm:text-3xl`}>
                      {weather.current.description}
                    </p>
                  </div>

                  {/* Wind */}
                  <div className={`${themeClasses.background} p-4 border-2 ${themeClasses.secondaryText} ${themeClasses.specialBorder}`}>
                    <h3 className={`${themeClasses.headerText} font-mono text-lg mb-2`}>Wind</h3>
                    <p className={`${themeClasses.text} text-2xl sm:text-3xl`}>
                      {weather.current.wind} mph
                    </p>
                    <p className={`${themeClasses.secondaryText} text-sm`}>
                      {weather.current.windDisplay}
                    </p>
                  </div>

                  {/* Sunrise/Sunset */}
                  <div className={`${themeClasses.background} p-4 border-2 ${themeClasses.secondaryText} ${themeClasses.specialBorder}`}>
                    <h3 className={`${themeClasses.headerText} font-mono text-lg mb-2`}>Sun Times</h3>
                    <div className="space-y-2">
                      <p className={`${themeClasses.text} text-lg`}>
                        🌅 {weather.current.sunrise}
                      </p>
                      <p className={`${themeClasses.text} text-lg`}>
                        🌇 {weather.current.sunset}
                      </p>
                    </div>
                  </div>

                  {/* UV Index */}
                  <div className={`${themeClasses.background} p-4 border-2 ${themeClasses.secondaryText} ${themeClasses.specialBorder}`}>
                    <h3 className={`${themeClasses.headerText} font-mono text-lg mb-2`}>UV Index</h3>
                    <p className={`${themeClasses.text} text-2xl sm:text-3xl`}>
                      {weather.current.uvIndex}
                    </p>
                    <p className={`${themeClasses.secondaryText} text-sm`}>
                      {weather.current.uvDescription}
                    </p>
                  </div>

                  {/* Moon Phase */}
                  <div className={`${themeClasses.background} p-4 border-2 ${themeClasses.secondaryText} ${themeClasses.specialBorder}`}>
                    <h3 className={`${themeClasses.headerText} font-mono text-lg mb-2`}>Moon Phase</h3>
                    <p className={`${themeClasses.text} text-2xl sm:text-3xl`}>
                      {weather.moonPhase.emoji}
                    </p>
                    <p className={`${themeClasses.secondaryText} text-sm`}>
                      {weather.moonPhase.phase}
                    </p>
                    <p className={`${themeClasses.secondaryText} text-xs`}>
                      {weather.moonPhase.illumination}% illuminated
                    </p>
                  </div>
                </div>

                {/* Historical Records */}
                {historicalData && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className={`${themeClasses.background} p-4 border-2 ${themeClasses.secondaryText} ${themeClasses.specialBorder}`}>
                      <h3 className={`${themeClasses.headerText} font-mono text-lg mb-2`}>Record High</h3>
                      <p className={`${themeClasses.text} text-2xl sm:text-3xl`}>
                        {historicalData.daily.temperature_2m_max[0]}°C
                      </p>
                      <p className={`${themeClasses.secondaryText} text-sm`}>
                        Set in {new Date(historicalData.daily.time[0]).getFullYear()}
                      </p>
                    </div>
                    <div className={`${themeClasses.background} p-4 border-2 ${themeClasses.secondaryText} ${themeClasses.specialBorder}`}>
                      <h3 className={`${themeClasses.headerText} font-mono text-lg mb-2`}>Record Low</h3>
                      <p className={`${themeClasses.text} text-2xl sm:text-3xl`}>
                        {historicalData.daily.temperature_2m_min[0]}°C
                      </p>
                      <p className={`${themeClasses.secondaryText} text-sm`}>
                        Set in {new Date(historicalData.daily.time[0]).getFullYear()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Doppler Radar Button */}
                <Link 
                  href={`/radar?lat=${weather.current.lat}&lon=${weather.current.lon}&name=${encodeURIComponent(weather.current.location)}`}
                  className="inline-block"
                >
                  <button
                    className={`px-4 sm:px-6 py-2 sm:py-3 border-2 sm:border-4 text-sm sm:text-lg font-mono font-bold uppercase tracking-wider transition-all duration-300 ${themeClasses.borderColor} ${themeClasses.cardBg} ${themeClasses.headerText} touch-manipulation min-h-[44px] hover:${themeClasses.buttonHover}`}
                  >
                    View Doppler Radar
                  </button>
                </Link>
              </div>

              {/* 5-Day Forecast - Mobile optimized */}
              <div className="mx-2 sm:mx-0">
                <Forecast forecast={weather.forecast} theme={currentTheme} />
              </div>

              {/* Historical Data Chart Widget */}
              <div className="mx-2 sm:mx-0">
                <HistoricalChart 
                  currentTheme={currentTheme}
                  latitude={weather.current.lat}
                  longitude={weather.current.lon}
                  locationName={weather.current.location}
                />
              </div>

              {/* Radar Toggle - Mobile friendly button */}
              <div className="text-center mb-4 sm:mb-6">
                <button
                  onClick={() => setShowRadar(!showRadar)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 border-2 sm:border-4 text-sm sm:text-lg font-mono font-bold uppercase tracking-wider transition-all duration-300 ${themeClasses.borderColor} ${themeClasses.cardBg} ${themeClasses.headerText} touch-manipulation min-h-[44px]`}
                >
                  {showRadar ? '📡 HIDE RADAR' : '📡 SHOW DOPPLER RADAR'}
                </button>
              </div>

              {/* Expanded Doppler Radar Display - Mobile responsive */}
              {showRadar && API_KEY && (
                <div className="w-full mx-2 sm:mx-0">
                  <div className="w-full max-w-7xl mx-auto">
                    <RadarDisplay
                      lat={weather.current.lat}
                      lon={weather.current.lon}
                      apiKey={API_KEY}
                      theme={currentTheme}
                      locationName={weather.current.location}
                    />
                  </div>
                </div>
              )}

              {/* Quick Access Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <Link 
                  href="/cloud-types" 
                  className={`${themeClasses.cardBg} ${themeClasses.borderColor} border-2 p-4 hover:scale-105 transition-all duration-300 ${themeClasses.glow}`}
                >
                  <div className={`${themeClasses.headerText} text-center`}>
                    <Cloud className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-bold text-sm uppercase tracking-wider">Cloud Atlas</div>
                    <div className={`${themeClasses.secondaryText} text-xs mt-1`}>Identify Cloud Types</div>
                  </div>
                </Link>
                
                <Link 
                  href="/weather-systems" 
                  className={`${themeClasses.cardBg} ${themeClasses.borderColor} border-2 p-4 hover:scale-105 transition-all duration-300 ${themeClasses.glow}`}
                >
                  <div className={`${themeClasses.headerText} text-center`}>
                    <Zap className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-bold text-sm uppercase tracking-wider">Weather Systems</div>
                    <div className={`${themeClasses.secondaryText} text-xs mt-1`}>Interactive Database</div>
                  </div>
                </Link>

                <Link 
                  href="/fun-facts" 
                  className={`${themeClasses.cardBg} ${themeClasses.borderColor} border-2 p-4 hover:scale-105 transition-all duration-300 ${themeClasses.glow}`}
                >
                  <div className={`${themeClasses.headerText} text-center`}>
                    <Flame className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-bold text-sm uppercase tracking-wider">16-Bit Takes</div>
                    <div className={`${themeClasses.secondaryText} text-xs mt-1`}>Weather Phenomena</div>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Enhanced Welcome Message - Mobile responsive */}
          {!weather && !loading && (
            <div className={`${themeClasses.cardBg} p-4 sm:p-6 lg:p-8 border-2 sm:border-4 pixel-border text-center ${themeClasses.borderColor} ${themeClasses.specialBorder} mx-2 sm:mx-0`}>
              {/* Cool ASCII Art Header - BIT WEATHER */}
              <div className={`${themeClasses.headerText} font-mono text-xs sm:text-sm mb-4 sm:mb-6 whitespace-pre-line ${themeClasses.glow} overflow-x-auto`}>
                <div className="hidden sm:block">
{`  ▄▄▄▄▄▄▄   ▄▄▄▄▄▄▄   ▄▄▄▄▄▄▄      ▄     ▄   ▄▄▄▄▄▄▄   ▄▄▄▄▄▄▄   ▄▄▄▄▄▄▄   ▄     ▄   ▄▄▄▄▄▄▄   ▄▄▄▄▄▄▄  
 ▐░░░░░░░▌ ▐░░░░░░░▌ ▐░░░░░░░▌    ▐░▌   ▐░▌ ▐░░░░░░░▌ ▐░░░░░░░▌ ▐░░░░░░░▌ ▐░▌   ▐░▌ ▐░░░░░░░▌ ▐░░░░░░░▌ 
 ▐░█▀▀▀█░▌ ▐░█▀▀▀▀▀  ▀▀▀▀█░█▀▀      ▐░▌ ▐░▌  ▐░█▀▀▀▀▀  ▐░█▀▀▀▀▀  ▐░█▀▀▀▀▀  ▐░▌   ▐░▌ ▐░█▀▀▀▀▀  ▐░█▀▀▀▀▀  
 ▐░▌   ▐░▌ ▐░▌           ▐░▌        ▐░▌▐░▌   ▐░█▄▄▄▄▄  ▐░█▄▄▄▄▄  ▐░█▄▄▄▄▄  ▐░▌   ▐░▌ ▐░█▄▄▄▄▄  ▐░█▄▄▄▄▄  
 ▐░█▄▄▄█░▌ ▐░█▄▄▄▄▄      ▐░▌        ▐░▌░▌    ▐░░░░░░░▌ ▐░░░░░░░▌ ▐░░░░░░░▌ ▐░▌   ▐░▌ ▐░░░░░░░▌ ▐░░░░░░░▌ 
 ▐░░░░░░░▌  ▐░░░░░░▌     ▐░▌        ▐░▌ ▐░▌  ▐░█▀▀▀▀▀  ▐░█▀▀▀▀▀  ▐░█▀▀▀▀▀  ▐░▌   ▐░▌ ▐░█▀▀▀▀▀  ▐░█▀▀▀▀▀  
 ▐░█▀▀▀█░▌       ▐░▌     ▐░▌        ▐░▌  ▐░▌ ▐░█▄▄▄▄▄  ▐░█▄▄▄▄▄  ▐░█▄▄▄▄▄  ▐░█▄▄▄█░▌ ▐░█▄▄▄▄▄  ▐░█▄▄▄▄▄  
 ▐░▌   ▐░▌  ▄▄▄▄▄█░▌     ▐░▌        ▐░▌   ▐░▌▐░░░░░░░▌ ▐░░░░░░░▌ ▐░░░░░░░▌ ▐░░░░░░▌  ▐░░░░░░░▌ ▐░░░░░░░▌ 
  ▀     ▀  ▐░░░░░░▌     ▀          ▀     ▀  ▀▀▀▀▀▀▀▀▀   ▀▀▀▀▀▀▀▀   ▀▀▀▀▀▀▀▀   ▀▀▀▀▀▀    ▀▀▀▀▀▀▀▀▀   ▀▀▀▀▀▀▀▀▀  
         ▀▀▀▀▀▀▀▀                                                                                                 `}
                </div>
                <div className="block sm:hidden text-center">
                  <div className={`text-lg font-bold ${themeClasses.headerText}`}>16-BIT WEATHER</div>
                </div>
              </div>
              
              <h3 className={`text-xl sm:text-2xl lg:text-4xl font-bold mb-4 sm:mb-6 font-mono uppercase tracking-wider ${themeClasses.headerText} ${themeClasses.glow} animate-pulse break-words px-2`}>
                🌟 RETRO WEATHER TERMINAL 🌟
              </h3>
              
              <div className={`${themeClasses.text} mb-6 sm:mb-8 font-mono text-sm sm:text-base lg:text-lg space-y-2 sm:space-y-3 px-2`}>
                <p>🎮 Experience weather data like it's 1985!</p>
                <p>📊 Real-time meteorological data with pixel-perfect styling</p>
                <p className="hidden sm:block">🌈 Choose from Dark Terminal, Miami Vice, or Tron Grid themes</p>
                <p className="hidden sm:block">📡 Complete with Doppler radar and atmospheric analysis</p>
              </div>
              
              <div className={`${themeClasses.cardBg} p-3 sm:p-4 lg:p-6 border-2 ${themeClasses.borderColor} mb-6 sm:mb-8 max-w-xl mx-auto ${themeClasses.specialBorder}`}>
                <div className={`${themeClasses.successText} font-mono text-sm sm:text-base font-bold mb-3 sm:mb-4 animate-pulse`}>
                  🔍 LOCATION SEARCH PROTOCOLS:
                </div>
                <div className={`${themeClasses.text} font-mono text-xs sm:text-sm space-y-1 sm:space-y-2`}>
                  <p>📍 <strong>City names:</strong> "Paris", "Tokyo", "London"</p>
                  <p>🏢 <strong>City + State:</strong> "Austin, TX", "Miami, FL"</p>
                  <p>🌍 <strong>City + Country:</strong> "Toronto, Canada"</p>
                  <p>📮 <strong>ZIP/Postal:</strong> "90210", "10001"</p>
                  <p className="hidden sm:block">📍 <strong>Coordinates:</strong> "40.7128,-74.0060"</p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className={`${themeClasses.headerText} font-mono text-lg sm:text-xl font-bold animate-pulse`}>
                  ⚡ SELECT A CITY TO BEGIN YOUR WEATHER QUEST ⚡
                </div>
                <div className={`${themeClasses.secondaryText} font-mono text-xs sm:text-sm`}>
                  Caching enabled • Return visits will load your last searched location
                </div>
              </div>

              {/* Retro Loading Animation - Mobile responsive */}
              <div className="mt-4 sm:mt-6 flex justify-center space-x-2">
                <div className={`w-2 h-2 sm:w-3 sm:h-3 ${themeClasses.cardBg} border ${themeClasses.borderColor} animate-pulse`}></div>
                <div className={`w-2 h-2 sm:w-3 sm:h-3 ${themeClasses.cardBg} border ${themeClasses.borderColor} animate-pulse`} style={{animationDelay: '0.2s'}}></div>
                <div className={`w-2 h-2 sm:w-3 sm:h-3 ${themeClasses.cardBg} border ${themeClasses.borderColor} animate-pulse`} style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tron Animated Grid Background */}
      <TronGridBackground />
    </div>
  )
}

export default function HomePage() {
  return (
    <PageWrapper>
      <WeatherApp />
    </PageWrapper>
  )
}

// Component definitions remain the same...
function WeatherIcon({ condition, size }: { condition: string; size: "small" | "large" }) {
  const iconSize = size === "large" ? "w-16 h-16" : "w-8 h-8"
  
  // Map weather conditions to retro-style icons
  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase()
    
    // Sunny/Clear conditions
    if (cond.includes('clear') || cond.includes('sunny')) {
      return { icon: '☀️', color: '#ffeb3b', bg: '#ff8f00', border: '#f57f17' }
    }
    
    // Cloudy conditions
    if (cond.includes('cloud') || cond.includes('overcast')) {
      return { icon: '☁️', color: '#90a4ae', bg: '#546e7a', border: '#37474f' }
    }
    
    // Rainy conditions
    if (cond.includes('rain') || cond.includes('drizzle')) {
      return { icon: '🌧️', color: '#42a5f5', bg: '#1e88e5', border: '#1565c0' }
    }
    
    // Stormy conditions
    if (cond.includes('thunder') || cond.includes('storm')) {
      return { icon: '⛈️', color: '#5c6bc0', bg: '#3f51b5', border: '#303f9f' }
    }
    
    // Snowy conditions
    if (cond.includes('snow') || cond.includes('blizzard')) {
      return { icon: '❄️', color: '#e3f2fd', bg: '#90caf9', border: '#42a5f5' }
    }
    
    // Foggy/Misty conditions
    if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) {
      return { icon: '🌫️', color: '#bdbdbd', bg: '#757575', border: '#424242' }
    }
    
    // Windy conditions
    if (cond.includes('wind')) {
      return { icon: '💨', color: '#81c784', bg: '#66bb6a', border: '#4caf50' }
    }
    
    // Default fallback
    return { icon: '🌤️', color: '#ff69b4', bg: '#4a0e4e', border: '#ff1493' }
  }

  const { icon, color, bg, border } = getWeatherIcon(condition)

  return (
    <div 
      className={`${iconSize} rounded-lg border-2 flex items-center justify-center text-2xl pixel-border`}
      style={{ 
        backgroundColor: bg,
        borderColor: border,
        boxShadow: `0 0 10px ${color}33`
      }}
    >
      {icon}
    </div>
  )
}

function MoonPhaseWatermark({ phase, phaseAngle, illumination, theme }: { 
  phase: string; 
  phaseAngle: number; 
  illumination: number; 
  theme: ThemeType; 
}) {
  return (
    <div className="w-8 h-8">
      <MoonSVG phase={phase} phaseAngle={phaseAngle} illumination={illumination} />
    </div>
  )
}

function MoonSVG({ phase, phaseAngle, illumination }: { 
  phase: string; 
  phaseAngle: number; 
  illumination: number; 
}) {
  
  const getMoonShape = () => {
    // Normalize phase angle to 0-360
    const normalizedAngle = ((phaseAngle % 360) + 360) % 360
    
    // Define moon phases based on angle ranges
    if (normalizedAngle < 45 || normalizedAngle >= 315) {
      return { emoji: '🌑', name: 'New Moon' }
    } else if (normalizedAngle >= 45 && normalizedAngle < 90) {
      return { emoji: '🌒', name: 'Waxing Crescent' }
    } else if (normalizedAngle >= 90 && normalizedAngle < 135) {
      return { emoji: '🌓', name: 'First Quarter' }
    } else if (normalizedAngle >= 135 && normalizedAngle < 180) {
      return { emoji: '🌔', name: 'Waxing Gibbous' }
    } else if (normalizedAngle >= 180 && normalizedAngle < 225) {
      return { emoji: '🌕', name: 'Full Moon' }
    } else if (normalizedAngle >= 225 && normalizedAngle < 270) {
      return { emoji: '🌖', name: 'Waning Gibbous' }
    } else if (normalizedAngle >= 270 && normalizedAngle < 315) {
      return { emoji: '🌗', name: 'Last Quarter' }
    } else {
      return { emoji: '🌘', name: 'Waning Crescent' }
    }
  }

  const moonPhase = getMoonShape()

  return (
    <div className="w-8 h-8 flex items-center justify-center text-lg">
      {moonPhase.emoji}
    </div>
  )
}

function SunriseIcon() {
  return (
    <div className="w-8 h-8 relative">
      <svg viewBox="0 0 24 24" className="w-full h-full text-orange-400">
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M6 18h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function SunsetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 8l0-4M12 20l0-4M20 12l-4 0M8 12l-4 0" stroke="currentColor" strokeWidth="2"/>
      <path d="M16.24 7.76l-1.41 1.41M9.17 14.83l-1.41 1.41M16.24 16.24l-1.41-1.41M9.17 9.17l-1.41-1.41" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

// Authentic Tron Light Cycle with Blue Tracer Beam - pixelated design
function TronLightCycleWatermark() {
  return (
    <>
      <style jsx>{`
        @keyframes lightCycleGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes tracerBeam {
          0% { transform: translateX(-400px) scaleX(0.5); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(400px) scaleX(1.5); opacity: 0; }
        }
        
        .light-cycle-glow {
          animation: lightCycleGlow 2s infinite ease-in-out;
          filter: drop-shadow(0 0 8px #00DCFF) drop-shadow(0 0 15px #0080FF);
        }
        
        .tracer-beam {
          animation: tracerBeam 8s infinite linear;
        }
      `}</style>
      
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.12]">
        {/* Main Light Cycle positioned in bottom right */}
        <div className="absolute bottom-20 right-20 light-cycle-glow">
          <svg viewBox="0 0 120 60" className="w-32 h-16">
            {/* Light Cycle Body - Authentic pixelated design */}
            {/* Main chassis */}
            <rect x="35" y="25" width="50" height="8" fill="#00DCFF" stroke="#00F0FF" strokeWidth="0.5"/>
            
            {/* Driver section */}
            <rect x="50" y="17" width="20" height="8" fill="#00DCFF" stroke="#00F0FF" strokeWidth="0.5"/>
            <rect x="55" y="12" width="10" height="5" fill="#0080FF" stroke="#00DCFF" strokeWidth="0.5"/>
            
            {/* Front cowling */}
            <rect x="25" y="27" width="10" height="4" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="0.5"/>
            <rect x="20" y="28" width="5" height="2" fill="#00DCFF"/>
            
            {/* Rear section */}
            <rect x="85" y="27" width="15" height="4" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="0.5"/>
            <rect x="100" y="28" width="8" height="2" fill="#00DCFF"/>
            
            {/* Wheels - pixelated circles */}
            <rect x="32" y="33" width="8" height="8" fill="none" stroke="#00DCFF" strokeWidth="1"/>
            <rect x="34" y="35" width="4" height="4" fill="#00F0FF"/>
            
            <rect x="80" y="33" width="8" height="8" fill="none" stroke="#00DCFF" strokeWidth="1"/>
            <rect x="82" y="35" width="4" height="4" fill="#00F0FF"/>
            
            {/* Light strips on cycle */}
            <rect x="25" y="23" width="75" height="1" fill="#00F0FF" opacity="0.8"/>
            <rect x="25" y="37" width="75" height="1" fill="#00F0FF" opacity="0.8"/>
            
            {/* Headlight */}
            <rect x="18" y="29" width="2" height="2" fill="#FFFFFF"/>
            <rect x="16" y="30" width="2" height="1" fill="#00F0FF"/>
          </svg>
        </div>
        
        {/* Animated Blue Tracer Beam */}
        <div className="absolute bottom-28 right-0 w-full overflow-hidden">
          <div className="tracer-beam relative">
            {/* Main beam */}
            <div 
              className="absolute h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
              style={{ 
                width: '300px',
                background: 'linear-gradient(90deg, transparent 0%, #00DCFF 20%, #00F0FF 50%, #00DCFF 80%, transparent 100%)',
                boxShadow: '0 0 8px #00DCFF, 0 0 15px #0080FF'
              }}
            />
            {/* Secondary glow beam */}
            <div 
              className="absolute h-2 -mt-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-60"
              style={{ 
                width: '300px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(0, 220, 255, 0.4) 25%, rgba(0, 240, 255, 0.6) 50%, rgba(0, 220, 255, 0.4) 75%, transparent 100%)',
                filter: 'blur(2px)'
              }}
            />
          </div>
        </div>
        
        {/* Grid floor pattern beneath cycle */}
        <div className="absolute bottom-0 left-0 w-full h-32" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 220, 255, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 220, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          mask: 'linear-gradient(to top, black 0%, transparent 100%)'
        }} />
        
        {/* Horizon line */}
        <div className="absolute bottom-16 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-40" />
      </div>
    </>
  )
}

function PressureGauge({ pressure, unit, theme }: { pressure: number; unit: 'hPa' | 'inHg'; theme: ThemeType }) {
  
  // Convert pressure to the display unit if needed
  const displayPressure = unit === 'inHg' ? pressure * 0.02953 : pressure;
  
  // Determine pressure level and color
  const getPressureLevel = (pressure: number, unit: 'hPa' | 'inHg'): 'low' | 'normal' | 'high' => {
    if (unit === 'hPa') {
      if (pressure < 1013) return 'low'
      if (pressure > 1020) return 'high'
      return 'normal'
    } else {
      // inHg thresholds
      if (pressure < 29.92) return 'low'
      if (pressure > 30.20) return 'high'
      return 'normal'
    }
  }

  const pressureLevel = getPressureLevel(displayPressure, unit)
  
  // Calculate gauge position (0-100%)
  const minPressure = unit === 'hPa' ? 980 : 28.9
  const maxPressure = unit === 'hPa' ? 1050 : 31.0
  const normalizedPressure = Math.max(0, Math.min(100, 
    ((displayPressure - minPressure) / (maxPressure - minPressure)) * 100
  ))

  const getGaugeColors = () => {
    switch (theme) {
      case 'dark':
        switch (pressureLevel) {
          case 'low': return { fill: '#ff6b6b', bg: '#4a1520', border: '#ff1439' }
          case 'high': return { fill: '#51cf66', bg: '#1a4a25', border: '#2dd14c' }
          default: return { fill: '#74c0fc', bg: '#1a2a4a', border: '#339af0' }
        }
      case 'miami':
        switch (pressureLevel) {
          case 'low': return { fill: '#ff1493', bg: '#4a0e2e', border: '#ff1493' }
          case 'high': return { fill: '#00ff7f', bg: '#0e4a2e', border: '#00ff7f' }
          default: return { fill: '#00ffff', bg: '#0e2a4a', border: '#00ffff' }
        }
      case 'tron':
        switch (pressureLevel) {
          case 'low': return { fill: '#FF1744', bg: '#330011', border: '#FF1744' }
          case 'high': return { fill: '#00FFFF', bg: '#003333', border: '#00FFFF' }
          default: return { fill: '#00FFFF', bg: '#001111', border: '#00FFFF' }
        }
    }
  }

  const colors = getGaugeColors()

  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="text-xs font-mono" style={{ color: colors.fill }}>
        Pressure
      </div>
      <div 
        className="w-12 h-2 border rounded-full relative overflow-hidden"
        style={{ 
          backgroundColor: colors.bg,
          borderColor: colors.border
        }}
      >
        <div 
          className="h-full transition-all duration-500 rounded-full"
          style={{ 
            width: `${normalizedPressure}%`,
            backgroundColor: colors.fill
          }}
        />
      </div>
      <div className="text-xs font-mono font-bold" style={{ color: colors.fill }}>
        {displayPressure.toFixed(unit === 'hPa' ? 0 : 2)} {unit}
      </div>
    </div>
  )
}