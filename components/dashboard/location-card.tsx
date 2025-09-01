'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Star, Trash2, RefreshCw, Thermometer, Droplets, Wind } from 'lucide-react'
import { SavedLocation } from '@/lib/supabase/types'
import { toggleLocationFavorite, deleteSavedLocation } from '@/lib/supabase/database'
import { getDashboardWeather, getWeatherIcon, getTemperatureColor } from '@/lib/dashboard-weather'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'

interface LocationCardProps {
  location: SavedLocation
  onUpdate: () => void
}

interface WeatherData {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  icon: string
  feelsLike: number
  pressure: number
  visibility: number
}

export default function LocationCard({ location, onUpdate }: LocationCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<'favorite' | 'delete' | null>(null)
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'dashboard')

  const fetchWeather = async () => {
    setLoading(true)
    try {
      const weatherData = await getDashboardWeather(location.latitude, location.longitude)
      setWeather(weatherData)
    } catch (error) {
      console.error('Error fetching weather for location:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
  }, [location.id])

  const handleToggleFavorite = async () => {
    setActionLoading('favorite')
    try {
      await toggleLocationFavorite(location.id, !location.is_favorite)
      onUpdate()
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Remove ${location.custom_name || location.location_name} from saved locations?`)) {
      return
    }

    setActionLoading('delete')
    try {
      await deleteSavedLocation(location.id)
      onUpdate()
    } catch (error) {
      console.error('Error deleting location:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const citySlug = `${location.city.toLowerCase().replace(/\s+/g, '-')}-${location.state?.toLowerCase().replace(/\s+/g, '-') || location.country.toLowerCase()}`

  return (
    <div className={`p-4 border-2 transition-all duration-200 hover:scale-[1.02] ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
      {/* Location Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link
            href={`/weather/${citySlug}`}
            className={`block hover:underline ${themeClasses.text}`}
          >
            <h3 className="font-mono font-bold text-lg uppercase tracking-wider">
              {location.custom_name || location.location_name}
            </h3>
            <p className={`text-sm font-mono ${themeClasses.mutedText}`}>
              {location.city}, {location.state || location.country}
            </p>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleFavorite}
            disabled={actionLoading === 'favorite'}
            className={`p-2 border-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
              location.is_favorite 
                ? `${themeClasses.accentBg} ${themeClasses.borderColor} text-black`
                : `${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`
            }`}
          >
            <Star className={`w-4 h-4 ${location.is_favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={fetchWeather}
            disabled={loading}
            className={`p-2 border-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleDelete}
            disabled={actionLoading === 'delete'}
            className={`p-2 border-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 border-red-500 text-red-500 hover:bg-red-500 hover:text-white`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weather Data */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${themeClasses.borderColor}`}></div>
        </div>
      ) : weather ? (
        <div className={`p-4 border-2 ${themeClasses.background} ${themeClasses.borderColor}`}>
          {/* Current Weather */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">
                {getWeatherIcon(weather.icon)}
              </div>
              <div>
                <p className={`text-3xl font-bold font-mono ${getTemperatureColor(weather.temperature)}`}>
                  {weather.temperature}°F
                </p>
                <p className={`text-sm font-mono capitalize ${themeClasses.mutedText}`}>
                  {weather.description}
                </p>
                <p className={`text-xs font-mono ${themeClasses.mutedText}`}>
                  Feels like {weather.feelsLike}°F
                </p>
              </div>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className={`p-3 border ${themeClasses.borderColor}`}>
              <Droplets className={`w-4 h-4 mx-auto mb-1 ${themeClasses.mutedText}`} />
              <p className={`text-sm font-mono font-bold ${themeClasses.text}`}>{weather.humidity}%</p>
              <p className={`text-xs font-mono ${themeClasses.mutedText}`}>Humidity</p>
            </div>
            
            <div className={`p-3 border ${themeClasses.borderColor}`}>
              <Wind className={`w-4 h-4 mx-auto mb-1 ${themeClasses.mutedText}`} />
              <p className={`text-sm font-mono font-bold ${themeClasses.text}`}>{Math.round(weather.windSpeed)} mph</p>
              <p className={`text-xs font-mono ${themeClasses.mutedText}`}>Wind Speed</p>
            </div>
            
            <div className={`p-3 border ${themeClasses.borderColor}`}>
              <Thermometer className={`w-4 h-4 mx-auto mb-1 ${themeClasses.mutedText}`} />
              <p className={`text-sm font-mono font-bold ${themeClasses.text}`}>{weather.pressure} hPa</p>
              <p className={`text-xs font-mono ${themeClasses.mutedText}`}>Pressure</p>
            </div>
            
            <div className={`p-3 border ${themeClasses.borderColor}`}>
              <MapPin className={`w-4 h-4 mx-auto mb-1 ${themeClasses.mutedText}`} />
              <p className={`text-sm font-mono font-bold ${themeClasses.text}`}>{weather.visibility} km</p>
              <p className={`text-xs font-mono ${themeClasses.mutedText}`}>Visibility</p>
            </div>
          </div>
        </div>
      ) : (
        <div className={`p-4 border-2 text-center ${themeClasses.borderColor}`}>
          <p className={`text-sm font-mono ${themeClasses.mutedText}`}>
            Weather data unavailable
          </p>
          <button
            onClick={fetchWeather}
            className={`mt-2 px-3 py-1 border text-xs font-mono uppercase ${themeClasses.borderColor} ${themeClasses.text} hover:${themeClasses.hoverBg}`}
          >
            Retry
          </button>
        </div>
      )}

      {/* Notes */}
      {location.notes && (
        <div className="mt-3">
          <p className={`text-xs font-mono ${themeClasses.mutedText}`}>
            <strong>Notes:</strong> {location.notes}
          </p>
        </div>
      )}
    </div>
  )
}