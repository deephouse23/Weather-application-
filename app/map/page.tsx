'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useLocationContext } from '@/components/location-context'
import { userCacheService } from '@/lib/user-cache-service'
import { WeatherData } from '@/lib/types'

const WeatherMap = dynamic(() => import('@/components/weather-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-gray-900">
      <div className="text-white text-center">
        <div className="mb-2">Loading Weather Map...</div>
        <div className="text-sm text-gray-400">Initializing map components</div>
      </div>
    </div>
  )
})

export default function MapPage() {
  const { currentLocation } = useLocationContext()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadWeatherData = () => {
      setIsLoading(true)

      // Try to get cached weather data from the last location
      const lastLocation = userCacheService.getLastLocation()
      
      if (lastLocation) {
        const locationKey = userCacheService.getLocationKey(lastLocation)
        const cached = userCacheService.getCachedWeatherData(locationKey)
        
        if (cached) {
          setWeatherData(cached)
          setIsLoading(false)
          return
        }
      }

      // If no cached data, check if there's a current location string
      if (currentLocation) {
        // Try to find cached data by searching through all cache entries
        const allKeys = typeof window !== 'undefined' ? Object.keys(localStorage) : []
        const weatherCacheKeys = allKeys.filter(key => 
          key.includes('bitweather_weather_cache') && 
          !key.endsWith('_timestamp')
        )

        for (const key of weatherCacheKeys) {
          try {
            const stored = localStorage.getItem(key)
            if (stored) {
              const parsed = JSON.parse(stored)
              if (parsed.data) {
                setWeatherData(parsed.data)
                setIsLoading(false)
                return
              }
            }
          } catch (e) {
            // Continue searching
          }
        }
      }

      setIsLoading(false)
    }

    loadWeatherData()
  }, [currentLocation])

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full">
        <div className="p-2">
          <Link href="/" className="inline-block text-xs font-mono px-2 py-1 border-2 border-gray-600 hover:bg-gray-700 transition-colors" aria-label="Return to Home">
            ← Home
          </Link>
        </div>
        <div className="h-full flex items-center justify-center bg-gray-900">
          <div className="text-white text-center">
            <div className="mb-2">Loading Weather Data...</div>
            <div className="text-sm text-gray-400">Retrieving location information</div>
          </div>
        </div>
      </div>
    )
  }

  if (!weatherData || !weatherData.coordinates) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full">
        <div className="p-2">
          <Link href="/" className="inline-block text-xs font-mono px-2 py-1 border-2 border-gray-600 hover:bg-gray-700 transition-colors" aria-label="Return to Home">
            ← Home
          </Link>
        </div>
        <div className="h-full flex items-center justify-center bg-gray-900">
          <div className="text-white text-center max-w-md px-4">
            <div className="text-xl mb-4 font-mono">NO LOCATION DATA</div>
            <div className="text-sm text-gray-400 mb-6">
              Search for a location on the home page first to view its weather map.
            </div>
            <Link 
              href="/" 
              className="inline-block text-sm font-mono px-4 py-2 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-colors"
            >
              ← Return to Home & Search
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <div className="p-2">
        <Link href="/" className="inline-block text-xs font-mono px-2 py-1 border-2 border-gray-600 hover:bg-gray-700 transition-colors" aria-label="Return to Home">
          ← Home
        </Link>
      </div>
      <WeatherMap 
        latitude={weatherData.coordinates.lat}
        longitude={weatherData.coordinates.lon}
        locationName={weatherData.location}
      />
    </div>
  )
}

export const runtime = 'edge'
