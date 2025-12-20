'use client'

/**
 * 16-Bit Weather Platform - BETA v0.3.2
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 */

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Home, Map as MapIcon, Share2 } from 'lucide-react'
import { useLocationContext } from '@/components/location-context'
import { userCacheService } from '@/lib/user-cache-service'
import { WeatherData } from '@/lib/types'
import { useTheme } from '@/components/theme-provider'
import { fetchWeatherData } from '@/lib/weather-api'

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
  const { theme } = useTheme()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shareSuccess, setShareSuccess] = useState(false)

  useEffect(() => {
    const loadWeatherData = async () => {
      setIsLoading(true)

      console.log('[MapPage] Loading weather data - currentLocation:', currentLocation)

      // PRIORITY 1: Check if currentLocation is available in context
      if (currentLocation) {
        console.log('[MapPage] Current location from context:', currentLocation)

        // Try to find cached data by searching through all cache entries
        const allKeys = typeof window !== 'undefined' ? Object.keys(localStorage) : []
        const weatherCacheKeys = allKeys.filter(key =>
          key.includes('bitweather_weather_cache') &&
          !key.endsWith('_timestamp')
        )

        console.log('[MapPage] Searching for cached data in keys:', weatherCacheKeys.length)

        for (const key of weatherCacheKeys) {
          try {
            const stored = localStorage.getItem(key)
            if (stored) {
              const parsed = JSON.parse(stored)
              if (parsed.data) {
                console.log('[MapPage] Found cached data for current location:', parsed.data.location)
                
                // PR #168 strips coordinates from cached data for privacy.
                // If coordinates are missing, fetch fresh data to get them for the radar.
                if (!parsed.data.coordinates?.lat || !parsed.data.coordinates?.lon) {
                  console.log('[MapPage] Cached data missing coordinates, fetching fresh data for radar...')
                  try {
                    const freshData = await fetchWeatherData(parsed.data.location || currentLocation, 'imperial')
                    if (freshData?.coordinates?.lat && freshData?.coordinates?.lon) {
                      console.log('[MapPage] Fresh coordinates obtained:', freshData.coordinates)
                      setWeatherData(freshData)
                      setIsLoading(false)
                      return
                    }
                  } catch (fetchError) {
                    console.warn('[MapPage] Failed to fetch fresh coordinates:', fetchError)
                  }
                }
                
                setWeatherData(parsed.data)
                setIsLoading(false)
                return
              }
            }
          } catch (e) {
            // Continue searching
          }
        }
        
        // No cached data found but we have a location name - fetch fresh data
        console.log('[MapPage] No cached data found, fetching fresh data for:', currentLocation)
        try {
          const freshData = await fetchWeatherData(currentLocation, 'imperial')
          if (freshData) {
            console.log('[MapPage] Fresh data obtained with coordinates:', freshData.coordinates)
            setWeatherData(freshData)
            setIsLoading(false)
            return
          }
        } catch (fetchError) {
          console.warn('[MapPage] Failed to fetch weather data:', fetchError)
        }
      }

      console.log('[MapPage] No weather data found')
      setIsLoading(false)
    }

    loadWeatherData()
  }, [currentLocation])

  // Share location handler
  const handleShare = async () => {
    if (!weatherData) return

    // Coordinates may be intentionally omitted from cached weather data (privacy / CodeQL).
    // Only include them in the share URL if present.
    const shareUrl = weatherData.coordinates
      ? `${window.location.origin}/map?lat=${weatherData.coordinates.lat}&lon=${weatherData.coordinates.lon}`
      : `${window.location.origin}/map`
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Weather Radar - ${weatherData.location}`,
          text: `Check out the weather radar for ${weatherData.location}`,
          url: shareUrl
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2000)
      }
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full">
        <div className="p-3 bg-gray-900 border-b border-gray-700 flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 border-2 border-gray-600 hover:bg-gray-700 transition-colors rounded" aria-label="Return to Home">
            <Home className="w-3 h-3" />
            HOME
          </Link>
          <div className="text-gray-500 text-xs font-mono">
            <MapIcon className="w-3 h-3 inline mr-1" />
            RADAR MAP
          </div>
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

  // Check if we have valid coordinates for the radar
  const hasValidCoordinates = weatherData?.coordinates?.lat && 
    weatherData?.coordinates?.lon && 
    weatherData.coordinates.lat !== 0 && 
    weatherData.coordinates.lon !== 0

  if (!weatherData) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full">
        <div className="p-3 bg-gray-900 border-b border-gray-700 flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 border-2 border-gray-600 hover:bg-gray-700 transition-colors rounded" aria-label="Return to Home">
            <Home className="w-3 h-3" />
            HOME
          </Link>
          <div className="text-gray-500 text-xs font-mono">
            <MapIcon className="w-3 h-3 inline mr-1" />
            RADAR MAP
          </div>
        </div>
        <div className="h-full flex items-center justify-center bg-gray-900">
          <div className="text-white text-center max-w-md px-4">
            <div className="text-xl mb-4 font-mono">NO LOCATION DATA</div>
            <div className="text-sm text-gray-400 mb-6">
              Search for a location on the home page first to view its weather map.
            </div>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm font-mono px-4 py-2 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-colors rounded"
            >
              <Home className="w-4 h-4" />
              Return to Home & Search
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show message if we have weather data but missing coordinates
  if (!hasValidCoordinates) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full">
        <div className="p-3 bg-gray-900 border-b border-gray-700 flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 border-2 border-gray-600 hover:bg-gray-700 transition-colors rounded" aria-label="Return to Home">
            <Home className="w-3 h-3" />
            HOME
          </Link>
          <div className="text-gray-500 text-xs font-mono">
            <MapIcon className="w-3 h-3 inline mr-1" />
            RADAR MAP
          </div>
          {weatherData.location && (
            <div className="text-yellow-400 text-xs font-mono">
              {weatherData.location}
            </div>
          )}
        </div>
        <div className="h-full flex items-center justify-center bg-gray-900">
          <div className="text-white text-center max-w-md px-4">
            <div className="text-xl mb-4 font-mono text-yellow-400">COORDINATES UNAVAILABLE</div>
            <div className="text-sm text-gray-400 mb-4">
              Unable to load radar data for <span className="text-cyan-400">{weatherData.location}</span>.
            </div>
            <div className="text-sm text-gray-500 mb-6">
              Location coordinates are required for radar display. Please search for the location again.
            </div>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm font-mono px-4 py-2 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-colors rounded"
            >
              <Home className="w-4 h-4" />
              Search Location
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col">
      {/* Breadcrumb Header */}
      <div className="p-3 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 border-2 border-gray-600 hover:bg-gray-700 transition-colors rounded" aria-label="Return to Home">
            <Home className="w-3 h-3" />
            HOME
          </Link>
          <div className="text-white text-xs font-mono">
            <MapIcon className="w-3 h-3 inline mr-1" />
            RADAR MAP
          </div>
          {weatherData.location && (
            <div className="text-cyan-400 text-xs font-mono font-bold">
              → {weatherData.location}
            </div>
          )}
        </div>
        
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 border-2 border-gray-600 hover:bg-gray-700 transition-colors rounded"
          title="Share this radar map"
        >
          <Share2 className="w-3 h-3" />
          {shareSuccess ? 'COPIED!' : 'SHARE'}
        </button>
      </div>
      
      {/* Map Container */}
      <div className="flex-1">
        <WeatherMap
          latitude={weatherData.coordinates!.lat}
          longitude={weatherData.coordinates!.lon}
          locationName={weatherData.location}
          theme={theme || 'dark'}
        />
      </div>
    </div>
  )
}

export const runtime = 'edge'
