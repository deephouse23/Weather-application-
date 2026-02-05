"use client"

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


import React, { memo } from "react"
import { LoadingSpinner } from "@/components/ui/loading-state"
import { useTheme } from '@/components/theme-provider'
import { type ThemeType } from '@/lib/theme-utils'
import PageWrapper from "@/components/page-wrapper"
import WeatherSearch from "@/components/weather-search"
import dynamic from 'next/dynamic'

// PERFORMANCE: Lazy load below-the-fold and conditional components
const RandomCityLinks = dynamic(() => import('@/components/random-city-links'), {
  ssr: false,
  loading: () => <div className="mt-16 pt-8 h-48 animate-pulse bg-gray-800/30 rounded-lg" />
})

// PERFORMANCE: WeatherDisplay only shown when weather data exists
const WeatherDisplay = dynamic(() => import('@/components/weather-display').then(mod => ({ default: mod.WeatherDisplay })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800/30 rounded-lg h-96" />
})

import { ResponsiveContainer } from "@/components/responsive-container"
import { ErrorBoundary } from "@/components/error-boundary"
import { WeatherSkeleton } from '@/components/weather-skeleton'
import { useWeatherController } from "@/hooks/useWeatherController"

// Note: UV Index data is now only available in One Call API 3.0 (paid subscription required)
// The main weather API handles UV index estimation for free accounts

// API keys are now handled by internal API routes

function WeatherApp() {
  const { theme } = useTheme()

  // Use the new controller hook
  const {
    weather,
    loading,
    error,
    remainingSearches,
    handleSearch,
    handleLocationSearch,
    isAutoDetecting
  } = useWeatherController()

  const [selectedDay, setSelectedDay] = React.useState<number | null>(null)
  const [precipitation, setPrecipitation] = React.useState<{rain24h: number; snow24h: number} | null>(null)

  // Fetch 24h precipitation data when weather loads
  React.useEffect(() => {
    if (weather?.coordinates) {
      // Clear stale data immediately on city transition
      setPrecipitation(null)
      fetch(`/api/weather/precipitation-history?lat=${weather.coordinates.lat}&lon=${weather.coordinates.lon}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => data?.dataAvailable ? setPrecipitation({rain24h: data.rain24h, snow24h: data.snow24h}) : setPrecipitation(null))
        .catch(() => setPrecipitation(null))
    }
  }, [weather?.coordinates?.lat, weather?.coordinates?.lon])

  const handleSearchWrapper = (locationInput: string) => {
    handleSearch(locationInput)
  }

  return (
    <PageWrapper
      weatherLocation={weather?.location}
      weatherTemperature={weather?.temperature}
      weatherUnit={weather?.unit}
    >
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-weather-bg">
        <ResponsiveContainer maxWidth="xl" padding="md">
          <ErrorBoundary componentName="Weather Search">
            <WeatherSearch
              onSearch={handleSearchWrapper}
              onLocationSearch={handleLocationSearch}
              isLoading={loading || isAutoDetecting}
              error={error}
              rateLimitError=""
              isDisabled={remainingSearches <= 0}
              hideLocationButton={true}
              weatherContext={weather ? {
                location: weather.location,
                temperature: weather.temperature,
                condition: weather.condition,
                humidity: weather.humidity,
                wind: weather.wind?.speed !== undefined ? `${weather.wind.speed} mph ${weather.wind.direction || ''}`.trim() : undefined
              } : undefined}
            />
          </ErrorBoundary>


          {/* Welcome Message */}
          {!weather && !loading && !error && (
            <div className="text-center mt-8 mb-8 px-2 sm:px-0">
              <div className="w-full max-w-xl mx-auto">
                <div className="p-2 sm:p-3 border-0 shadow-lg bg-weather-bg-elev border-weather-primary shadow-weather-primary/20">
                  <p className="text-sm font-bold uppercase tracking-wider text-white" style={{
                    fontSize: "clamp(10px, 2.4vw, 14px)"
                  }}>
                    ══ PRESS START TO INITIALIZE WEATHER DATA ══
                  </p>
                </div>
              </div>
            </div>
          )}

          {(loading || isAutoDetecting) && !weather && (
            <div className="mt-8">
              <WeatherSkeleton theme={theme as ThemeType} />
            </div>
          )}

          {(loading || isAutoDetecting) && weather && (
            <div className="flex justify-center items-center mt-4">
              <LoadingSpinner size="md" label="Updating weather data" className="text-weather-primary" />
              <span className="ml-2 text-weather-text">
                Updating weather data...
              </span>
            </div>
          )}

          {error && (
            <div className="max-w-2xl mx-auto mt-4 px-2">
              <div data-testid="global-error">
                <div role="alert" className="relative w-full rounded-lg border border-red-500/50 p-4 text-red-500">
                  <div className="mb-1 font-medium leading-none tracking-tight">Error</div>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            </div>
          )}

          {weather && !loading && !error && (
            <ErrorBoundary componentName="Weather Display">
              <WeatherDisplay
                weather={weather}
                theme={theme || 'nord'}
                selectedDay={selectedDay}
                onDayClick={(index) => setSelectedDay(selectedDay === index ? null : index)}
                precipitation={precipitation}
                showRadar={true}
              />
            </ErrorBoundary>
          )}

          {/* SEO City Links Section with Random Display */}
          <RandomCityLinks theme={theme || 'dark'} />
        </ResponsiveContainer>
      </div>
    </PageWrapper>
  )
}

// PERFORMANCE: Memoize the component to prevent unnecessary re-renders
const MemoizedWeatherApp = memo(WeatherApp)
export default MemoizedWeatherApp
export { WeatherApp }