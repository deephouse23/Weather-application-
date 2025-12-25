"use client"

import React from 'react'

// Helper function to get weather emoji as fallback
function getWeatherEmoji(condition: string): string {
  const cond = condition.toLowerCase()

  if (cond.includes('clear') || cond.includes('sunny')) return '☀️'
  if (cond.includes('cloud')) return '☁️'
  if (cond.includes('rain') || cond.includes('drizzle')) return '🌧️'
  if (cond.includes('thunder') || cond.includes('storm')) return '⛈️'
  if (cond.includes('snow')) return '❄️'
  if (cond.includes('fog') || cond.includes('mist')) return '🌫️'

  return '🌤️' // Default
}

interface ModernWeatherIconProps {
  code?: string
  condition?: string
  className?: string
  size?: number
}

export default function ModernWeatherIcon({
  code,
  condition,
  className = '',
  size = 64
}: ModernWeatherIconProps) {
  // Use OpenWeatherMap icon URL if code is provided
  const iconUrl = code
    ? `https://openweathermap.org/img/wn/${code}@2x.png`
    : null

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
        {getWeatherEmoji(condition || '')}
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
