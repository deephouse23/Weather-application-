"use client"

import React from 'react'

// OpenWeatherMap icon code mapping to Meteocons icon names
const iconMapping: Record<string, string> = {
  // Clear sky
  '01d': 'clear-day',
  '01n': 'clear-night',
  // Few clouds
  '02d': 'partly-cloudy-day',
  '02n': 'partly-cloudy-night',
  // Scattered clouds
  '03d': 'cloudy',
  '03n': 'cloudy',
  // Broken clouds
  '04d': 'overcast-day',
  '04n': 'overcast-night',
  // Shower rain
  '09d': 'rain',
  '09n': 'rain',
  // Rain
  '10d': 'partly-cloudy-day-rain',
  '10n': 'partly-cloudy-night-rain',
  // Thunderstorm
  '11d': 'thunderstorms-day-rain',
  '11n': 'thunderstorms-night-rain',
  // Snow
  '13d': 'snow',
  '13n': 'snow',
  // Mist/Fog
  '50d': 'mist',
  '50n': 'mist',
  // Drizzle
  '09d-drizzle': 'drizzle',
  '09n-drizzle': 'drizzle',
  // Extreme weather
  'extreme': 'thunderstorms-extreme-rain',
  'tornado': 'tornado',
  'hurricane': 'hurricane',
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
  // Determine the icon name from code or condition
  let iconName = 'clear-day' // Default fallback

  if (code && iconMapping[code]) {
    iconName = iconMapping[code]
  } else if (condition) {
    // Fallback to condition-based mapping
    const cond = condition.toLowerCase()
    if (cond.includes('clear') || cond.includes('sunny')) {
      iconName = 'clear-day'
    } else if (cond.includes('cloud')) {
      if (cond.includes('few') || cond.includes('partly')) {
        iconName = 'partly-cloudy-day'
      } else if (cond.includes('scattered')) {
        iconName = 'cloudy'
      } else {
        iconName = 'overcast-day'
      }
    } else if (cond.includes('rain')) {
      if (cond.includes('shower') || cond.includes('heavy')) {
        iconName = 'rain'
      } else {
        iconName = 'partly-cloudy-day-rain'
      }
    } else if (cond.includes('drizzle')) {
      iconName = 'drizzle'
    } else if (cond.includes('thunder') || cond.includes('storm')) {
      if (cond.includes('extreme')) {
        iconName = 'thunderstorms-extreme-rain'
      } else {
        iconName = 'thunderstorms-day-rain'
      }
    } else if (cond.includes('snow') || cond.includes('blizzard')) {
      iconName = 'snow'
    } else if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) {
      iconName = 'mist'
    } else if (cond.includes('tornado')) {
      iconName = 'tornado'
    } else if (cond.includes('hurricane')) {
      iconName = 'hurricane'
    }
  }

  // Construct CDN URL for Meteocons
  const iconUrl = `https://cdn.jsdelivr.net/npm/meteocons@1.8.2/production/fill/svg/${iconName}.svg`

  return (
    <img
      src={iconUrl}
      alt={condition || iconName}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={{
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        transition: 'transform 0.2s ease'
      }}
      onError={(e) => {
        // Fallback to clear-day if icon fails to load
        e.currentTarget.src = `https://cdn.jsdelivr.net/npm/meteocons@1.8.2/production/fill/svg/clear-day.svg`
      }}
    />
  )
}

// Helper function to get icon URL (for use in other components)
export function getWeatherIconUrl(code?: string, condition?: string): string {
  let iconName = 'clear-day'

  if (code && iconMapping[code]) {
    iconName = iconMapping[code]
  } else if (condition) {
    const cond = condition.toLowerCase()
    if (cond.includes('clear') || cond.includes('sunny')) {
      iconName = 'clear-day'
    } else if (cond.includes('cloud')) {
      if (cond.includes('few') || cond.includes('partly')) {
        iconName = 'partly-cloudy-day'
      } else if (cond.includes('scattered')) {
        iconName = 'cloudy'
      } else {
        iconName = 'overcast-day'
      }
    } else if (cond.includes('rain')) {
      iconName = cond.includes('shower') ? 'rain' : 'partly-cloudy-day-rain'
    } else if (cond.includes('drizzle')) {
      iconName = 'drizzle'
    } else if (cond.includes('thunder') || cond.includes('storm')) {
      iconName = 'thunderstorms-day-rain'
    } else if (cond.includes('snow')) {
      iconName = 'snow'
    } else if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) {
      iconName = 'mist'
    }
  }

  return `https://cdn.jsdelivr.net/npm/meteocons@1.8.2/production/fill/svg/${iconName}.svg`
}
