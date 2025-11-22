"use client"

/**
 * 16-Bit Weather Platform - BETA v0.3.31
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


import React, { useState, Suspense } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import PageWrapper from "@/components/page-wrapper"
import { Analytics } from "@vercel/analytics/react"
import WeatherSearch from "@/components/weather-search"
import RandomCityLinks from "@/components/random-city-links"
import { LazyEnvironmentalDisplay, LazyForecast, LazyForecastDetails } from "@/components/lazy-weather-components"
import LazyHourlyForecast from "@/components/lazy-hourly-forecast"
import { ResponsiveGrid } from "@/components/responsive-container"
import { useLocationContext } from "@/components/location-context"
import LazyWeatherMap from '@/components/lazy-weather-map'
import { WeatherSkeleton } from '@/components/weather-skeleton'
import { useWeatherController } from "@/hooks/useWeatherController"
import { TronGridBackground } from "@/components/ui/tron-grid-background"

// Note: UV Index data is now only available in One Call API 3.0 (paid subscription required)
// The main weather API handles UV index estimation for free accounts

// API keys are now handled by internal API routes

// Using ThemeType from theme-utils

function WeatherApp() {
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'weather')
  const {
    locationInput,
    currentLocation,
  } = useLocationContext()

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

  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showHourlyForecast, setShowHourlyForecast] = useState(false)

  const handleSearchWrapper = (locationInput: string) => {
    handleSearch(locationInput)
  }

  // Helper function to get weather icon
  const getWeatherIcon = (condition: string): string => {
    const conditionLower = condition.toLowerCase();

    if (conditionLower.includes('sun') || conditionLower.includes('clear')) return '☀️';
    if (conditionLower.includes('partly cloudy')) return '⛅';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return '🌧️';
    if (conditionLower.includes('storm') || conditionLower.includes('thunder')) return '⛈️';
    if (conditionLower.includes('snow') || conditionLower.includes('flurry')) return '❄️';
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return '🌫️';

    return '🌈';
  };

  return (
    <PageWrapper>
      <TronGridBackground theme={theme} />

      <div className="min-h-screen p-4 md:p-8 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="text-center md:text-left">
              <h1 className={cn("text-3xl md:text-4xl font-bold mb-2 pixel-font tracking-tight", themeClasses.text)}>
                16-BIT WEATHER
              </h1>
              <p className={cn("text-sm md:text-base opacity-80 font-mono", themeClasses.mutedText)}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <div className={cn("text-xs font-mono", themeClasses.mutedText)}>
                  REMAINING SEARCHES
                </div>
                <div className={cn("text-xl font-bold pixel-font",
                  remainingSearches < 3 ? "text-red-500" : themeClasses.accentText
                )}>
                  {remainingSearches} / 10
                </div>
              </div>
            </div>
          </header>

          {/* Search Section */}
          <section className="w-full max-w-2xl mx-auto mb-8">
            <WeatherSearch
              onSearch={handleSearchWrapper}
              onLocationSearch={handleLocationSearch}
              isLoading={loading}
              isAutoDetecting={isAutoDetecting}
            />

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border-2 border-red-500 rounded-lg text-red-500 text-center font-bold animate-in fade-in slide-in-from-top-2">
                <p>⚠️ {error}</p>
              </div>
            )}
          </section>

          {/* Main Content Area */}
          <div className="space-y-6">
            {loading ? (
              <WeatherSkeleton />
            ) : weather ? (
              <>
                {/* Current Weather & Map Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Weather Display */}
                  <div className="lg:col-span-2 space-y-6">
                    <Suspense fallback={<WeatherSkeleton />}>
                      <LazyForecast
                        forecast={weather.forecast}
                        theme={theme as ThemeType}
                        onDayClick={(index) => setSelectedDay(index)}
                        selectedDay={selectedDay}
                      />
                    </Suspense>

                    <Suspense fallback={<div className="h-48 bg-gray-800/50 rounded-lg animate-pulse" />}>
                      <LazyEnvironmentalDisplay weather={weather} theme={theme as ThemeType} />
                    </Suspense>
                  </div>

                  {/* Map & Details Column */}
                  <div className="space-y-6">
                    <div className={cn("rounded-lg overflow-hidden border-2 shadow-lg", themeClasses.border, themeClasses.cardBg)}>
                      <Suspense fallback={<div className="h-[300px] bg-gray-900 flex items-center justify-center text-gray-500">Loading Map...</div>}>
                        <LazyWeatherMap
                          latitude={weather.coordinates?.lat}
                          longitude={weather.coordinates?.lon}
                          locationName={currentLocation || locationInput}
                          theme={theme as ThemeType}
                        />
                      </Suspense>
                    </div>

                    <Suspense fallback={<div className="h-64 bg-gray-800/50 rounded-lg animate-pulse" />}>
                      <LazyForecastDetails
                        forecast={weather.forecast}
                        selectedDay={selectedDay}
                        theme={theme as ThemeType}
                        currentWeatherData={{
                          humidity: weather.humidity,
                          wind: weather.wind,
                          pressure: weather.pressure,
                          uvIndex: weather.uvIndex,
                          sunrise: weather.sunrise,
                          sunset: weather.sunset
                        }}
                      />
                    </Suspense>
                  </div>
                </div>

                {/* Hourly Forecast Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={cn("text-xl font-bold pixel-font", themeClasses.text)}>
                      HOURLY FORECAST
                    </h2>
                    <button
                      onClick={() => setShowHourlyForecast(!showHourlyForecast)}
                      className={cn(
                        "px-3 py-1 text-xs font-bold rounded border-2 transition-all",
                        showHourlyForecast
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent hover:bg-primary/10 border-primary/50 text-primary"
                      )}
                    >
                      {showHourlyForecast ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>

                  {showHourlyForecast && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                      <Suspense fallback={<div className="h-48 bg-gray-800/50 rounded-lg animate-pulse" />}>
                        <LazyHourlyForecast
                          hourly={weather.hourlyForecast || []}
                          theme={theme as ThemeType}
                        />
                      </Suspense>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Empty State / Initial View */
              <div className="mt-12 text-center space-y-8 animate-in fade-in duration-700">
                <div className="max-w-2xl mx-auto p-8 rounded-xl border-4 border-dashed border-gray-700 bg-gray-900/50">
                  <div className="text-6xl mb-6 animate-bounce">🌍</div>
                  <h2 className={cn("text-2xl font-bold mb-4 pixel-font", themeClasses.text)}>
                    READY TO EXPLORE?
                  </h2>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Enter a city name, ZIP code, or use your location to get started with the most retro weather experience on the web.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-lg mx-auto">
                    <div className="p-4 rounded bg-gray-800/50 border border-gray-700">
                      <div className="text-xl mb-2">🎮</div>
                      <div className="font-bold text-sm">Retro Games</div>
                      <div className="text-xs text-gray-500">Play while it rains</div>
                    </div>
                    <div className="p-4 rounded bg-gray-800/50 border border-gray-700">
                      <div className="text-xl mb-2">📡</div>
                      <div className="font-bold text-sm">Live Radar</div>
                      <div className="text-xs text-gray-500">NEXRAD integration</div>
                    </div>
                    <div className="p-4 rounded bg-gray-800/50 border border-gray-700">
                      <div className="text-xl mb-2">🏆</div>
                      <div className="font-bold text-sm">Leaderboards</div>
                      <div className="text-xs text-gray-500">Compete globally</div>
                    </div>
                  </div>
                </div>

                <RandomCityLinks />
              </div>
            )}
          </div>
        </div>
      </div>

      <Analytics />
    </PageWrapper>
  )
}

export default WeatherApp
