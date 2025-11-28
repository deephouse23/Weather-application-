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
      case 'atari2600':
        return {
          container: 'bg-[#000000] border-[#702800]',
          header: 'text-[#E0EC9C]',
          text: 'text-[#FFFFFF]',
          border: 'border-[#70280066]',
          shadow: '0 0 15px #70280033'
        }
      case 'monochromeGreen':
        return {
          container: 'bg-[#0D0D0D] border-[#009900]',
          header: 'text-[#33FF33]',
          text: 'text-[#33FF33]',
          border: 'border-[#00990066]',
          shadow: '0 0 15px #00990033'
        }
      case '8bitClassic':
        return {
          container: 'bg-[#D3D3D3] border-[#000000]',
          header: 'text-[#CC0000]',
          text: 'text-[#000000]',
          border: 'border-[#00000066]',
          shadow: '0 0 15px #00000033'
        }
      case '16bitSnes':
        return {
          container: 'bg-[#B8B8D0] border-[#5B5B8B]',
          header: 'text-[#FFD700]',
          text: 'text-[#2C2C3E]',
          border: 'border-[#5B5B8B66]',
          shadow: '0 0 15px #5B5B8B33'
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