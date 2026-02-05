"use client"

import React from 'react'

// Helper function to get weather emoji as fallback
function getWeatherEmoji(condition: string, isNight: boolean = false): string {
  const cond = condition.toLowerCase()

  if (cond.includes('clear') || cond.includes('sunny')) return isNight ? '🌙' : '☀️'
  // Check for partly cloudy before general cloudy
  if (cond.includes('partly') || cond.includes('few clouds') || cond.includes('scattered')) return isNight ? '🌙' : '⛅'
  if (cond.includes('cloud') || cond.includes('overcast')) return '☁️'
  if (cond.includes('thunder') || cond.includes('storm')) return '⛈️'
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) return '🌧️'
  if (cond.includes('snow') || cond.includes('sleet') || cond.includes('blizzard')) return '❄️'
  if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) return '🌫️'

  return isNight ? '🌙' : '🌤️' // Default
}

// Check if an OpenWeatherMap icon code indicates nighttime
function isNightIcon(code?: string): boolean {
  return !!code && code.endsWith('n')
}

interface ModernWeatherIconProps {
  code?: string
  condition?: string
  className?: string
  size?: number
  isNight?: boolean
}

export default function ModernWeatherIcon({
  code,
  condition,
  className = '',
  size = 64,
  isNight: isNightProp
}: ModernWeatherIconProps) {
  // Use OpenWeatherMap icon URL if code is provided
  const iconUrl = code
    ? `https://openweathermap.org/img/wn/${code}@2x.png`
    : null

  // Determine nighttime: explicit prop takes priority, then infer from icon code
  const night = isNightProp ?? isNightIcon(code)

  return iconUrl ? (
    <img
      src={iconUrl}
      alt={condition || 'weather icon'}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={{
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        transition: 'transform 0.2s ease'
      }}
    />
  ) : (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.6 }}>
        {getWeatherEmoji(condition || '', night)}
      </span>
    </div>
  )
}

// Helper function to get icon URL (for use in other components)
export function getWeatherIconUrl(code?: string): string {
  return code
    ? `https://openweathermap.org/img/wn/${code}@2x.png`
    : ''
}
