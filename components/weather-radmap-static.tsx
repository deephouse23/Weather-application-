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

import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { buildRadMapUrl, formatRadMapTimestamp, type RadMapParams } from '@/lib/utils/radmap-utils'
import { ThemeType } from '@/lib/theme-config'

interface WeatherRadMapStaticProps {
  latitude?: number
  longitude?: number
  locationName?: string
  theme?: ThemeType
  width?: number
  height?: number
  includeWarnings?: boolean
  includeStormReports?: boolean
  autoRefresh?: boolean
  refreshInterval?: number // in seconds
}

export default function WeatherRadMapStatic({
  latitude,
  longitude,
  locationName,
  theme = 'dark',
  width = 800,
  height = 600,
  includeWarnings = false,
  includeStormReports = false,
  autoRefresh = false,
  refreshInterval = 300 // 5 minutes default
}: WeatherRadMapStaticProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [imageKey, setImageKey] = useState(0)

  // Build layers array
  const layers = useMemo(() => {
    const layerList = ['nexrad']
    if (includeWarnings) layerList.push('cbw')
    if (includeStormReports) layerList.push('lsrs')
    return layerList
  }, [includeWarnings, includeStormReports])

  // Build RadMap URL
  const radmapUrl = useMemo(() => {
    if (!latitude || !longitude) return null

    const params: RadMapParams = {
      latitude,
      longitude,
      width,
      height,
      layers,
      timestamp: lastUpdate
    }

    return buildRadMapUrl(params)
  }, [latitude, longitude, width, height, layers, lastUpdate])

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true)
    setError(null)
    setLastUpdate(new Date())
    setImageKey(prev => prev + 1)
  }

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      handleRefresh()
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  // Image load handlers
  const handleImageLoad = () => {
    setIsLoading(false)
    setError(null)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setError('Failed to load radar image')
  }

  // Theme styles
  const themeStyles = useMemo(() => {
    switch (theme) {
      case 'miami':
        return {
          container: 'border-4 border-pink-500 shadow-lg shadow-pink-500/50',
          badge: 'bg-pink-600/90 text-white border-pink-400',
          button: 'bg-pink-600 hover:bg-pink-700 border-pink-400'
        }
      case 'tron':
        return {
          container: 'border-2 border-cyan-400 shadow-lg shadow-cyan-400/50',
          badge: 'bg-cyan-600/90 text-white border-cyan-400',
          button: 'bg-cyan-600 hover:bg-cyan-700 border-cyan-400'
        }
      default:
        return {
          container: 'border-2 border-gray-600 shadow-lg',
          badge: 'bg-gray-800/90 text-white border-gray-600',
          button: 'bg-gray-700 hover:bg-gray-600 border-gray-600'
        }
    }
  }, [theme])

  if (!latitude || !longitude) {
    return (
      <div className={`relative w-full rounded-lg overflow-hidden ${themeStyles.container}`} 
           style={{ height: `${height}px` }}>
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <p className="font-mono text-sm">No location data available</p>
          </div>
        </div>
      </div>
    )
  }

  if (!radmapUrl) {
    return (
      <div className={`relative w-full rounded-lg overflow-hidden ${themeStyles.container}`} 
           style={{ height: `${height}px` }}>
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <p className="font-mono text-sm">Unable to generate radar URL</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full rounded-lg overflow-hidden ${themeStyles.container}`} 
         style={{ height: `${height}px` }}>
      {/* Status Badge */}
      <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-md border-2 font-mono text-xs font-bold z-10 ${themeStyles.badge}`}>
        <span>📷 STATIC • IOWA STATE</span>
      </div>

      {/* Refresh Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1.5 border-2 rounded-md font-mono text-xs font-bold transition-colors ${themeStyles.button} ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Refresh radar image"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          REFRESH
        </button>
      </div>

      {/* Timestamp */}
      <div className={`absolute bottom-4 left-4 px-3 py-1.5 rounded-md border-2 font-mono text-xs font-bold z-10 ${themeStyles.badge}`}>
        <span>{formatRadMapTimestamp(lastUpdate)}</span>
      </div>

      {/* Location Name */}
      {locationName && (
        <div className={`absolute bottom-4 right-4 px-3 py-1.5 rounded-md border-2 font-mono text-xs font-bold z-10 ${themeStyles.badge}`}>
          <span>{locationName}</span>
        </div>
      )}

      {/* Radar Image */}
      <div className="relative w-full h-full bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="font-mono text-sm">Loading radar...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-red-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-2" />
              <p className="font-mono text-sm mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className={`px-4 py-2 border-2 rounded-md font-mono text-xs font-bold ${themeStyles.button}`}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {radmapUrl && (
          <img
            key={imageKey}
            src={radmapUrl}
            alt={`Weather radar for ${locationName || 'selected location'}`}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: error ? 'none' : 'block' }}
          />
        )}
      </div>
    </div>
  )
}

