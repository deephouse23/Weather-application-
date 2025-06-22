"use client"

import React, { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchWeatherData, fetchWeatherByLocation } from "@/lib/weather-api"
import { useTheme } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { Search } from 'lucide-react'
import { WeatherData } from '@/lib/types'
import Forecast from "@/components/forecast"
import PageWrapper from "@/components/page-wrapper"
import { Analytics } from "@vercel/analytics/react"
import Link from "next/link"
import { Cloud, Zap, Flame } from "lucide-react"
import WeatherSearch from "@/components/weather-search"
import { APP_CONSTANTS } from "@/lib/utils"

// TEMPORARY DEBUG IMPORTS - REMOVE BEFORE PRODUCTION
import { fetchWeatherDataDebug, fetchWeatherByLocationDebug } from '@/lib/weather-api-debug'
import ApiTest from '@/components/api-test'

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

// Get API key from environment variables for production deployment
// Try both NEXT_PUBLIC_ (Next.js) and REACT_APP_ (Create React App) prefixes for compatibility
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.REACT_APP_OPENWEATHER_API_KEY;

// Debug environment variables
console.log('🔍 MAIN PAGE ENVIRONMENT DEBUG:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_OPENWEATHER_API_KEY:', process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ? 'SET' : 'MISSING');
console.log('REACT_APP_OPENWEATHER_API_KEY:', process.env.REACT_APP_OPENWEATHER_API_KEY ? 'SET' : 'MISSING');
console.log('Final API_KEY:', API_KEY ? 'SET' : 'MISSING');

// Validate API key
if (!API_KEY) {
  console.error('❌ OpenWeather API key is missing!');
  console.error('Please set either NEXT_PUBLIC_OPENWEATHER_API_KEY or REACT_APP_OPENWEATHER_API_KEY environment variable.');
  console.error('For Next.js, use NEXT_PUBLIC_OPENWEATHER_API_KEY');
} else {
  console.log('✅ OpenWeather API key found:', API_KEY.substring(0, 8) + '...');
}

// Check for Google Pollen API key
const GOOGLE_POLLEN_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY || process.env.REACT_APP_GOOGLE_POLLEN_API_KEY;
if (!GOOGLE_POLLEN_API_KEY) {
  console.warn('⚠️ Google Pollen API key is missing!');
  console.warn('Please set either NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY or REACT_APP_GOOGLE_POLLEN_API_KEY environment variable for accurate pollen data.');
} else {
  console.log('✅ Google Pollen API key found:', GOOGLE_POLLEN_API_KEY.substring(0, 8) + '...');
}

// Theme types
type ThemeType = 'dark' | 'miami' | 'tron';

// Helper function to determine pressure unit (matches weather API logic)
const getPressureUnit = (countryCode: string): 'hPa' | 'inHg' => {
  const inHgCountries = ['US', 'CA', 'PR', 'VI', 'GU', 'AS', 'MP'];
  return inHgCountries.includes(countryCode) ? 'inHg' : 'hPa';
};

// Add AQI helper functions with better contrast
const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return 'text-green-400 font-semibold';
  if (aqi <= 100) return 'text-yellow-400 font-semibold';
  if (aqi <= 150) return 'text-orange-400 font-semibold';
  if (aqi <= 200) return 'text-red-400 font-semibold';
  return 'text-purple-400 font-semibold';
};

const getAQIDescription = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  return 'Very Unhealthy';
};

const getAQIRecommendation = (aqi: number): string => {
  if (aqi <= 50) return 'Air quality is satisfactory. Enjoy outdoor activities.';
  if (aqi <= 100) return 'Air quality is acceptable. Consider limiting prolonged outdoor exertion.';
  if (aqi <= 150) return 'Sensitive groups should reduce outdoor activities.';
  if (aqi <= 200) return 'Everyone should reduce outdoor activities.';
  return 'Avoid outdoor activities. Stay indoors if possible.';
};

function WeatherApp() {
  const { theme } = useTheme()
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
  const [isClient, setIsClient] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('dark')
  const [searchCache, setSearchCache] = useState<Map<string, { data: WeatherData; timestamp: number }>>(new Map())

  // localStorage keys
  const CACHE_KEY = 'bitweather_city'
  const WEATHER_KEY = 'bitweather_weather_data'
  const CACHE_TIMESTAMP_KEY = 'bitweather_cache_timestamp'
  const RATE_LIMIT_KEY = 'weather-app-rate-limit'
  const SEARCH_CACHE_KEY = 'weather-search-cache'
  const MAX_REQUESTS_PER_HOUR = 10
  const COOLDOWN_SECONDS = 2
  const SEARCH_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

  // Rate limiting for API calls (5 per minute max)
  const RATE_LIMIT_WINDOW = 60000 // 1 minute
  const MAX_REQUESTS = 5

  // Client-side mount effect
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize search cache on mount
  useEffect(() => {
    if (isClient) {
      setSearchCache(getSearchCache())
    }
  }, [isClient])

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

  // Search cache management functions
  const getSearchCache = (): Map<string, { data: WeatherData; timestamp: number }> => {
    if (!isClient) return new Map()
    try {
      const cached = localStorage.getItem(SEARCH_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        const map = new Map<string, { data: WeatherData; timestamp: number }>()
        // Clean up expired entries
        const now = Date.now()
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === 'object' && value !== null && 'data' in value && 'timestamp' in value) {
            const cacheEntry = value as { data: WeatherData; timestamp: number }
            if (now - cacheEntry.timestamp < SEARCH_CACHE_DURATION) {
              map.set(key, cacheEntry)
            }
          }
        }
        return map
      }
    } catch (error) {
      console.warn('Failed to get search cache:', error)
    }
    return new Map()
  }

  const saveSearchCache = (cache: Map<string, { data: WeatherData; timestamp: number }>) => {
    if (!isClient) return
    try {
      const obj = Object.fromEntries(cache)
      localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(obj))
    } catch (error) {
      console.warn('Failed to save search cache:', error)
    }
  }

  const addToSearchCache = (searchTerm: string, weatherData: WeatherData) => {
    const cache = getSearchCache()
    cache.set(searchTerm.toLowerCase().trim(), {
      data: weatherData,
      timestamp: Date.now()
    })
    saveSearchCache(cache)
    setSearchCache(cache)
  }

  const getFromSearchCache = (searchTerm: string): WeatherData | null => {
    const cache = getSearchCache()
    const cached = cache.get(searchTerm.toLowerCase().trim())
    if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  const handleSearchWrapper = (locationInput: string) => {
    handleSearch(locationInput)
  }

  // Helper function to safely access weather data
  const getWeatherData = <T,>(path: string, defaultValue: T): T => {
    try {
      const value = path.split('.').reduce((obj, key) => obj?.[key], weather as any);
      return value ?? defaultValue;
    } catch (error) {
      console.error('Error accessing weather data:', error);
      return defaultValue;
    }
  };

  // Enhanced error handling for weather data
  const handleWeatherError = (error: any) => {
    console.error('Weather data error:', error);
    setError(error.message || 'Failed to load weather data');
    setWeather(null);
  };

  // Enhanced search handler with error handling
  const handleSearch = async (locationInput: string, fromCache: boolean = false, bypassRateLimit: boolean = false) => {
    console.log('Starting search for:', locationInput);
    
    if (!locationInput.trim()) {
      setError("Please enter a location");
      return;
    }

    // Minimum search length check
    if (locationInput.trim().length < 3) {
      setError("Please enter at least 3 characters");
      return;
    }

    if (!bypassRateLimit) {
      const rateLimitCheck = checkRateLimit();
      if (!rateLimitCheck.allowed) {
        setRateLimitError(rateLimitCheck.message || "Rate limit exceeded");
        return;
      }
    }

    setLoading(true);
    setError("");
    setRateLimitError("");

    try {
      console.log('Fetching weather data...');
      const cachedWeather = getFromSearchCache(locationInput);
      if (cachedWeather) {
        console.log('Weather data found in cache');
        setWeather(cachedWeather);
        setHasSearched(true);
        setLastSearchTerm(locationInput);
        setCurrentLocation(locationInput);
        return;
      }

      const weatherData = await fetchWeatherDataDebug(locationInput);
      console.log('Weather data received:', weatherData);

      if (!weatherData) {
        throw new Error('No weather data received');
      }

      // Validate required data
      if (!weatherData.temperature || !weatherData.condition) {
        throw new Error('Invalid weather data received');
      }

      setWeather(weatherData);
      setHasSearched(true);
      setLastSearchTerm(locationInput);
      setCurrentLocation(locationInput);
      
      // Save to cache
      saveLocationToCache(locationInput);
      saveWeatherToCache(weatherData);
      
      // Record API call
      recordRequest();
      
      // Add to search cache
      addToSearchCache(locationInput, weatherData);
      
      console.log('Search completed successfully');
    } catch (error) {
      console.error('Search error:', error);
      handleWeatherError(error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced location search with error handling
  const handleLocationSearch = async () => {
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
      console.log("Got coordinates:", { latitude, longitude })

      const weatherData = await fetchWeatherByLocation(`${latitude},${longitude}`)
      console.log("Weather data received:", weatherData)

      if (weatherData) {
        setWeather(weatherData)
        setHasSearched(true)
        setError("")
        saveLocationToCache(`${latitude},${longitude}`)
        saveWeatherToCache(weatherData)
        recordRequest()
      } else {
        setError("Failed to fetch weather data for your location")
      }
    } catch (error) {
      console.error("Location error:", error)
      setError(error instanceof Error ? error.message : "Failed to get your location")
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

  // Helper function to format location display
  const formatLocationDisplay = (location: string, country: string): string => {
    // Handle edge cases for long city names
    const maxLength = 30;
    if (location.length > maxLength) {
      return `${location.substring(0, maxLength - 3)}...`;
    }
    return location;
  };

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
    <PageWrapper>
      <div className={cn(
        "min-h-screen",
        theme === "dark" && "bg-gradient-to-b from-gray-900 to-black",
        theme === "miami" && "bg-gradient-to-b from-pink-900 to-purple-900",
        theme === "tron" && "bg-gradient-to-b from-black to-blue-900"
      )}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-end items-center mb-8">
            <ThemeToggle />
          </div>

          {/* TEMPORARY API TEST - REMOVE BEFORE PRODUCTION */}
          <ApiTest />

          <WeatherSearch
            onSearch={handleSearch}
            onLocationSearch={handleLocationSearch}
            isLoading={loading}
            error={error}
            rateLimitError={rateLimitError}
            isDisabled={isOnCooldown}
            theme={theme}
          />

          {/* Location Display */}
          {weather && !loading && !error && (
            <div className="text-center mt-6 mb-6">
              <div className={cn(
                "inline-block p-4 rounded-lg border-2 shadow-lg",
                theme === "dark" && "bg-gray-800 border-blue-500 shadow-blue-500/20",
                theme === "miami" && "bg-pink-900/50 border-pink-500 shadow-pink-500/30",
                theme === "tron" && "bg-black/50 border-cyan-500 shadow-cyan-500/40"
              )}>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">📍</span>
                  <p className={cn(
                    "text-xl font-bold uppercase tracking-wider pixel-font",
                    theme === "dark" && "text-blue-400",
                    theme === "miami" && "text-pink-400",
                    theme === "tron" && "text-cyan-400"
                  )} style={{ fontFamily: "monospace" }}>
                    {formatLocationDisplay(weather.location, weather.country)}, {weather.country}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 16-Bit Welcome Message */}
          {!weather && !loading && !error && (
            <div className="text-center mt-8 mb-8">
              <div className={cn(
                "inline-block p-6 rounded-lg border-2 shadow-lg",
                theme === "dark" && "bg-gray-800 border-blue-500 shadow-blue-500/20",
                theme === "miami" && "bg-pink-900/50 border-pink-500 shadow-pink-500/30",
                theme === "tron" && "bg-black/50 border-cyan-500 shadow-cyan-500/40"
              )}>
                <p className={cn(
                  "text-2xl font-bold uppercase tracking-wider pixel-font",
                  theme === "dark" && "text-blue-400",
                  theme === "miami" && "text-pink-400",
                  theme === "tron" && "text-cyan-400"
                )} style={{ fontFamily: "monospace" }}>
                  🌤️ Select a location to begin your forecast adventure!
                </p>
              </div>
            </div>
          )}

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

          {error && (
            <div className="text-red-500 text-center mt-4">
              {error}
            </div>
          )}

          {rateLimitError && (
            <div className="text-yellow-500 text-center mt-4">
              {rateLimitError}
            </div>
          )}

          {weather && !loading && !error && (
            <div className="space-y-4 sm:space-y-6">
              {/* Current Weather */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Temperature Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-gray-800 border-blue-500 shadow-blue-500/20",
                  theme === "miami" && "bg-pink-900/50 border-pink-500 shadow-pink-500/30",
                  theme === "tron" && "bg-black/50 border-cyan-500 shadow-cyan-500/40"
                )}>
                  <h2 className="text-xl font-semibold mb-2 text-white">Temperature</h2>
                  <p className="text-3xl font-bold text-white">{weather.temperature}{weather.unit}</p>
                </div>

                {/* Conditions Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-gray-800 border-blue-500 shadow-blue-500/20",
                  theme === "miami" && "bg-pink-900/50 border-pink-500 shadow-pink-500/30",
                  theme === "tron" && "bg-black/50 border-cyan-500 shadow-cyan-500/40"
                )}>
                  <h2 className="text-xl font-semibold mb-2 text-white">Conditions</h2>
                  <p className="text-lg text-white">{weather.condition}</p>
                  <p className="text-sm text-gray-400">{weather.description}</p>
                </div>

                {/* Wind Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-gray-800 border-blue-500 shadow-blue-500/20",
                  theme === "miami" && "bg-pink-900/50 border-pink-500 shadow-pink-500/30",
                  theme === "tron" && "bg-black/50 border-cyan-500 shadow-cyan-500/40"
                )}>
                  <h2 className="text-xl font-semibold mb-2 text-white">Wind</h2>
                  <p className="text-lg text-white">
                    {weather.wind.direction ? `${weather.wind.direction} ` : ''}
                    {weather.wind.speed} mph
                    {weather.wind.gust ? ` (gusts ${weather.wind.gust} mph)` : ''}
                  </p>
                </div>
              </div>

              {/* Sun Times, UV Index, Moon Phase */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Sun Times Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-gray-800 border-blue-500 shadow-blue-500/20",
                  theme === "miami" && "bg-pink-900/50 border-pink-500 shadow-pink-500/30",
                  theme === "tron" && "bg-black/50 border-cyan-500 shadow-cyan-500/40"
                )}>
                  <h2 className="text-xl font-semibold mb-2 text-white">Sun Times</h2>
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
                  theme === "dark" && "bg-gray-800 border-blue-500 shadow-blue-500/20",
                  theme === "miami" && "bg-pink-900/50 border-pink-500 shadow-pink-500/30",
                  theme === "tron" && "bg-black/50 border-cyan-500 shadow-cyan-500/40"
                )}>
                  <h2 className="text-xl font-semibold mb-2 text-white">UV Index</h2>
                  <p className="text-lg text-white font-bold">{weather.uvIndex}</p>
                </div>

                {/* Moon Phase Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-gray-800 border-blue-500 shadow-blue-500/20",
                  theme === "miami" && "bg-pink-900/50 border-pink-500 shadow-pink-500/30",
                  theme === "tron" && "bg-black/50 border-cyan-500 shadow-cyan-500/40"
                )}>
                  <h2 className="text-xl font-semibold mb-2 text-white">Moon Phase</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">{getMoonPhaseIcon(weather.moonPhase.phase)}</span>
                      <p className="text-lg text-white font-semibold">{weather.moonPhase.phase}</p>
                    </div>
                    <p className="text-sm text-gray-300 font-medium">
                      {weather.moonPhase.illumination}% illuminated
                    </p>
                  </div>
                </div>
              </div>

              {/* AQI and Pollen Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* AQI Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-gray-800 border-blue-500 shadow-blue-500/20",
                  theme === "miami" && "bg-pink-900/50 border-pink-500 shadow-pink-500/30",
                  theme === "tron" && "bg-black/50 border-cyan-500 shadow-cyan-500/40"
                )}>
                  <h2 className="text-xl font-semibold mb-2 text-white">Air Quality</h2>
                  <p className={`text-lg ${getAQIColor(weather.aqi)}`}>
                    {weather.aqi} - {getAQIDescription(weather.aqi)}
                  </p>
                  <p className="text-sm text-gray-300 font-medium">
                    {getAQIRecommendation(weather.aqi)}
                  </p>
                </div>

                {/* Pollen Count Box */}
                <div className={cn(
                  "p-4 rounded-lg text-center border-2 shadow-lg",
                  theme === "dark" && "bg-gray-800 border-blue-500 shadow-blue-500/20",
                  theme === "miami" && "bg-pink-900/50 border-pink-500 shadow-pink-500/30",
                  theme === "tron" && "bg-black/50 border-cyan-500 shadow-cyan-500/40"
                )}>
                  <h2 className="text-xl font-semibold mb-2 text-white">Pollen Count</h2>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-sm text-gray-300 font-medium">Tree</p>
                      <p className="text-lg text-white font-bold">{weather.pollen.tree}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 font-medium">Grass</p>
                      <p className="text-lg text-white font-bold">{weather.pollen.grass}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 font-medium">Weed</p>
                      <p className="text-lg text-white font-bold">{weather.pollen.weed}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Forecast */}
              <Forecast forecast={weather.forecast} theme={theme} />
            </div>
          )}
        </div>
      </div>
      <Analytics />
    </PageWrapper>
  );
}

export default function HomePage() {
  return (
    <WeatherApp />
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