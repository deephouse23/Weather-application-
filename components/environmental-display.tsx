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

/**
 * Environmental Display Component
 * Combined AQI and Pollen display for consistent environmental data presentation
 */

import { AirQualityDisplay } from './air-quality-display'
import { PollenDisplay } from './pollen-display'
import { WeatherData } from '@/lib/types'
import { ThemeType } from '@/lib/theme-config'

interface EnvironmentalDisplayProps {
  weather: WeatherData
  theme: ThemeType
  className?: string
}

export function EnvironmentalDisplay({ weather, theme, className }: EnvironmentalDisplayProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className || ''}`}>
      <AirQualityDisplay 
        aqi={weather.aqi} 
        theme={theme}
      />
      <PollenDisplay 
        pollen={weather.pollen} 
        theme={theme}
      />
    </div>
  )
}

export default EnvironmentalDisplay