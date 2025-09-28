/**
 * 16-Bit Weather Platform - BETA v0.3.2
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

import { WeatherData } from './types'
import { safeStorage } from './safe-storage'

// Cache configuration
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
const STALE_DURATION = 30 * 60 * 1000 // 30 minutes
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Cache keys
export const CACHE_KEYS = {
  WEATHER: 'bitweather_weather_data',
  LOCATION: 'bitweather_city',
  TIMESTAMP: 'bitweather_cache_timestamp',
  RATE_LIMIT: 'weather-app-rate-limit'
} as const

// Cache interface
interface CacheEntry<T> {
  data: T
  timestamp: number
  isStale: boolean
}

// Cache store
const cache = new Map<string, CacheEntry<unknown>>()

// Request deduplication
const pendingRequests = new Map<string, Promise<unknown>>()

/**
 * Get cached data with stale-while-revalidate pattern
 */
export const getCachedData = <T>(key: string): CacheEntry<T> | null => {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null

  const now = Date.now()
  const age = now - entry.timestamp

  // Return fresh data
  if (age < CACHE_DURATION) {
    return entry
  }

  // Return stale data
  if (age < STALE_DURATION) {
    return { ...entry, isStale: true }
  }

  // Cache expired
  cache.delete(key)
  return null
}

/**
 * Set data in cache
 */
export const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    isStale: false
  })
}

/**
 * Deduplicate requests
 */
export const deduplicateRequest = <T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> => {
  const pending = pendingRequests.get(key) as Promise<T> | undefined
  if (pending) return pending

  const promise = (requestFn().finally(() => {
    pendingRequests.delete(key)
  })) as Promise<T>

  pendingRequests.set(key, promise)
  return promise
}

/**
 * Retry failed requests with exponential backoff
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) throw error

    await new Promise(resolve => setTimeout(resolve, delay))
    return withRetry(fn, retries - 1, delay * 2)
  }
}

/**
 * Cache weather data with stale-while-revalidate
 */
export const cacheWeatherData = (location: string, data: WeatherData): void => {
  setCachedData(CACHE_KEYS.WEATHER, data)
  setCachedData(CACHE_KEYS.LOCATION, location)
  safeStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString())
}

/**
 * Get cached weather data
 */
export const getCachedWeatherData = (): {
  data: WeatherData | null
  location: string | null
  isStale: boolean
} => {
  const weatherEntry = getCachedData<WeatherData>(CACHE_KEYS.WEATHER)
  const locationEntry = getCachedData<string>(CACHE_KEYS.LOCATION)

  if (!weatherEntry || !locationEntry) {
    return { data: null, location: null, isStale: false }
  }

  return {
    data: weatherEntry.data,
    location: locationEntry.data,
    isStale: weatherEntry.isStale || locationEntry.isStale
  }
}

/**
 * Optimize historical data fetching
 */
// Type for historical weather data response
export interface HistoricalWeatherResponse {
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    time?: string[];
  };
  [key: string]: unknown;
}

export const fetchHistoricalData = async (
  latitude: number,
  longitude: number,
  years: number = 30
): Promise<HistoricalWeatherResponse> => {
  const cacheKey = `historical_${latitude}_${longitude}`
  const cached = getCachedData<HistoricalWeatherResponse>(cacheKey)
  
  if (cached && !cached.isStale) {
    return cached.data
  }

  const today = new Date()
  const currentYear = today.getFullYear()
  const startYear = currentYear - years
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  const data = await withRetry(async () => {
    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startYear}-${month}-${day}&end_date=${currentYear}-${month}-${day}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch historical data')
    }

    return response.json() as Promise<HistoricalWeatherResponse>
  })

  setCachedData<HistoricalWeatherResponse>(cacheKey, data)
  return data
} 
