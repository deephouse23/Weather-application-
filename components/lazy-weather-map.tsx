'use client'

/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 */

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { ThemeType } from '@/lib/theme-config'

interface LazyWeatherMapProps {
  latitude?: number
  longitude?: number
  locationName?: string
  theme?: ThemeType
  defaultMode?: 'static' | 'animation'
  displayMode?: 'full-page' | 'widget'
}

const WeatherMap = dynamic(() => import('./weather-map-openlayers'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg border-2 border-gray-600">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
})

export default function LazyWeatherMap(props: LazyWeatherMapProps) {
  return <WeatherMap {...props} />
}