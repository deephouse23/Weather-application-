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
 * Air Quality Index (AQI) Display Component
 * Displays AQI data with color-coded visual bar, description, and recommendations
 */

import { cn } from '@/lib/utils'
import { 
  getAQIColor, 
  getAQIDescription, 
  getAQIRecommendation, 
  getAQIIndicatorPosition,
  AQI_SCALE_LABELS,
  AQI_COLOR_SEGMENTS
} from '@/lib/air-quality-utils'

interface AirQualityDisplayProps {
  aqi: number
  theme: 'dark' | 'miami' | 'tron'
  className?: string
}

export function AirQualityDisplay({ aqi, theme, className }: AirQualityDisplayProps) {
  // Theme-specific styles
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          container: 'bg-[#0f0f0f] border-[#00d4ff]',
          header: 'text-[#00d4ff]',
          text: 'text-[#e0e0e0]',
          border: 'border-[#00d4ff66]',
          shadow: '0 0 15px #00d4ff33'
        }
      case 'miami':
        return {
          container: 'bg-[#0a0025] border-[#ff1493]',
          header: 'text-[#ff1493]',
          text: 'text-[#00ffff]',
          border: 'border-[#ff149366]',
          shadow: '0 0 15px #ff149333'
        }
      case 'tron':
        return {
          container: 'bg-black border-[#00FFFF]',
          header: 'text-[#00FFFF]',
          text: 'text-white',
          border: 'border-[#00FFFF66]',
          shadow: '0 0 15px #00FFFF33'
        }
      default:
        return {
          container: 'bg-[#0f0f0f] border-[#00d4ff]',
          header: 'text-[#00d4ff]',
          text: 'text-[#e0e0e0]',
          border: 'border-[#00d4ff66]',
          shadow: '0 0 15px #00d4ff33'
        }
    }
  }

  const styles = getThemeStyles()

  return (
    <div 
      className={cn(
        "p-4 rounded-lg text-center border-2 shadow-lg",
        styles.container,
        className
      )}
      style={{ boxShadow: styles.shadow }}
    >
      {/* Header */}
      <h2 className={cn("text-xl font-semibold mb-3", styles.header)}>
        Air Quality
      </h2>
      
      {/* AQI Value and Description */}
      <p className={`text-lg font-bold mb-3 ${getAQIColor(aqi)}`}>
        {aqi} - {getAQIDescription(aqi)}
      </p>
      
      {/* Horizontal AQI Color Bar */}
      <div className="mb-3">
        <div className="relative w-full h-4 rounded-full overflow-hidden border border-gray-400">
          {/* Color segments */}
          <div className="absolute inset-0 flex">
            {AQI_COLOR_SEGMENTS.map((segment, index) => (
              <div 
                key={index}
                className={cn("flex-1", segment.color)} 
                style={{ width: segment.width }}
                title={segment.label}
              />
            ))}
          </div>
          
          {/* Current reading indicator */}
          <div 
            className="absolute top-0 w-1 h-full bg-white border border-black transform -translate-x-0.5"
            style={{ 
              left: `${getAQIIndicatorPosition(aqi)}%`,
              boxShadow: '0 0 4px rgba(0,0,0,0.8)'
            }}
          />
        </div>
        
        {/* AQI Scale Labels */}
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
          {AQI_SCALE_LABELS.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      </div>
      
      {/* Health Recommendation */}
      <p className={cn("text-sm font-medium mb-2", styles.text)}>
        {getAQIRecommendation(aqi)}
      </p>
      
      {/* Google AQI Legend */}
      <div className={cn("text-xs border-t pt-2", styles.text, styles.border)}>
        <p className="font-medium">Using Google Universal AQI • Higher = Better</p>
      </div>
    </div>
  )
}