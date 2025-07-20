"use client"

import React, { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchWeatherData } from "@/lib/weather-api"
import { useTheme } from '@/components/theme-provider'
import { WeatherData } from '@/lib/types'
import Forecast from "@/components/forecast"
import ForecastDetails from "@/components/forecast-details"
import PageWrapper from "@/components/page-wrapper"
import { Analytics } from "@vercel/analytics/react"
import WeatherSearch from "@/components/weather-search"
import { useRouter } from 'next/navigation'

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.REACT_APP_OPENWEATHER_API_KEY;

// City name formatting function
function formatCityName(citySlug: string): string {
  return citySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// City slug to search term conversion
function citySlugToSearchTerm(citySlug: string): string {
  const parts = citySlug.split('-')
  if (parts.length >= 2) {
    const state = parts[parts.length - 1].toUpperCase()
    const city = parts.slice(0, -1).join(' ')
    return `${city}, ${state}`
  }
  return formatCityName(citySlug)
}

export default function CityWeatherPage({ params }: { params: { city: string } }) {
  const { theme } = useTheme()
  const router = useRouter()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const cityName = formatCityName(params.city)
  const searchTerm = citySlugToSearchTerm(params.city)

  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setLoading(true)
        setError("")

        if (!API_KEY) {
          throw new Error('Weather API key is not configured')
        }

        const weatherData = await fetchWeatherData(searchTerm, API_KEY)
        
        if (!weatherData) {
          throw new Error('No weather data received')
        }

        setWeather(weatherData)
      } catch (error: any) {
        console.error('Failed to load weather data:', error)
        setError(error.message || 'Failed to load weather data')
      } finally {
        setLoading(false)
      }
    }

    loadWeatherData()
  }, [params.city, searchTerm])

  const handleSearch = (newLocation: string) => {
    if (newLocation.trim()) {
      // Navigate to home page with search
      router.push(`/?search=${encodeURIComponent(newLocation)}`)
    }
  }

  const handleDayClick = (index: number) => {
    setSelectedDay(selectedDay === index ? null : index)
  }

  const themeClasses = {
    background: theme === "dark" ? "bg-[#0f0f0f]" : theme === "miami" ? "bg-[#0a0025]" : "bg-black",
    cardBg: theme === "dark" ? "bg-[#0f0f0f]" : theme === "miami" ? "bg-[#0a0025]" : "bg-black",
    borderColor: theme === "dark" ? "border-[#00d4ff]" : theme === "miami" ? "border-[#ff1493]" : "border-[#00FFFF]",
    text: theme === "dark" ? "text-[#e0e0e0]" : theme === "miami" ? "text-[#00ffff]" : "text-white",
    headerText: theme === "dark" ? "text-[#00d4ff]" : theme === "miami" ? "text-[#ff1493]" : "text-[#00FFFF]",
    secondaryText: theme === "dark" ? "text-[#e0e0e0]" : theme === "miami" ? "text-[#00ffff]" : "text-[#00FFFF]",
  }

  return (
    <PageWrapper
      weatherLocation={weather?.location}
      weatherTemperature={weather?.temperature}
      weatherUnit={weather?.unit}
    >
      <div className={cn(
        "min-h-screen",
        theme === "dark" && "bg-gradient-to-b from-gray-900 to-black",
        theme === "miami" && "bg-gradient-to-b from-pink-900 to-purple-900",
        theme === "tron" && "bg-gradient-to-b from-black to-blue-900"
      )}>
        <div className="container mx-auto px-4 py-8">
          
          {/* Weather Search Component */}
          <WeatherSearch
            onSearch={handleSearch}
            isLoading={loading}
            error={error}
            rateLimitError=""
            isDisabled={false}
            theme={theme}
            defaultValue={searchTerm}
          />

          {/* City Title */}
          <div className="text-center mb-6">
            <h1 className={`text-3xl font-bold ${themeClasses.headerText}`}>
              {cityName} Weather
            </h1>
          </div>

          {loading && (
            <div className="flex justify-center items-center mt-8">
              <Loader2 className={cn(
                "h-8 w-8 animate-spin",
                theme === "dark" && "text-blue-500",
                theme === "miami" && "text-pink-500",
                theme === "tron" && "text-cyan-500"
              )} />
              <span className="ml-2 text-white">Loading weather data...</span>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center mt-4">
              {error}
            </div>
          )}

          {weather && !loading && !error && (
            <div className="space-y-4 sm:space-y-6">
              {/* Current Weather */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Temperature Box */}
                <div className={`p-4 rounded-lg text-center border-2 shadow-lg ${themeClasses.cardBg} ${themeClasses.borderColor}`}>
                  <h2 className={`text-xl font-semibold mb-2 ${themeClasses.headerText}`}>Temperature</h2>
                  <p className={`text-3xl font-bold ${themeClasses.text}`}>{weather.temperature}{weather.unit}</p>
                </div>

                {/* Conditions Box */}
                <div className={`p-4 rounded-lg text-center border-2 shadow-lg ${themeClasses.cardBg} ${themeClasses.borderColor}`}>
                  <h2 className={`text-xl font-semibold mb-2 ${themeClasses.headerText}`}>Conditions</h2>
                  <p className={`text-lg ${themeClasses.text}`}>{weather.condition}</p>
                  <p className={`text-sm ${themeClasses.secondaryText}`}>{weather.description}</p>
                </div>

                {/* Wind Box */}
                <div className={`p-4 rounded-lg text-center border-2 shadow-lg ${themeClasses.cardBg} ${themeClasses.borderColor}`}>
                  <h2 className={`text-xl font-semibold mb-2 ${themeClasses.headerText}`}>Wind</h2>
                  <p className={`text-lg ${themeClasses.text}`}>
                    {weather.wind.direction ? `${weather.wind.direction} ` : ''}
                    {weather.wind.speed} mph
                    {weather.wind.gust ? ` (gusts ${weather.wind.gust} mph)` : ''}
                  </p>
                </div>
              </div>

              {/* Forecast */}
              <Forecast 
                forecast={weather.forecast.map(day => ({
                  ...day,
                  country: weather.country
                }))} 
                theme={theme}
                onDayClick={handleDayClick}
                selectedDay={selectedDay}
              />

              {/* Forecast Details */}
              <ForecastDetails 
                forecast={weather.forecast.map(day => ({
                  ...day,
                  country: weather.country
                }))} 
                theme={theme}
                selectedDay={selectedDay}
                currentWeatherData={{
                  humidity: weather.humidity,
                  wind: weather.wind,
                  pressure: weather.pressure,
                  uvIndex: weather.uvIndex,
                  sunrise: weather.sunrise,
                  sunset: weather.sunset
                }}
              />
            </div>
          )}
        </div>
      </div>
      <Analytics />
    </PageWrapper>
  )
}