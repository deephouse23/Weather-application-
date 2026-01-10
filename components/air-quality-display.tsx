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
  // Theme-specific styles
  const getThemeStyles = () => {
    if (minimal) return {
      container: '',
      header: '',
      text: 'text-white/80',
      border: 'border-white/20',
      shadow: 'none'
    };

    switch (theme) {
      case 'dark':
        return {
          container: 'bg-[#16213e] border-[#00d4ff]',
          header: 'text-[#00d4ff]',
          text: 'text-[#e0e0e0]',
          border: 'border-[#00d4ff66]',
          shadow: '0 0 15px #00d4ff33'
        }
      case 'miami':
        return {
          container: 'bg-[#2d1b69] border-[#ff1493]',
          header: 'text-[#ff1493]',
          text: 'text-[#00ffff]',
          border: 'border-[#ff149366]',
          shadow: '0 0 15px #ff149333'
        }
      case 'synthwave84':
        return {
          container: 'bg-[#2d1b69]/60 border-[#ff7edb]',
          header: 'text-[#ff7edb]',
          text: 'text-[#ffffff]',
          border: 'border-[#ff7edb66]',
          shadow: '0 0 15px #ff7edb33'
        }
      case 'dracula':
        return {
          container: 'bg-[#44475a]/80 border-[#ff79c6]',
          header: 'text-[#ff79c6]',
          text: 'text-[#f8f8f2]',
          border: 'border-[#ff79c666]',
          shadow: '0 0 15px #ff79c633'
        }
      case 'cyberpunk':
        return {
          container: 'bg-[#141414]/90 border-[#00ffff]',
          header: 'text-[#fcee0a]',
          text: 'text-[#ffffff]',
          border: 'border-[#00ffff66]',
          shadow: '0 0 15px #00ffff33'
        }
      case 'matrix':
        return {
          container: 'bg-[#001400]/80 border-[#008f11]',
          header: 'text-[#00ff41]',
          text: 'text-[#00ff41]',
          border: 'border-[#008f1166]',
          shadow: '0 0 15px #008f1133'
        }
      default:
        return {
          container: 'bg-[#16213e] border-[#00d4ff]',
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
        !minimal && "p-4 rounded-lg text-center border-2 shadow-lg",
        !minimal && styles.container,
        className
      )}
      style={!minimal ? { boxShadow: styles.shadow } : undefined}
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