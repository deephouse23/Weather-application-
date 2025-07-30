/**
 * Environmental Display Component
 * Combined AQI and Pollen display for consistent environmental data presentation
 */

import { AirQualityDisplay } from './air-quality-display'
import { PollenDisplay } from './pollen-display'
import { WeatherData } from '@/lib/types'

interface EnvironmentalDisplayProps {
  weather: WeatherData
  theme: 'dark' | 'miami' | 'tron'
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