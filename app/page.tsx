"use client"

/**
 * 16-Bit Weather Platform - BETA v0.3.31
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */


import React, { useState, useEffect, Suspense } from "react"
import dynamic from 'next/dynamic'
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchWeatherData, fetchWeatherByLocation } from "@/lib/weather-api"
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { WeatherData } from '@/lib/types'
import PageWrapper from "@/components/page-wrapper"
import { Analytics } from "@vercel/analytics/react"
import WeatherSearch from "@/components/weather-search"
import RandomCityLinks from "@/components/random-city-links"
import { locationService, LocationData } from "@/lib/location-service"
import { userCacheService } from "@/lib/user-cache-service"
import { toastService } from "@/lib/toast-service"
import { APP_CONSTANTS } from "@/lib/utils"
import { LazyEnvironmentalDisplay, LazyForecast, LazyForecastDetails } from "@/components/lazy-weather-components"
import { ResponsiveContainer, ResponsiveGrid } from "@/components/responsive-container"
import { ErrorBoundary, SafeRender } from "@/components/error-boundary"
import { useLocationContext } from "@/components/location-context"
import { useAuth } from "@/lib/auth"
import LazyWeatherMap from '@/components/lazy-weather-map'


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

// API keys are now handled by internal API routes

// Using ThemeType from theme-utils

// Helper function to determine pressure unit (matches weather API logic)
const getPressureUnit = (countryCode: string): 'hPa' | 'inHg' => {
  const inHgCountries = ['US', 'CA', 'PR', 'VI', 'GU', 'AS', 'MP'];
  return inHgCountries.includes(countryCode) ? 'inHg' : 'hPa';
};


function WeatherApp() {
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'weather')
  const { 
    locationInput, 
    currentLocation, 
    setLocationInput, 
    setCurrentLocation,
    clearLocationState,
    setShouldClearOnRouteChange
  } = useLocationContext()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [hasSearched, setHasSearched] = useState(false)
  const [lastSearchTerm, setLastSearchTerm] = useState<string>("")
  const [isOnCooldown, setIsOnCooldown] = useState(false)
  const [remainingSearches, setRemainingSearches] = useState(10)
  const [rateLimitError, setRateLimitError] = useState<string>("")
  const [isClient, setIsClient] = useState(false)
  // Theme is managed by ThemeProvider
  const [searchCache, setSearchCache] = useState<Map<string, { data: WeatherData; timestamp: number }>>(new Map())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [isAutoDetecting, setIsAutoDetecting] = useState(false)
  const [autoLocationAttempted, setAutoLocationAttempted] = useState(false)
  // Auth context (profile + preferences from user portal)
  const { profile, preferences, loading: authLoading } = useAuth()

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
    // Enable route change clearing on the main page
    setShouldClearOnRouteChange(true)
  }, [setShouldClearOnRouteChange])

  // Handle successful location detection
  const handleLocationDetected = async (location: LocationData) => {
    try {
      console.log('Location detected:', location)
      
      // Save as last location
      userCacheService.saveLastLocation(location)
      
      // Check for cached weather data for this location
      const locationKey = userCacheService.getLocationKey(location)
      const cachedWeather = userCacheService.getCachedWeatherData(locationKey)
      
      if (cachedWeather && cachedWeather.forecast && cachedWeather.forecast.length > 0) {
        console.log('Using cached weather data for detected location')
        setWeather(cachedWeather)
        setLocationInput(location.displayName)
        setCurrentLocation(location.displayName)
        setHasSearched(true)
        setError('')
        return
      } else if (cachedWeather) {
        console.log('Cached weather data missing forecast, will fetch fresh data')
      }
      
      // Fetch fresh weather data
      setLoading(true)
      setError('')
      
      const coords = userCacheService.getLocationKey(location).replace('_', ',')
      const unitSystem: 'metric' | 'imperial' = preferences?.temperature_unit === 'celsius' ? 'metric' : 'imperial'
      const weatherData = await fetchWeatherByLocation(coords, unitSystem)
      
      if (weatherData) {
        console.log('Weather data received:', weatherData)
        console.log('Forecast data:', weatherData.forecast)
        setWeather(weatherData)
        setLocationInput(location.displayName)
        setCurrentLocation(location.displayName)
        setHasSearched(true)
        
        // Cache the weather data
        userCacheService.cacheWeatherData(locationKey, weatherData)
        
        // Also save in legacy cache for compatibility
        saveLocationToCache(location.displayName)
        saveWeatherToCache(weatherData)
        
        console.log('Weather data loaded for auto-detected location')
      }
    } catch (error: unknown) {
      console.error('Failed to load weather for detected location:', error)
      setError('Failed to load weather data for your location')
    } finally {
      setLoading(false)
    }
  }

  // Silent auto-location detection on first visit
  useEffect(() => {
    // Wait for auth/preferences to finish loading so we can honor
    // user portal settings (e.g., auto_location=false) on first load
    console.log('Auto-location check:', { isClient, autoLocationAttempted, authLoading })
    if (!isClient || autoLocationAttempted || authLoading) return

    const tryAutoLocation = async () => {
      try {
        // Respect user portal preference: disable auto-location if set to false
        if (preferences && preferences.auto_location === false) {
          console.log('Auto-location disabled by user preferences')
          // If user has a default location set in profile, use it once
          if (profile?.default_location) {
            await handleSearch(profile.default_location)
          }
          setAutoLocationAttempted(true)
          return
        }

        // If user saved a default location in the portal, prefer that over lastLocation/cache
        if (profile?.default_location) {
          console.log('Using profile default location:', profile.default_location)
          await handleSearch(profile.default_location, false, true)
          setAutoLocationAttempted(true)
          return
        }

        // Check if we have a recent last location
        const lastLocation = userCacheService.getLastLocation()
        if (lastLocation) {
          console.log('Using cached last location:', lastLocation)
          await handleLocationDetected(lastLocation)
          setAutoLocationAttempted(true)
          return
        }

        // Check if we have cached weather data first
        const cachedLocation = localStorage.getItem(CACHE_KEY)
        const cachedWeatherData = localStorage.getItem(WEATHER_KEY)
        const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)

        if (cachedLocation && cachedWeatherData && cacheTimestamp) {
          const cacheAge = Date.now() - parseInt(cacheTimestamp)

          // If cache is fresh, use it and skip auto-detection for now
          if (cacheAge < 10 * 60 * 1000) {
            console.log('Using fresh cached data, skipping auto-location')
            setAutoLocationAttempted(true)
            return
          }
        }

        // Try silent location detection
        console.log('Attempting silent location detection...')
        setIsAutoDetecting(true)

        try {
          const location = await locationService.getCurrentLocation()
          await handleLocationDetected(location)
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : String(error)
          console.log('Geolocation failed, trying IP fallback:', msg)
          try {
            const ipLocation = await locationService.getLocationByIP()
            await handleLocationDetected(ipLocation)
          } catch (ipError) {
            console.log('IP location also failed, using default location:', ipError)
            // Use default location (San Francisco)
            await handleSearch('San Francisco, CA')
          }
        } finally {
          setIsAutoDetecting(false)
        }

        setAutoLocationAttempted(true)
      } catch (error) {
        console.error('Auto-location initialization failed:', error)
        setIsAutoDetecting(false)
        setAutoLocationAttempted(true)
      }
    }

    // Small delay to let other initialization complete
    const timer = setTimeout(tryAutoLocation, 1000)
    return () => clearTimeout(timer)
  }, [isClient, autoLocationAttempted, authLoading, profile?.default_location, preferences?.auto_location])

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
      if (cachedLocation && !locationInput && !currentLocation) {
        setLocationInput(cachedLocation)
        setCurrentLocation(cachedLocation)
        console.log('Loaded cached location:', cachedLocation)
      }
    } catch (error) {
      console.warn('Failed to load cached location:', error)
    }
  }

  // Theme is managed by ThemeProvider, no local state needed

  // Set data function (for cached weather data)
  const setData = (weatherData: WeatherData) => {
    try {
      if (!weatherData) {
        console.warn('Attempted to set null/undefined weather data');
        return;
      }
      setWeather(weatherData);
      setError("");
    } catch (error) {
      console.error('Error setting weather data:', error);
      setError('Failed to process weather data');
    }
  }

  // Load cached data on component mount
  useEffect(() => {
    if (!isClient) return
    
    loadCachedLocation()
    
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
            
            // Check if cached data has forecast property
            if (weather && weather.forecast && weather.forecast.length > 0) {
              // Note: UV index selective refresh removed since One Call API 2.5 was deprecated
              // UV index is now estimated by the main weather API function
              
              setData(weather)
              setLocationInput(cachedLocationData)
              setHasSearched(true)
              return // Exit early if we have cached data
            } else {
              console.log('Cached weather data missing forecast, clearing cache')
              // Clear invalid cache
              localStorage.removeItem(WEATHER_KEY)
              localStorage.removeItem(CACHE_TIMESTAMP_KEY)
            }
          }
        }
        
        // Auto-location is handled by the separate useEffect hook
      } catch (error) {
        console.warn('Cache check failed:', error)
      }
    }
    
    checkCacheAndLoad()
  }, [isClient, locationInput, currentLocation])

  // Theme is now managed entirely by ThemeProvider, no local management needed

  // Semantic dark theme classes using CSS variables


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
      if (!data || typeof data !== 'object') {
        console.warn('Invalid rate limit data provided');
        return;
      }
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save rate limit data:', error)
      setError('Rate limiting storage failed')
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
    const data = getRateLimitData()
    
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
      if (!weatherData || typeof weatherData !== 'object') {
        console.warn('Invalid weather data provided for caching');
        return;
      }
      localStorage.setItem(WEATHER_KEY, JSON.stringify(weatherData))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (error) {
      console.warn('Failed to save weather data to cache:', error)
      setError('Weather data caching failed')
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
      const value = path
        .split('.')
        .reduce((obj: any, key: string) => (obj ? obj[key] : undefined), weather as any)
      return (value ?? defaultValue) as T
    } catch (error) {
      console.error('Error accessing weather data:', error)
      return defaultValue
    }
  }

  // Enhanced error handling for weather data
  const handleWeatherError = (error: Error | { message?: string }) => {
    console.error('Weather data error:', error);
    const errorMessage = error.message || 'Failed to load weather data';
    setError(errorMessage);
    setWeather(null);
    toastService.error('⚠️ Unable to fetch weather. Please try again.');
  };

  // Enhanced search handler with error handling
  const handleSearch = async (locationInput: string, fromCache: boolean = false, bypassRateLimit: boolean = false) => {
    console.log('Starting search for:', locationInput);
    
    if (!locationInput.trim()) {
      const errorMsg = "Please enter a location";
      setError(errorMsg);
      toastService.error('🔍 Please enter a location to search.');
      return;
    }

    // Minimum search length check
    if (locationInput.trim().length < 3) {
      const errorMsg = "Please enter at least 3 characters";
      setError(errorMsg);
      toastService.error('🔍 Please enter at least 3 characters.');
      return;
    }

    if (!bypassRateLimit) {
      const rateLimitCheck = checkRateLimit();
      if (!rateLimitCheck.allowed) {
        const rateLimitMsg = rateLimitCheck.message || "Rate limit exceeded";
        setRateLimitError(rateLimitMsg);
        toastService.warning('⏱️ Too many requests. Please wait a moment.');
        return;
      }
    }

    setLoading(true);
    setError("");
    setRateLimitError("");

    try {
      const cachedWeather = getFromSearchCache(locationInput);
      if (cachedWeather && cachedWeather.forecast && cachedWeather.forecast.length > 0) {
        console.log('Weather data found in cache');
        setWeather(cachedWeather);
        setHasSearched(true);
        setLastSearchTerm(locationInput);
        setCurrentLocation(locationInput);
        return;
      } else if (cachedWeather) {
        console.log('Cached weather missing forecast, fetching fresh data');
      }

      const unitSystem: 'metric' | 'imperial' = preferences?.temperature_unit === 'celsius' ? 'metric' : 'imperial'
      const weatherData = await fetchWeatherData(locationInput, unitSystem);
      console.log('Weather data received:', weatherData);
      console.log('Forecast in weather data:', weatherData?.forecast);

      if (!weatherData) {
        throw new Error('🔍 City not found. Try another location.');
      }

      // Validate required data
      if (!weatherData.temperature || !weatherData.condition) {
        throw new Error('📡 Connection issue. Check your internet.');
      }

      if (!weatherData.forecast || weatherData.forecast.length === 0) {
        console.error('Weather data missing forecast property');
        throw new Error('Weather data incomplete. Please try again.');
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
    } catch (error: unknown) {
      console.error('Search error:', error);
      handleWeatherError(error as { message?: string })
    } finally {
      setLoading(false);
    }
  };

  // Enhanced location search with new location service
  const handleLocationSearch = async () => {
    if (!locationService.isGeolocationSupported()) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setLoading(true)
    setError("")

    try {
      const location = await locationService.getCurrentLocation()
      await handleLocationDetected(location)
      recordRequest()
    } catch (error: unknown) {
      console.error("Location error:", error)
      const msg = error instanceof Error ? error.message : "Failed to get your location"
      setError(msg)
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
    if ((theme || 'dark') !== 'tron') return null;
    
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
    <PageWrapper
      weatherLocation={weather?.location}
      weatherTemperature={weather?.temperature}
      weatherUnit={weather?.unit}
    >
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-weather-bg">
        <ResponsiveContainer maxWidth="xl" padding="md">

          {/* TEMPORARY API TEST - REMOVE BEFORE PRODUCTION */}
          {/* <ApiTest /> */}

          <ErrorBoundary componentName="Weather Search">
            <WeatherSearch
              onSearch={handleSearch}
              onLocationSearch={handleLocationSearch}
              isLoading={loading || isAutoDetecting}
              error={error}
              rateLimitError={rateLimitError}
              isDisabled={isOnCooldown}
              hideLocationButton={true}
            />
          </ErrorBoundary>



          {/* 16-Bit Welcome Message */}
          {!weather && !loading && !error && (
            <div className="text-center mt-8 mb-8 px-2 sm:px-0">
              <div className="w-full max-w-xl mx-auto">
                <div className="p-2 sm:p-3 border-2 shadow-lg bg-weather-bg-elev border-weather-primary shadow-weather-primary/20">
                  <p className="text-sm font-mono font-bold uppercase tracking-wider text-white" style={{ 
                    fontFamily: "monospace",
                    fontSize: "clamp(10px, 2.4vw, 14px)"
                  }}>
                    ► PRESS START TO INITIALIZE WEATHER DATA ◄
                  </p>
                </div>
              </div>
            </div>
          )}

          {(loading || isAutoDetecting) && (
            <div className="flex justify-center items-center mt-8">
              <Loader2 className="h-8 w-8 animate-spin text-weather-primary" />
              <span className="ml-2 text-weather-text">
                {isAutoDetecting ? 'Detecting your location...' : 'Loading weather data...'}
              </span>
            </div>
          )}

          {error && (
            <div className="max-w-2xl mx-auto mt-4 px-2">
              <div data-testid="global-error">
                {/* shadcn Alert */}
                {/* eslint-disable-next-line react/no-unknown-property */}
                {/* Using inline to avoid import clutter here */}
                <div role="alert" className="relative w-full rounded-lg border border-red-500/50 p-4 text-red-500">
                  <div className="mb-1 font-medium leading-none tracking-tight">Error</div>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            </div>
          )}

          {rateLimitError && (
            <div className="max-w-2xl mx-auto mt-4 px-2">
              <div data-testid="rate-limit-warning">
                <div role="alert" className="relative w-full rounded-lg border border-yellow-500/50 p-4 text-yellow-400">
                  <div className="mb-1 font-medium leading-none tracking-tight">Slow down</div>
                  <div className="text-sm">{rateLimitError}</div>
                </div>
              </div>
            </div>
          )}

          {weather && !loading && !error && (
            <ErrorBoundary componentName="Weather Display">
              <div className="space-y-4 sm:space-y-6">
                {/* Location Title */}
                <div className="text-center mb-4">
                  <h1 className={`text-2xl sm:text-3xl font-bold uppercase tracking-wider ${themeClasses.headerText} ${themeClasses.glow}`} style={{
                    fontFamily: "monospace",
                    fontSize: "clamp(20px, 4vw, 32px)"
                  }}>
                    {weather.location} WEATHER
                  </h1>
                </div>
                
                {/* Current Weather using Cards */}
                <ResponsiveGrid cols={{ sm: 1, md: 3 }} className="gap-4">
                  <div className={`p-0 rounded-lg ${themeClasses.cardBg} ${themeClasses.borderColor} border-2`}>
                    <div className="p-4 text-center">
                      <h2 className={`text-xl font-semibold mb-2 ${themeClasses.headerText}`}>Temperature</h2>
                      <p data-testid="temperature-value" className={`text-3xl font-bold ${themeClasses.text}`}>
                        {weather?.temperature || 'N/A'}{weather?.unit || '°F'}
                      </p>
                    </div>
                  </div>
                  <div className={`p-0 rounded-lg ${themeClasses.cardBg} ${themeClasses.borderColor} border-2`}>
                    <div className="p-4 text-center">
                      <h2 className={`text-xl font-semibold mb-2 ${themeClasses.headerText}`}>Conditions</h2>
                      <p className={`text-lg ${themeClasses.text}`}>{weather?.condition || 'Unknown'}</p>
                      <p className={`text-sm ${themeClasses.secondaryText}`}>{weather?.description || 'No description available'}</p>
                    </div>
                  </div>
                  <div className={`p-0 rounded-lg ${themeClasses.cardBg} ${themeClasses.borderColor} border-2`}>
                    <div className="p-4 text-center">
                      <h2 className={`text-xl font-semibold mb-2 ${themeClasses.headerText}`}>Wind</h2>
                      <p className={`text-lg ${themeClasses.text}`}>
                        {weather?.wind?.direction ? `${weather.wind.direction} ` : ''}
                        {weather?.wind?.speed || 'N/A'} mph
                        {weather?.wind?.gust ? ` (gusts ${weather.wind.gust} mph)` : ''}
                      </p>
                    </div>
                  </div>
                </ResponsiveGrid>

              {/* Sun Times, UV Index, Moon Phase */}
              <ResponsiveGrid cols={{ sm: 1, md: 3 }} className="gap-4">
                {/* Sun Times Box */}
                <div className={`p-4 rounded-lg text-center border-2 shadow-lg ${themeClasses.cardBg} ${themeClasses.borderColor}`}
                     style={{ boxShadow: `0 0 15px ${themeClasses.borderColor.replace('border-[', '').replace(']', '')}33` }}>
                  <h2 className={`text-xl font-semibold mb-2 ${themeClasses.headerText}`}>Sun Times</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-yellow-400">☀️</span>
                      <p className={themeClasses.text}>Sunrise: {weather?.sunrise || 'N/A'}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-orange-400">🌅</span>
                      <p className={themeClasses.text}>Sunset: {weather?.sunset || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* UV Index Box */}
                <div className={`p-4 rounded-lg text-center border-2 shadow-lg ${themeClasses.cardBg} ${themeClasses.borderColor}`}
                     style={{ boxShadow: `0 0 15px ${themeClasses.borderColor.replace('border-[', '').replace(']', '')}33` }}>
                  <h2 className={`text-xl font-semibold mb-2 ${themeClasses.headerText}`}>UV Index</h2>
                  <p className={`text-lg font-bold ${themeClasses.text}`}>{weather?.uvIndex || 'N/A'}</p>
                </div>

                {/* Moon Phase Box */}
                <div className={`p-4 rounded-lg text-center border-2 shadow-lg ${themeClasses.cardBg} ${themeClasses.borderColor}`}
                     style={{ boxShadow: `0 0 15px ${themeClasses.borderColor.replace('border-[', '').replace(']', '')}33` }}>
                  <h2 className={`text-xl font-semibold mb-2 ${themeClasses.headerText}`}>Moon Phase</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">{getMoonPhaseIcon(weather?.moonPhase?.phase || 'new')}</span>
                      <p className={`text-lg font-semibold ${themeClasses.text}`}>{weather?.moonPhase?.phase || 'Unknown'}</p>
                    </div>
                    <p className={`text-sm font-medium ${themeClasses.secondaryText}`}>
                      {weather?.moonPhase?.illumination || 0}% illuminated
                    </p>
                  </div>
                </div>
              </ResponsiveGrid>

              {/* AQI and Pollen Count - Using Lazy Loaded Shared Components */}
              <LazyEnvironmentalDisplay weather={weather} theme={theme || 'dark'} />

              {/* Day click handler */}
              {(() => {
                const handleDayClick = (index: number) => {
                  setSelectedDay(selectedDay === index ? null : index);
                };
                
                return (
                  <>
                    {/* 5-Day Forecast - Moved Above Map */}
                    {weather?.forecast && weather.forecast.length > 0 ? (
                      <LazyForecast 
                        forecast={weather.forecast.map((day, index) => ({
                          ...day,
                          country: weather?.country || 'US'
                        }))} 
                        theme={theme || 'dark'}
                        onDayClick={handleDayClick}
                        selectedDay={selectedDay}
                      />
                    ) : weather ? (
                      <div className="bg-gray-800 p-4 rounded-none border-2 border-blue-500 text-center">
                        <p className="text-white font-mono">
                          No forecast data available
                        </p>
                      </div>
                    ) : null}

                    {/* Expandable Details Section */}
                    <LazyForecastDetails 
                      forecast={(weather?.forecast || []).map((day, index) => ({
                        ...day,
                        country: weather?.country || 'US'
                      }))} 
                      theme={theme || 'dark'}
                      selectedDay={selectedDay}
                      currentWeatherData={{
                        humidity: weather?.humidity || 0,
                        wind: weather?.wind || { speed: 0, direction: '', gust: null },
                        pressure: weather?.pressure || '1013',
                        uvIndex: weather?.uvIndex || 0,
                        sunrise: weather?.sunrise || 'N/A',
                        sunset: weather?.sunset || 'N/A'
                      }}
                    />
                  </>
                );
              })()}

              {/* Weather Radar - Moved Below Forecast */}
              <div className="mt-6">
                <h2 className={`text-xl font-semibold mb-4 text-center ${themeClasses.headerText} ${themeClasses.glow}`}>
                  Weather Radar
                </h2>
                <div className="h-96 rounded-lg overflow-hidden">
                  <LazyWeatherMap 
                    latitude={weather?.coordinates?.lat}
                    longitude={weather?.coordinates?.lon}
                    locationName={weather?.location}
                    theme={theme || 'dark'}
                  />
                </div>
              </div>
              </div>
            </ErrorBoundary>
          )}
          

          {/* SEO City Links Section with Random Display */}
          <RandomCityLinks theme={theme || 'dark'} />
        </ResponsiveContainer>
      </div>
      <Analytics />
    </PageWrapper>
  );
}

// Create a dynamic import for the WeatherApp to avoid SSR issues
const DynamicWeatherApp = dynamic(
  () => Promise.resolve(WeatherApp),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }
)

export default function HomePage() {
  return <DynamicWeatherApp />
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
      default:
        // Default to dark theme colors
        switch (pressureLevel) {
          case 'low': return { fill: '#ff6b6b', bg: '#4a1520', border: '#ff1439' }
          case 'high': return { fill: '#51cf66', bg: '#1a4a25', border: '#2dd14c' }
          default: return { fill: '#74c0fc', bg: '#1a2a4a', border: '#339af0' }
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