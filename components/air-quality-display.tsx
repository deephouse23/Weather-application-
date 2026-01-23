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
import { ThemeType } from '@/lib/theme-config'

interface AirQualityDisplayProps {
  aqi: number
  theme: ThemeType
  className?: string
  minimal?: boolean
}

export function AirQualityDisplay({ aqi, theme, className, minimal = false }: AirQualityDisplayProps) {
  // Theme-aware styles using CSS variables
  const styles = minimal
    ? {
        container: '',
        header: '',
        text: 'text-white/80',
        border: 'border-white/20'
      }
    : {
        container: 'bg-card border-primary glow-subtle',
        header: 'text-primary',
        text: 'text-foreground',
        border: 'border-primary/40'
      };

  return (
    <div
      className={cn(
        !minimal && "p-4 rounded-lg text-center border-2",
        !minimal && styles.container,
        className
      )}
    >
      {/* Header */}
      <h2 className={cn("text-xl font-semibold mb-3", styles.header, minimal && "text-lg mb-2 text-center md:text-left")}>
        Air Quality
      </h2>

      {/* AQI Value and Description */}
      <p className={cn("text-lg font-bold mb-3", getAQIColor(aqi), minimal && "text-base mb-2")}>
        {aqi} - {getAQIDescription(aqi)}
      </p>

      {/* Horizontal AQI Color Bar */}
      <div className="mb-3">
        <div className="relative w-full h-4 rounded-full overflow-hidden border border-gray-400/50">
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
        {!minimal && (
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
            {AQI_SCALE_LABELS.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
        )}
      </div>

      {/* Health Recommendation */}
      <p className={cn("text-sm font-medium mb-2", styles.text, minimal && "text-xs line-clamp-2")}>
        {getAQIRecommendation(aqi)}
      </p>

      {/* EPA AQI Legend - Updated */}
      {!minimal && (
        <div className={cn("text-xs border-t pt-2", styles.text, styles.border)}>
          <p className="font-medium">EPA Air Quality Index • Lower = Better</p>
        </div>
      )}
    </div>
  )
}