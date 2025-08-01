"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { userCacheService } from '@/lib/user-cache-service'

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

  // Clear location state function
  const clearLocationState = () => {
    setLocationInput("")
    setCurrentLocation("")
    
    // Clear localStorage cache as well
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bitweather_city')
        localStorage.removeItem('bitweather_weather_data')
        localStorage.removeItem('bitweather_cache_timestamp')
        localStorage.removeItem('weather-search-cache')
        
        // Clear user cache service data
        userCacheService.clearWeatherCache()
        
        console.log('Location state and all caches cleared')
      } catch (error) {
        console.warn('Failed to clear location cache:', error)
      }
    }
  }

  // Route change detection and state clearing
  useEffect(() => {
    if (!pathname || pathname === lastPathname) return

    const isNavigatingFromHomeToCityPage = lastPathname === '/' && pathname.startsWith('/weather/')
    const isNavigatingFromCityPageToHome = lastPathname.startsWith('/weather/') && pathname === '/'
    const isNavigatingBetweenCityPages = lastPathname.startsWith('/weather/') && pathname.startsWith('/weather/') && lastPathname !== pathname

    if (shouldClearOnRouteChange && (isNavigatingFromHomeToCityPage || isNavigatingFromCityPageToHome || isNavigatingBetweenCityPages)) {
      console.log(`Route change detected: ${lastPathname} -> ${pathname}, clearing location state`)
      clearLocationState()
    }

    setLastPathname(pathname)
  }, [pathname, lastPathname, shouldClearOnRouteChange])

  // Initialize last pathname on mount
  useEffect(() => {
    if (pathname && !lastPathname) {
      setLastPathname(pathname)
    }
  }, [pathname, lastPathname])

  const value: LocationContextType = {
    locationInput,
    currentLocation,
    setLocationInput,
    setCurrentLocation,
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