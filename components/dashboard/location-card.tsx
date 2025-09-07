'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Star, Trash2, RefreshCw, Thermometer, Droplets, Wind, Eye, Sun } from 'lucide-react'
import { SavedLocation } from '@/lib/supabase/types'
import { toggleLocationFavorite, deleteSavedLocation } from '@/lib/supabase/database'
import { getDashboardWeather, getWeatherIcon, getTemperatureColor } from '@/lib/dashboard-weather'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { WeatherData as FullWeatherData } from '@/lib/types'

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
  const [showDetailedWeather, setShowDetailedWeather] = useState(false)
  const [detailedWeatherData, setDetailedWeatherData] = useState<FullWeatherData | null>(null)
  const [detailedLoading, setDetailedLoading] = useState(false)
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

  const fetchDetailedWeather = async () => {
    setDetailedLoading(true)
    
    try {
      // Fetch current weather
      const currentResponse = await fetch(
        `/api/weather/current?lat=${location.latitude}&lon=${location.longitude}&units=imperial`
      )
      if (!currentResponse.ok) throw new Error('Failed to fetch current weather')
      const currentData = await currentResponse.json()
      
      // Fetch forecast
      const forecastResponse = await fetch(
        `/api/weather/forecast?lat=${location.latitude}&lon=${location.longitude}&units=imperial`
      )
      if (!forecastResponse.ok) throw new Error('Failed to fetch forecast')
      const forecastData = await forecastResponse.json()
      
      // Fetch UV index
      let uvIndex = 0
      try {
        const uvResponse = await fetch(
          `/api/weather/uv?lat=${location.latitude}&lon=${location.longitude}`
        )
        if (uvResponse.ok) {
          const uvData = await uvResponse.json()
          uvIndex = uvData.value || 0
        }
      } catch (err) {
        console.warn('UV index fetch failed:', err)
      }
      
      // Fetch air quality
      let aqi = 0
      let aqiCategory = 'No Data'
      try {
        const aqiResponse = await fetch(
          `/api/weather/air-quality?lat=${location.latitude}&lon=${location.longitude}`
        )
        if (aqiResponse.ok) {
          const aqiData = await aqiResponse.json()
          aqi = aqiData.aqi || 0
          aqiCategory = aqiData.category || 'No Data'
        }
      } catch (err) {
        console.warn('Air quality fetch failed:', err)
      }
      
      // Process forecast data
      const processedForecast = forecastData.list?.slice(0, 5).map((item: any, index: number) => {
        const date = new Date()
        date.setDate(date.getDate() + index)
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          highTemp: Math.round(item.main.temp_max),
          lowTemp: Math.round(item.main.temp_min),
          condition: item.weather[0].main,
          description: item.weather[0].description
        }
      }) || []
      
      // Combine all data
      const fullWeatherData: FullWeatherData = {
        current: currentData,
        forecast: processedForecast,
        uvIndex: uvIndex,
        airQuality: {
          aqi: aqi,
          category: aqiCategory,
          pm25: 0,
          pm10: 0,
          o3: 0,
          no2: 0,
          so2: 0,
          co: 0
        },
        alerts: []
      }
      
      setDetailedWeatherData(fullWeatherData)
    } catch (error) {
      console.error('Error fetching detailed weather:', error)
    } finally {
      setDetailedLoading(false)
    }
  }

  const toggleDetailedView = () => {
    if (!showDetailedWeather && !detailedWeatherData) {
      fetchDetailedWeather()
    }
    setShowDetailedWeather(!showDetailedWeather)
  }

  const citySlug = `${location.city.toLowerCase().replace(/\s+/g, '-')}-${location.state?.toLowerCase().replace(/\s+/g, '-') || location.country.toLowerCase()}`

  return (
    <div className={`p-4 border-2 transition-all duration-200 hover:scale-[1.02] ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
      {/* Location Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <button
            onClick={toggleDetailedView}
            className={`block text-left hover:underline transition-all duration-200 hover:scale-[1.02] ${themeClasses.text}`}
          >
            <h3 className="font-mono font-bold text-lg uppercase tracking-wider">
              {location.custom_name || location.location_name}
            </h3>
            <p className={`text-sm font-mono ${themeClasses.mutedText}`}>
              {location.city}, {location.state || location.country}
            </p>
            <p className={`text-xs font-mono ${themeClasses.mutedText} mt-1 opacity-75`}>
              Click for detailed weather
            </p>
          </button>
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

          {/* View Details Button */}
          <div className="mt-3">
            <button
              onClick={toggleDetailedView}
              className={`w-full px-3 py-2 border-2 text-sm font-mono uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] ${themeClasses.accentBg} ${themeClasses.borderColor} text-black`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              {showDetailedWeather ? 'Hide Details' : 'View Full Weather'}
            </button>
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

      {/* Detailed Weather - Inline Expansion */}
      {showDetailedWeather && (
        <div className={`mt-4 p-4 border-2 ${themeClasses.borderColor} ${themeClasses.background} animate-in slide-in-from-top-2 duration-300`}>
          {detailedLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${themeClasses.borderColor}`}></div>
            </div>
          ) : detailedWeatherData ? (
            <div className="space-y-4">
              {/* 5-Day Forecast */}
              <div>
                <h4 className={`font-mono font-bold text-sm uppercase tracking-wider mb-3 ${themeClasses.text}`}>
                  5-Day Forecast
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {detailedWeatherData.forecast.map((day, index) => (
                    <div 
                      key={index}
                      className={`p-3 border ${themeClasses.borderColor} ${themeClasses.background} text-center`}
                    >
                      <p className={`font-mono text-xs font-bold mb-1 ${themeClasses.text}`}>
                        {day.day}
                      </p>
                      <p className={`font-mono text-sm mb-1 ${getTemperatureColor(day.highTemp)}`}>
                        {day.highTemp}°
                      </p>
                      <p className={`font-mono text-xs ${themeClasses.mutedText}`}>
                        {day.lowTemp}°
                      </p>
                      <p className={`font-mono text-xs mt-1 ${themeClasses.mutedText}`}>
                        {day.condition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environmental Data */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 border ${themeClasses.borderColor} text-center`}>
                  <Sun className={`w-5 h-5 mx-auto mb-1 ${themeClasses.mutedText}`} />
                  <p className={`font-mono text-sm font-bold ${themeClasses.text}`}>
                    UV Index: {detailedWeatherData.uvIndex}
                  </p>
                  <p className={`font-mono text-xs ${themeClasses.mutedText}`}>
                    {detailedWeatherData.uvIndex < 3 ? 'Low' : 
                     detailedWeatherData.uvIndex < 6 ? 'Moderate' :
                     detailedWeatherData.uvIndex < 8 ? 'High' : 'Very High'}
                  </p>
                </div>
                
                <div className={`p-3 border ${themeClasses.borderColor} text-center`}>
                  <Wind className={`w-5 h-5 mx-auto mb-1 ${themeClasses.mutedText}`} />
                  <p className={`font-mono text-sm font-bold ${themeClasses.text}`}>
                    AQI: {detailedWeatherData.airQuality.aqi}
                  </p>
                  <p className={`font-mono text-xs ${themeClasses.mutedText}`}>
                    {detailedWeatherData.airQuality.category}
                  </p>
                </div>
              </div>

              {/* Link to Full Weather Page */}
              <Link
                href={`/weather/${citySlug}`}
                className={`block w-full px-3 py-2 border-2 text-center text-sm font-mono uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                View Full Weather Page
              </Link>
            </div>
          ) : (
            <div className={`text-center py-4 ${themeClasses.text}`}>
              <p className="font-mono text-sm">Failed to load detailed weather</p>
              <button
                onClick={fetchDetailedWeather}
                className={`mt-2 px-3 py-1 border text-xs font-mono uppercase ${themeClasses.borderColor} ${themeClasses.text} hover:${themeClasses.hoverBg}`}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}