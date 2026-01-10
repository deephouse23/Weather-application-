'use client'

import { useState, useEffect } from 'react'
import { X, Thermometer, Wind, Droplets, Eye, Gauge, Sun, Cloud, CloudRain } from 'lucide-react'
import { SavedLocation } from '@/lib/supabase/types'
import { WeatherData } from '@/lib/types'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { calculateMoonPhase, getCompassDirection } from '@/lib/weather'

interface DetailedWeatherModalProps {
  location: SavedLocation
  isOpen: boolean
  onClose: () => void
}

export default function DetailedWeatherModal({ location, isOpen, onClose }: DetailedWeatherModalProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'modal')

  const fetchFullWeather = async () => {
    if (!location || !isOpen) return
    
    setLoading(true)
    setError(null)
    
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
      
      // Construct weather data
      const data: WeatherData = {
        location: location.location_name || `${location.city}, ${location.state || location.country}`,
        country: location.country,
        temperature: Math.round(currentData.main.temp),
        unit: '°F',
        condition: currentData.weather[0].main,
        description: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        wind: {
          speed: Math.round(currentData.wind.speed),
          direction: currentData.wind.deg ? getCompassDirection(currentData.wind.deg) : undefined,
          gust: currentData.wind.gust
        },
        pressure: `${currentData.main.pressure} hPa`,
        sunrise: new Date(currentData.sys.sunrise * 1000).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }),
        sunset: new Date(currentData.sys.sunset * 1000).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }),
        coordinates: {
          lat: location.latitude,
          lon: location.longitude
        },
        forecast: processedForecast,
        moonPhase: calculateMoonPhase(),
        uvIndex,
        aqi,
        aqiCategory,
        pollen: {
          tree: { level: 'No Data' },
          grass: { level: 'No Data' }, 
          weed: { level: 'No Data' }
        }
      }
      
      setWeatherData(data)
    } catch (err) {
      console.error('Error fetching detailed weather:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchFullWeather()
    }
  }, [isOpen, location.id])

  if (!isOpen) return null

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase()
    if (lower.includes('rain') || lower.includes('shower')) return <CloudRain className="w-8 h-8" />
    if (lower.includes('cloud')) return <Cloud className="w-8 h-8" />
    if (lower.includes('clear') || lower.includes('sun')) return <Sun className="w-8 h-8" />
    return <Cloud className="w-8 h-8" />
  }

  const formatTime = (timeString: string) => {
    try {
      // Handle different time formats
      if (timeString.includes(':')) {
        // Already formatted time (e.g., "6:30 AM")
        return timeString
      }
      // Unix timestamp
      const timestamp = parseInt(timeString)
      return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return timeString
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 border-4 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold uppercase tracking-wider font-mono ${themeClasses.text}`}>
              {location.custom_name || location.location_name}
            </h2>
            <p className={`text-sm font-mono ${themeClasses.mutedText}`}>
              {location.city}, {location.state || location.country}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 border-2 transition-all duration-200 hover:scale-105 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mb-4 ${themeClasses.borderColor}`}></div>
              <p className={`font-mono ${themeClasses.text}`}>Loading weather data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <p className="text-red-500 font-mono mb-4">{error}</p>
              <button
                onClick={fetchFullWeather}
                className={`px-4 py-2 border-2 font-mono uppercase tracking-wider ${themeClasses.accentBg} ${themeClasses.borderColor} text-black`}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Weather Data */}
        {weatherData && !loading && (
          <div className="space-y-6">
            {/* Current Conditions */}
            <div className={`p-4 border-2 ${themeClasses.background} ${themeClasses.borderColor}`}>
              <h3 className={`text-lg font-bold font-mono uppercase mb-4 ${themeClasses.text}`}>
                Current Conditions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Temperature & Condition */}
                <div className="flex items-center space-x-4">
                  <div className={themeClasses.text}>
                    {getWeatherIcon(weatherData.condition)}
                  </div>
                  <div>
                    <div className={`text-4xl font-bold font-mono ${themeClasses.text}`}>
                      {weatherData.temperature}{weatherData.unit}
                    </div>
                    <div className={`text-sm font-mono ${themeClasses.mutedText}`}>
                      {weatherData.condition}
                    </div>
                    <div className={`text-sm font-mono ${themeClasses.mutedText}`}>
                      {weatherData.description}
                    </div>
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 border ${themeClasses.borderColor}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <Droplets className={`w-4 h-4 ${themeClasses.text}`} />
                      <span className={`text-xs font-mono uppercase ${themeClasses.mutedText}`}>Humidity</span>
                    </div>
                    <div className={`text-lg font-bold font-mono ${themeClasses.text}`}>
                      {weatherData.humidity}%
                    </div>
                  </div>

                  <div className={`p-3 border ${themeClasses.borderColor}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <Wind className={`w-4 h-4 ${themeClasses.text}`} />
                      <span className={`text-xs font-mono uppercase ${themeClasses.mutedText}`}>Wind</span>
                    </div>
                    <div className={`text-lg font-bold font-mono ${themeClasses.text}`}>
                      {weatherData.wind.speed} mph
                    </div>
                  </div>

                  <div className={`p-3 border ${themeClasses.borderColor}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <Gauge className={`w-4 h-4 ${themeClasses.text}`} />
                      <span className={`text-xs font-mono uppercase ${themeClasses.mutedText}`}>Pressure</span>
                    </div>
                    <div className={`text-lg font-bold font-mono ${themeClasses.text}`}>
                      {weatherData.pressure}
                    </div>
                  </div>

                  <div className={`p-3 border ${themeClasses.borderColor}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <Eye className={`w-4 h-4 ${themeClasses.text}`} />
                      <span className={`text-xs font-mono uppercase ${themeClasses.mutedText}`}>Visibility</span>
                    </div>
                    <div className={`text-lg font-bold font-mono ${themeClasses.text}`}>
                      10 km
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* UV Index & Air Quality */}
            {(weatherData.uvIndex !== undefined || weatherData.aqi) && (
              <div className={`p-4 border-2 ${themeClasses.background} ${themeClasses.borderColor}`}>
                <h3 className={`text-lg font-bold font-mono uppercase mb-4 ${themeClasses.text}`}>
                  Environmental Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weatherData.uvIndex !== undefined && (
                    <div className={`p-3 border ${themeClasses.borderColor}`}>
                      <div className={`text-sm font-mono uppercase mb-2 ${themeClasses.mutedText}`}>UV Index</div>
                      <div className={`text-2xl font-bold font-mono ${themeClasses.text}`}>
                        {weatherData.uvIndex}
                      </div>
                    </div>
                  )}
                  {weatherData.aqi && (
                    <div className={`p-3 border ${themeClasses.borderColor}`}>
                      <div className={`text-sm font-mono uppercase mb-2 ${themeClasses.mutedText}`}>Air Quality</div>
                      <div className={`text-2xl font-bold font-mono ${themeClasses.text}`}>
                        {weatherData.aqi}
                      </div>
                      <div className={`text-xs font-mono ${themeClasses.mutedText}`}>
                        {weatherData.aqiCategory || 'Air Quality Index'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5-Day Forecast */}
            {weatherData.forecast && weatherData.forecast.length > 0 && (
              <div className={`p-4 border-2 ${themeClasses.background} ${themeClasses.borderColor}`}>
                <h3 className={`text-lg font-bold font-mono uppercase mb-4 ${themeClasses.text}`}>
                  5-Day Forecast
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {weatherData.forecast.slice(0, 5).map((day, index) => (
                    <div key={index} className={`p-3 border text-center ${themeClasses.borderColor}`}>
                      <div className={`text-sm font-mono uppercase mb-2 ${themeClasses.mutedText}`}>
                        {day.day}
                      </div>
                      <div className={`text-sm font-mono mb-2 ${themeClasses.text}`}>
                        {day.condition}
                      </div>
                      <div className={`font-bold font-mono ${themeClasses.text}`}>
                        <div>{day.highTemp}{weatherData.unit}</div>
                        <div className={themeClasses.mutedText}>{day.lowTemp}{weatherData.unit}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sun & Moon */}
            {weatherData.sunrise && weatherData.sunset && (
              <div className={`p-4 border-2 ${themeClasses.background} ${themeClasses.borderColor}`}>
                <h3 className={`text-lg font-bold font-mono uppercase mb-4 ${themeClasses.text}`}>
                  Sun & Moon
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-sm font-mono uppercase mb-2 ${themeClasses.mutedText}`}>Sunrise</div>
                    <div className={`text-lg font-bold font-mono ${themeClasses.text}`}>
                      {formatTime(weatherData.sunrise)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-mono uppercase mb-2 ${themeClasses.mutedText}`}>Sunset</div>
                    <div className={`text-lg font-bold font-mono ${themeClasses.text}`}>
                      {formatTime(weatherData.sunset)}
                    </div>
                  </div>
                  {weatherData.moonPhase && (
                    <>
                      <div className="text-center">
                        <div className={`text-sm font-mono uppercase mb-2 ${themeClasses.mutedText}`}>Moon Phase</div>
                        <div className={`text-lg font-bold font-mono ${themeClasses.text}`}>
                          {weatherData.moonPhase.phase}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-mono uppercase mb-2 ${themeClasses.mutedText}`}>Illumination</div>
                        <div className={`text-lg font-bold font-mono ${themeClasses.text}`}>
                          {Math.round(weatherData.moonPhase.illumination * 100)}%
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}