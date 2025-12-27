"use client"

/**
 * 16-Bit Weather Platform - v1.0.0
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


import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { userCacheService } from '@/lib/user-cache-service'
import { safeStorage } from '@/lib/safe-storage'

interface LocationContextType {
  locationInput: string
  currentLocation: string
  setLocationInput: (location: string) => void
  setCurrentLocation: (location: string) => void
  clearLocationState: () => void
  shouldClearOnRouteChange: boolean
  setShouldClearOnRouteChange: (should: boolean) => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

interface LocationProviderProps {
  children: ReactNode
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [locationInput, setLocationInput] = useState<string>("")
  const [currentLocation, setCurrentLocation] = useState<string>("")
  const [shouldClearOnRouteChange, setShouldClearOnRouteChange] = useState(true)
  const [lastPathname, setLastPathname] = useState<string>("")
  
  const pathname = usePathname()

  // Debug function to log localStorage keys
  const logLocalStorageKeys = (context: string) => {
    if (typeof window !== 'undefined') {
      const keys = safeStorage.getAllKeys().filter(key => 
        key.includes('bitweather') || key.includes('weather')
      )
      console.log(`[LocationProvider] ${context} - localStorage keys:`, keys)
      keys.forEach(key => {
        const value = safeStorage.getItem(key)
        console.log(`  ${key}: ${value ? value.substring(0, 100) + (value.length > 100 ? '...' : '') : 'null'}`)
      })
    }
  }

  // Enhanced setLocationInput with debugging
  const setLocationInputWithDebug = (location: string) => {
    console.log(`[LocationProvider] setLocationInput: "${locationInput}" -> "${location}"`)
    setLocationInput(location)
  }

  // Enhanced setCurrentLocation with debugging
  const setCurrentLocationWithDebug = (location: string) => {
    console.log(`[LocationProvider] setCurrentLocation: "${currentLocation}" -> "${location}"`)
    setCurrentLocation(location)
  }

  // Clear location state function
  const clearLocationState = () => {
    console.log(`[LocationProvider] clearLocationState called - Current state:`, {
      locationInput,
      currentLocation,
      shouldClearOnRouteChange,
      pathname,
      lastPathname
    })
    
    logLocalStorageKeys('BEFORE clearing')
    
    setLocationInput("")
    setCurrentLocation("")
    
    // Clear localStorage cache as well
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove = [
          'bitweather_city',
          'bitweather_weather_data', 
          'bitweather_cache_timestamp',
          'weather-search-cache'
        ]
        
        keysToRemove.forEach(key => {
          const existed = safeStorage.getItem(key) !== null
          safeStorage.removeItem(key)
          console.log(`[LocationProvider] Removed localStorage key: ${key} (existed: ${existed})`)
        })
        
        // Clear user cache service data
        userCacheService.clearWeatherCache()
        
        logLocalStorageKeys('AFTER clearing')
        console.log('[LocationProvider] Location state and all caches cleared successfully')
      } catch (error) {
        console.warn('[LocationProvider] Failed to clear location cache:', error)
      }
    }
  }

  // Component mount detection
  useEffect(() => {
    console.log('[LocationProvider] Component mounted with pathname:', pathname)
    // Cleanup legacy keys to avoid confusion with new cache system
    try {
      const legacyKey = 'weather-app-last-location'
      const existed = safeStorage.getItem(legacyKey) !== null
      if (existed) {
        safeStorage.removeItem(legacyKey)
        console.log(`[LocationProvider] Removed legacy key: ${legacyKey}`)
      }
    } catch {}
    logLocalStorageKeys('On mount')
  }, [])

  // Route change detection and state clearing
  useEffect(() => {
    console.log(`[LocationProvider] Route change effect triggered:`, {
      pathname,
      lastPathname,
      shouldClearOnRouteChange,
      locationInput,
      currentLocation
    })

    if (!pathname || pathname === lastPathname) {
      console.log('[LocationProvider] No route change detected - returning early')
      return
    }

    const isNavigatingFromHomeToCityPage = lastPathname === '/' && pathname.startsWith('/weather/')
    const isNavigatingFromHomeToMap = lastPathname === '/' && pathname === '/map'
    const isNavigatingFromCityPageToHome = lastPathname.startsWith('/weather/') && pathname === '/'
    const isNavigatingBetweenCityPages = lastPathname.startsWith('/weather/') && pathname.startsWith('/weather/') && lastPathname !== pathname

    console.log(`[LocationProvider] Route navigation analysis:`, {
      isNavigatingFromHomeToCityPage,
      isNavigatingFromHomeToMap,
      isNavigatingFromCityPageToHome,
      isNavigatingBetweenCityPages,
      shouldClearOnRouteChange
    })

    // Always clear when navigating between different city pages or from city to home
    // DON'T clear when navigating from home to map (preserve location state)
    const shouldClear = (isNavigatingFromCityPageToHome || isNavigatingBetweenCityPages) ||
                       (shouldClearOnRouteChange && isNavigatingFromHomeToCityPage && !isNavigatingFromHomeToMap)

    if (shouldClear) {
      console.log(`[LocationProvider] 🔥 CLEARING TRIGGERED: Route change detected: ${lastPathname} -> ${pathname}`)
      clearLocationState()
    } else {
      console.log(`[LocationProvider] ⏭️ CLEARING SKIPPED: Conditions not met`)
    }

    console.log(`[LocationProvider] Updating lastPathname: "${lastPathname}" -> "${pathname}"`)
    setLastPathname(pathname)
  }, [pathname, lastPathname, shouldClearOnRouteChange, locationInput, currentLocation])

  // Initialize last pathname on mount
  useEffect(() => {
    console.log(`[LocationProvider] Pathname initialization effect:`, { pathname, lastPathname })
    if (pathname && !lastPathname) {
      console.log(`[LocationProvider] Initializing lastPathname: "${lastPathname}" -> "${pathname}"`)
      setLastPathname(pathname)
    }
  }, [pathname, lastPathname])

  // Debug state changes
  useEffect(() => {
    console.log(`[LocationProvider] State change - locationInput: "${locationInput}"`)
  }, [locationInput])

  useEffect(() => {
    console.log(`[LocationProvider] State change - currentLocation: "${currentLocation}"`)
  }, [currentLocation])

  useEffect(() => {
    console.log(`[LocationProvider] State change - shouldClearOnRouteChange: ${shouldClearOnRouteChange}`)
  }, [shouldClearOnRouteChange])

  const value: LocationContextType = {
    locationInput,
    currentLocation,
    setLocationInput: setLocationInputWithDebug,
    setCurrentLocation: setCurrentLocationWithDebug,
    clearLocationState,
    shouldClearOnRouteChange,
    setShouldClearOnRouteChange
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocationContext() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider')
  }
  return context
}
