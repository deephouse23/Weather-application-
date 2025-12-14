import { useState, useEffect, useCallback } from 'react'
import { WeatherData } from '@/lib/types'
import { fetchWeatherData, fetchWeatherByLocation } from '@/lib/weather-api'
import { locationService, LocationData } from '@/lib/location-service'
import { userCacheService } from '@/lib/user-cache-service'
import { toastService } from '@/lib/toast-service'
import { useLocationContext } from '@/components/location-context'
import { useAuth } from '@/lib/auth'
import { safeStorage } from '@/lib/safe-storage'

// Constants
const CACHE_KEY = 'bitweather_city'
const WEATHER_KEY = 'bitweather_weather_data'
const CACHE_TIMESTAMP_KEY = 'bitweather_cache_timestamp'
const RATE_LIMIT_KEY = 'weather-app-rate-limit'
const SEARCH_CACHE_KEY = 'weather-search-cache'
const MAX_REQUESTS_PER_HOUR = 10
const SEARCH_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useWeatherController() {
    const {
        locationInput,
        currentLocation,
        setLocationInput,
        setCurrentLocation,
        setShouldClearOnRouteChange
    } = useLocationContext()

    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>("")
    const [hasSearched, setHasSearched] = useState(false)
    const [remainingSearches, setRemainingSearches] = useState(10)
    const [isClient, setIsClient] = useState(false)
    const [searchCache, setSearchCache] = useState<Map<string, { data: WeatherData; timestamp: number }>>(new Map())
    const [autoLocationAttempted, setAutoLocationAttempted] = useState(false)
    const [isAutoDetecting, setIsAutoDetecting] = useState(false)

    const { profile, preferences, loading: authLoading } = useAuth()

    // Initialize client state
    useEffect(() => {
        setIsClient(true)
        setShouldClearOnRouteChange(true)
    }, [setShouldClearOnRouteChange])



    // Rate limiting logic
    const getRateLimitData = useCallback(() => {
        try {
            const data = safeStorage.getItem(RATE_LIMIT_KEY)
            return data ? JSON.parse(data) : { requests: [], lastReset: Date.now() }
        } catch (error) {
            console.warn('Failed to get rate limit data:', error)
            return { requests: [], lastReset: Date.now() }
        }
    }, [])

    const saveRateLimitData = useCallback((data: { requests: number[], lastReset: number }) => {
        try {
            safeStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data))
        } catch (error) {
            console.warn('Failed to save rate limit data:', error)
        }
    }, [])

    const checkRateLimit = useCallback((): { allowed: boolean, remaining: number, message?: string } => {
        const now = Date.now()
        const oneHour = 60 * 60 * 1000
        let data = getRateLimitData()

        if (now - data.lastReset > oneHour) {
            data = { requests: [], lastReset: now }
            saveRateLimitData(data)
        }

        const recentRequests = data.requests.filter((timestamp: number) => now - timestamp < oneHour)
        const remaining = MAX_REQUESTS_PER_HOUR - recentRequests.length

        if (recentRequests.length >= MAX_REQUESTS_PER_HOUR) {
            const oldestRequest = Math.min(...recentRequests)
            const waitTime = Math.ceil((oneHour - (now - oldestRequest)) / 1000 / 60)
            return {
                allowed: false,
                remaining: 0,
                message: `Too many requests. Please wait ${waitTime} minutes before searching again.`
            }
        }

        return { allowed: true, remaining }
    }, [getRateLimitData, saveRateLimitData])

    // Update remaining searches on mount
    useEffect(() => {
        if (isClient) {
            const { remaining } = checkRateLimit()
            setRemainingSearches(remaining)
        }
    }, [isClient, checkRateLimit])

    const recordRequest = useCallback(() => {
        const now = Date.now()
        const data = getRateLimitData()
        data.requests.push(now)

        const oneHour = 60 * 60 * 1000
        data.requests = data.requests.filter((timestamp: number) => now - timestamp < oneHour)

        saveRateLimitData(data)

        const { remaining } = checkRateLimit()
        setRemainingSearches(remaining)
    }, [getRateLimitData, saveRateLimitData, checkRateLimit])

    // Cache management
    const saveLocationToCache = useCallback((location: string) => {
        try {
            safeStorage.setItem(CACHE_KEY, location)
        } catch (error) {
            console.warn('Failed to save location to cache:', error)
        }
    }, [])

    const saveWeatherToCache = useCallback((weatherData: WeatherData) => {
        try {
            safeStorage.setItem(WEATHER_KEY, JSON.stringify(weatherData))
            safeStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
        } catch (error) {
            console.warn('Failed to save weather data to cache:', error)
        }
    }, [])

    const getSearchCache = useCallback((): Map<string, { data: WeatherData; timestamp: number }> => {
        try {
            const cached = safeStorage.getItem(SEARCH_CACHE_KEY)
            if (cached) {
                const parsed = JSON.parse(cached)
                const map = new Map<string, { data: WeatherData; timestamp: number }>()
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
    }, [])

    const saveSearchCache = useCallback((cache: Map<string, { data: WeatherData; timestamp: number }>) => {
        try {
            const obj = Object.fromEntries(cache)
            safeStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(obj))
        } catch (error) {
            console.warn('Failed to save search cache:', error)
        }
    }, [])

    const addToSearchCache = useCallback((searchTerm: string, weatherData: WeatherData) => {
        const cache = getSearchCache()
        cache.set(searchTerm.toLowerCase().trim(), {
            data: weatherData,
            timestamp: Date.now()
        })
        saveSearchCache(cache)
        setSearchCache(cache)
    }, [getSearchCache, saveSearchCache])

    const getFromSearchCache = useCallback((searchTerm: string): WeatherData | null => {
        const cache = getSearchCache()
        const cached = cache.get(searchTerm.toLowerCase().trim())
        if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_DURATION) {
            return cached.data
        }
        return null
    }, [getSearchCache])

    // Weather handling
    const handleLocationDetected = useCallback(async (location: LocationData) => {
        try {
            userCacheService.saveLastLocation(location)
            const locationKey = userCacheService.getLocationKey(location)
            const cachedWeather = userCacheService.getCachedWeatherData(locationKey)

            if (cachedWeather?.forecast && cachedWeather.forecast.length > 0) {
                setWeather(cachedWeather)
                setLocationInput(location.displayName)
                setCurrentLocation(location.displayName)
                setHasSearched(true)
                setError('')
                return
            }

            setLoading(true)
            setError('')

            const coords = userCacheService.getLocationKey(location).replace('_', ',')
            const unitSystem: 'metric' | 'imperial' = preferences?.temperature_unit === 'celsius' ? 'metric' : 'imperial'
            const weatherData = await fetchWeatherByLocation(coords, unitSystem, location.displayName)

            if (weatherData) {
                setWeather(weatherData)
                setLocationInput(location.displayName)
                setCurrentLocation(location.displayName)
                setHasSearched(true)
                userCacheService.cacheWeatherData(locationKey, weatherData)
                saveLocationToCache(location.displayName)
                saveWeatherToCache(weatherData)
            }
        } catch (error: unknown) {
            console.error('Failed to load weather for detected location:', error)
            setError('Failed to load weather data for your location')
        } finally {
            setLoading(false)
        }
    }, [preferences?.temperature_unit, setLocationInput, setCurrentLocation, saveLocationToCache, saveWeatherToCache])

    const handleSearch = useCallback(async (input: string, fromCache = false, bypassRateLimit = false) => {
        if (!input.trim()) {
            const msg = "Please enter a location"
            setError(msg)
            toastService.error(msg)
            return
        }

        if (input.trim().length < 3) {
            const msg = "Please enter at least 3 characters"
            setError(msg)
            toastService.error(msg)
            return
        }

        if (!bypassRateLimit) {
            const { allowed, message } = checkRateLimit()
            if (!allowed) {
                const msg = message || "Rate limit exceeded"
                setError(msg)
                toastService.warning(msg)
                return
            }
        }

        setLoading(true)
        setError("")

        try {
            const cachedWeather = getFromSearchCache(input)
            if (cachedWeather?.forecast && cachedWeather.forecast.length > 0) {
                setWeather(cachedWeather)
                setHasSearched(true)
                setCurrentLocation(input)
                return
            }

            const unitSystem: 'metric' | 'imperial' = preferences?.temperature_unit === 'celsius' ? 'metric' : 'imperial'
            const weatherData = await fetchWeatherData(input, unitSystem)

            if (!weatherData) throw new Error('City not found')
            if (!weatherData.forecast?.length) throw new Error('Incomplete weather data')

            setWeather(weatherData)
            setHasSearched(true)
            setCurrentLocation(input)
            saveLocationToCache(input)
            saveWeatherToCache(weatherData)
            recordRequest()
            addToSearchCache(input, weatherData)

        } catch (error: any) {
            console.error('Search error:', error)
            const msg = error.message || 'Failed to load weather data'
            setError(msg)
            setWeather(null)
            toastService.error(msg)
        } finally {
            setLoading(false)
        }
    }, [checkRateLimit, getFromSearchCache, preferences?.temperature_unit, setCurrentLocation, saveLocationToCache, saveWeatherToCache, recordRequest, addToSearchCache])

    const handleLocationSearch = useCallback(async () => {
        if (!locationService.isGeolocationSupported()) {
            setError("Geolocation is not supported by your browser")
            return
        }

        if (isClient) {
            localStorage.removeItem(CACHE_KEY)
            localStorage.removeItem(WEATHER_KEY)
            localStorage.removeItem(CACHE_TIMESTAMP_KEY)
        }

        setLoading(true)
        setError("")

        try {
            const location = await locationService.getCurrentLocation()
            await handleLocationDetected(location)
            recordRequest()
        } catch (error: any) {
            console.error("Location error:", error)
            setError(error.message || "Failed to get your location")
        } finally {
            setLoading(false)
        }
    }, [isClient, handleLocationDetected, recordRequest])

    // Auto-location effect
    useEffect(() => {
        if (!isClient || autoLocationAttempted || authLoading) return

        // Playwright E2E runs should be deterministic: skip auto-location entirely and
        // allow the seeded localStorage cache (or explicit searches) to drive state.
        if (process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE === 'true') {
            setAutoLocationAttempted(true)
            return
        }

        const tryAutoLocation = async () => {
            try {
                // Check auth preferences first, then fallback to local storage
                const localPrefs = userCacheService.getPreferences()
                const localAutoLocate =
                    (localPrefs as any)?.settings?.auto_location ??
                    (localPrefs as any)?.settings?.autoLocation ??
                    (localPrefs as any)?.auto_location ??
                    (localPrefs as any)?.autoLocation

                const shouldAutoLocate = preferences?.auto_location ?? localAutoLocate ?? true
                console.log('[Debug] tryAutoLocation running. shouldAutoLocate:', shouldAutoLocate, 'preferences:', preferences, 'localPrefs:', localPrefs);

                if (shouldAutoLocate === false) {
                    if (profile?.default_location) {
                        await handleSearch(profile.default_location)
                    }
                    setAutoLocationAttempted(true)
                    return
                }

                if (profile?.default_location) {
                    await handleSearch(profile.default_location, false, true)
                    setAutoLocationAttempted(true)
                    return
                }

                const lastLocation = userCacheService.getLastLocation()
                if (lastLocation?.displayName) {
                    // Stored last location excludes coordinates for privacy;
                    // fall back to normal search by display name.
                    await handleSearch(lastLocation.displayName, false, true)
                    setAutoLocationAttempted(true)
                    return
                }

                setIsAutoDetecting(true)
                try {
                    const locationPromise = locationService.getCurrentLocation()
                    const timeoutPromise = new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('Location detection timeout')), 5000)
                    )
                    const location = await Promise.race([locationPromise, timeoutPromise]) as LocationData
                    await handleLocationDetected(location)
                } catch (error) {
                    try {
                        const ipLocation = await locationService.getLocationByIP()
                        await handleLocationDetected(ipLocation)
                    } catch (ipError) {
                        // Silent fail
                    }
                } finally {
                    setIsAutoDetecting(false)
                }
                setAutoLocationAttempted(true)
            } catch (error) {
                setIsAutoDetecting(false)
                setAutoLocationAttempted(true)
            }
        }

        const timer = setTimeout(tryAutoLocation, 1000)
        return () => clearTimeout(timer)
    }, [isClient, autoLocationAttempted, authLoading, profile, preferences, handleSearch, handleLocationDetected])

    // Initial cache load
    useEffect(() => {
        if (!isClient || isAutoDetecting || !autoLocationAttempted) return

        const checkCacheAndLoad = async () => {
            try {
                const cachedLocationData = localStorage.getItem(CACHE_KEY)
                const cachedWeatherData = localStorage.getItem(WEATHER_KEY)
                const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
                console.log('[Debug] checkCacheAndLoad running. cachedLocationData:', cachedLocationData, 'cachedWeatherData:', !!cachedWeatherData, 'cacheTimestamp:', cacheTimestamp);

                if (cachedLocationData && cachedWeatherData && cacheTimestamp) {
                    const cacheAge = Date.now() - parseInt(cacheTimestamp)
                    if (cacheAge < 10 * 60 * 1000) {
                        const weather = JSON.parse(cachedWeatherData)
                        if (weather?.forecast && weather.forecast.length > 0) {
                            setWeather(weather)
                            setLocationInput(cachedLocationData)
                            setHasSearched(true)
                            return
                        }
                    }
                }
            } catch (error) {
                console.warn('Cache check failed:', error)
            }
        }

        checkCacheAndLoad()
    }, [isClient, isAutoDetecting, autoLocationAttempted, setLocationInput])

    return {
        weather,
        loading,
        error,
        hasSearched,
        remainingSearches,
        handleSearch,
        handleLocationSearch,
        isAutoDetecting
    }
}
