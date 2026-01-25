'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Star, Trash2, RefreshCw, Thermometer, Droplets, Wind, Eye, Sun } from 'lucide-react'
import { SavedLocation } from '@/lib/supabase/types'
import { toggleLocationFavorite, deleteSavedLocation } from '@/lib/supabase/database'
import { getDashboardWeather, getWeatherIcon, getTemperatureColor } from '@/lib/dashboard-weather'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'

interface LocationCardProps {
  location: SavedLocation
  onUpdate: () => void
}

interface BasicWeatherData {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  icon: string
  feelsLike: number
  pressure: number
  visibility: number
}

interface DetailedWeatherData {
  current: BasicWeatherData
  forecast: Array<{
    day: string
    highTemp: number
    lowTemp: number
    condition: string
    description: string
  }>
  uvIndex: number
  airQuality: {
    aqi: number
    category: string
    pm25: number
    pm10: number
    o3: number
    no2: number
    so2: number
    co: number
  }
  alerts: any[]
}

export default function LocationCard({ location, onUpdate }: LocationCardProps) {
  const [weather, setWeather] = useState<BasicWeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<'favorite' | 'delete' | null>(null)
  const [showDetailedWeather, setShowDetailedWeather] = useState(false)
  const [detailedWeatherData, setDetailedWeatherData] = useState<DetailedWeatherData | null>(null)
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
      const fullWeatherData: DetailedWeatherData = {
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
    <Card className={`transition-all duration-200 hover:scale-[1.02] container-primary glow-interactive ${themeClasses.background}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <button
              onClick={toggleDetailedView}
              className={`block text-left hover:underline transition-all duration-200 ${themeClasses.text}`}
            >
              <CardTitle className="font-mono font-bold text-lg uppercase tracking-wider mb-1">
                {location.custom_name || location.location_name}
              </CardTitle>
              <p className={`text-sm font-mono ${themeClasses.mutedText}`}>
                {location.city}, {location.state || location.country}
              </p>
              <p className={`text-xs font-mono ${themeClasses.mutedText} mt-1 opacity-75`}>
                Click for detailed weather
              </p>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleFavorite}
              disabled={actionLoading === 'favorite'}
              className={`h-8 w-8 ${location.is_favorite
                  ? `${themeClasses.accentBg} ${themeClasses.borderColor} text-black border-2`
                  : `${themeClasses.borderColor} ${themeClasses.text} hover:bg-white/10`
                }`}
              aria-label={location.is_favorite ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={location.is_favorite}
            >
              <Star className={`w-4 h-4 ${location.is_favorite ? 'fill-current' : ''}`} aria-hidden="true" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchWeather}
              disabled={loading}
              className={`h-8 w-8 ${themeClasses.borderColor} ${themeClasses.text} hover:bg-white/10`}
              aria-label="Refresh weather data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              disabled={actionLoading === 'delete'}
              className="h-8 w-8 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              aria-label={`Delete ${location.custom_name || location.location_name}`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Weather Data */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${themeClasses.borderColor}`}></div>
          </div>
        ) : weather ? (
          <div className={`p-4 container-nested ${themeClasses.background}`}>
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
              <div className={`p-3 border border-subtle rounded-sm`}>
                <Droplets className={`w-4 h-4 mx-auto mb-1 ${themeClasses.mutedText}`} />
                <p className={`text-sm font-mono font-bold ${themeClasses.text}`}>{weather.humidity}%</p>
                <p className={`text-xs font-mono ${themeClasses.mutedText}`}>Humidity</p>
              </div>

              <div className={`p-3 border border-subtle rounded-sm`}>
                <Wind className={`w-4 h-4 mx-auto mb-1 ${themeClasses.mutedText}`} />
                <p className={`text-sm font-mono font-bold ${themeClasses.text}`}>{Math.round(weather.windSpeed)} mph</p>
                <p className={`text-xs font-mono ${themeClasses.mutedText}`}>Wind Speed</p>
              </div>

              <div className={`p-3 border border-subtle rounded-sm`}>
                <Thermometer className={`w-4 h-4 mx-auto mb-1 ${themeClasses.mutedText}`} />
                <p className={`text-sm font-mono font-bold ${themeClasses.text}`}>{weather.pressure} hPa</p>
                <p className={`text-xs font-mono ${themeClasses.mutedText}`}>Pressure</p>
              </div>

              <div className={`p-3 border border-subtle rounded-sm`}>
                <MapPin className={`w-4 h-4 mx-auto mb-1 ${themeClasses.mutedText}`} />
                <p className={`text-sm font-mono font-bold ${themeClasses.text}`}>{weather.visibility} km</p>
                <p className={`text-xs font-mono ${themeClasses.mutedText}`}>Visibility</p>
              </div>
            </div>

            {/* View Details Button */}
            <div className="mt-4">
              <Button
                onClick={toggleDetailedView}
                className={`w-full font-mono uppercase tracking-wider ${themeClasses.accentBg} text-black hover:opacity-90`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                {showDetailedWeather ? 'Hide Details' : 'View Full Weather'}
              </Button>
            </div>
          </div>
        ) : (
          <div className={`p-4 container-nested text-center`}>
            <p className={`text-sm font-mono ${themeClasses.mutedText}`}>
              Weather data unavailable
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWeather}
              className={`mt-2 font-mono uppercase ${themeClasses.borderColor} ${themeClasses.text} hover:bg-white/10`}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Notes */}
        {location.notes && (
          <div className="mt-4 p-3 border border-dashed border-white/20 rounded-sm">
            <p className={`text-xs font-mono ${themeClasses.mutedText}`}>
              <strong>Notes:</strong> {location.notes}
            </p>
          </div>
        )}

        {/* Detailed Weather - Inline Expansion */}
        {showDetailedWeather && (
          <div className={`mt-4 p-4 container-nested ${themeClasses.background} animate-in slide-in-from-top-2 duration-300`}>
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
                        className={`p-2 border border-subtle ${themeClasses.background} text-center rounded-sm`}
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
                        <p className={`font-mono text-[10px] mt-1 ${themeClasses.mutedText} truncate`}>
                          {day.condition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Environmental Data */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 container-nested text-center">
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

                  <div className="p-3 container-nested text-center">
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
                <Link href={`/weather/${citySlug}`} className="block w-full">
                  <Button variant="outline" className={`w-full font-mono uppercase tracking-wider border-subtle ${themeClasses.text} hover:bg-white/10`}>
                    <MapPin className="w-4 h-4 inline mr-2" />
                    View Full Weather Page
                  </Button>
                </Link>
              </div>
            ) : (
              <div className={`text-center py-4 ${themeClasses.text}`}>
                <p className="font-mono text-sm">Failed to load detailed weather</p>
                <Button variant="ghost" onClick={fetchDetailedWeather} className="mt-2 h-auto py-1 px-3 text-xs">
                  Retry
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}