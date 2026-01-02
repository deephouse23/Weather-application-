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


import React, { useState, Suspense } from "react"
import Link from 'next/link'
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // (already in main block, just ensuring imports are present)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import PageWrapper from "@/components/page-wrapper"
import { Analytics } from "@vercel/analytics/react"
import WeatherSearch from "@/components/weather-search"
import RandomCityLinks from "@/components/random-city-links"
import { LazyEnvironmentalDisplay, LazyForecast, LazyForecastDetails } from "@/components/lazy-weather-components"
import LazyHourlyForecast from "@/components/lazy-hourly-forecast"
import { ResponsiveContainer, ResponsiveGrid } from "@/components/responsive-container"
import { ErrorBoundary } from "@/components/error-boundary"
import { useLocationContext } from "@/components/location-context"
import { PrecipitationCard } from "@/components/precipitation-card"
import LazyWeatherMap from '@/components/lazy-weather-map'
import { WeatherSkeleton } from '@/components/weather-skeleton'
import { useWeatherController } from "@/hooks/useWeatherController"
import { TronGridBackground } from "@/components/ui/tron-grid-background"

// Note: UV Index data is now only available in One Call API 3.0 (paid subscription required)
// The main weather API handles UV index estimation for free accounts

// API keys are now handled by internal API routes

// Using ThemeType from theme-utils
// Force rebuild for debug logs
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

  // Helper function to get moon phase icon
  const getMoonPhaseIcon = (phase: string): string => {
    const phaseLower = phase.toLowerCase();

    if (phaseLower.includes('new')) return '🌑';
    if (phaseLower.includes('waxing crescent')) return '🌒';
    if (phaseLower.includes('first quarter')) return '🌓';
    if (phaseLower.includes('waxing gibbous')) return '🌔';
    if (phaseLower.includes('full')) return '🌕';
    if (phaseLower.includes('waning gibbous')) return '🌖';
    if (phaseLower.includes('last quarter')) return '🌗';
    if (phaseLower.includes('waning crescent')) return '🌘';

    // Fallback for any other phases
    return '🌑';
  };

  // Helper function to format location display
  const formatLocationDisplay = (location: string, country: string): string => {
    // Handle edge cases for long city names
    const maxLength = 30;
    if (location.length > maxLength) {
      return `${location.substring(0, maxLength - 3)}...`;
    }
    return location;
  };

  return (
    <PageWrapper
      weatherLocation={weather?.location}
      weatherTemperature={weather?.temperature}
      weatherUnit={weather?.unit}
    >
      <TronGridBackground theme={theme} />
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
                <div className="p-2 sm:p-3 border-2 shadow-lg bg-weather-bg-elev border-weather-primary shadow-weather-primary/20">
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
              <Loader2 className="h-8 w-8 animate-spin text-weather-primary" />
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
              <div className="space-y-4 sm:space-y-6">
                {/* Location Title */}
                <div className="text-center mb-4">
                  <h1 className={cn("text-2xl sm:text-3xl font-extrabold tracking-wider", themeClasses.headerText, themeClasses.glow)} style={{
                    fontSize: "clamp(20px, 4vw, 32px)"
                  }}>
                    {weather.location} WEATHER
                  </h1>
                </div>

                {/* Current Weather using Cards with staggered animations */}
                <ResponsiveGrid cols={{ sm: 1, md: 3 }} className="gap-4">
                  <Card className="weather-card-enter border-2 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '0ms' }}>
                    <CardHeader className="pb-2 text-center">
                      <CardTitle className={cn("text-xl mb-0", themeClasses.headerText)}>Temperature</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-2">
                      <p data-testid="temperature-value" className={cn("text-3xl font-bold", themeClasses.text)}>
                        {weather?.temperature || 'N/A'}{weather?.unit || '°F'}
                      </p>
                      <p className={cn("mt-2 text-sm", themeClasses.secondaryText)}>
                        Humidity: {weather?.humidity ?? 'N/A'}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="weather-card-enter border-2 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '50ms' }}>
                    <CardHeader className="pb-2 text-center">
                      <CardTitle className={cn("text-xl mb-0", themeClasses.headerText)}>Conditions</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-2">
                      <p className={cn("text-lg", themeClasses.text)}>{weather?.condition || 'Unknown'}</p>
                      <p className={cn("text-sm", themeClasses.secondaryText)}>{weather?.description || 'No description available'}</p>
                      {weather?.hourlyForecast && weather.hourlyForecast.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowHourlyForecast(!showHourlyForecast)}
                          className={cn("mt-3 font-mono text-xs font-bold transition-all hover:scale-105", themeClasses.borderColor, themeClasses.text)}
                        >
                          {showHourlyForecast ? '║ Hide Hourly' : '║ Hourly'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="weather-card-enter border-2 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '100ms' }}>
                    <CardHeader className="pb-2 text-center">
                      <CardTitle className={cn("text-xl mb-0", themeClasses.headerText)}>Wind</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-2">
                      <p className={cn("text-lg", themeClasses.text)}>
                        {weather?.wind?.direction ? `${weather.wind.direction} ` : ''}
                        {weather?.wind?.speed || 'N/A'} mph
                        {weather?.wind?.gust ? ` (gusts ${weather.wind.gust} mph)` : ''}
                      </p>
                    </CardContent>
                  </Card>
                </ResponsiveGrid>

                {/* Sun Times, UV Index, Moon Phase with staggered animations */}
                <ResponsiveGrid cols={{ sm: 1, md: 3 }} className="gap-4">
                  {/* Sun Times Box */}
                  <Card className="weather-card-enter border-2 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '150ms' }}>
                    <CardHeader className="pb-2 text-center">
                      <CardTitle className={cn("text-xl mb-0", themeClasses.headerText)}>Sun Times</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-yellow-400">☀️</span>
                          <p className={themeClasses.text}>Sunrise: {weather?.sunrise || 'N/A'}</p>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-orange-400">🌅</span>
                          <p className={themeClasses.text}>Sunset: {weather?.sunset || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* UV Index Box */}
                  <Card className="weather-card-enter border-2 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '200ms' }}>
                    <CardHeader className="pb-2 text-center">
                      <CardTitle className={cn("text-xl mb-0", themeClasses.headerText)}>UV Index</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-2">
                      <p className={cn("text-lg font-bold", themeClasses.text)}>{weather?.uvIndex || 'N/A'}</p>
                    </CardContent>
                  </Card>

                  {/* Moon Phase Box */}
                  <Card className="weather-card-enter border-2 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '250ms' }}>
                    <CardHeader className="pb-2 text-center">
                      <CardTitle className={cn("text-xl mb-0", themeClasses.headerText)}>Moon Phase</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-2xl">{getMoonPhaseIcon(weather?.moonPhase?.phase || 'new')}</span>
                          <p className={cn("text-lg font-semibold", themeClasses.text)}>{weather?.moonPhase?.phase || 'Unknown'}</p>
                        </div>
                        <p className={cn("text-sm font-medium", themeClasses.secondaryText)}>
                          {weather?.moonPhase?.illumination || 0}% illuminated
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </ResponsiveGrid>

                {/* 24-Hour Precipitation Card - Premium feature for authenticated users */}
                <PrecipitationCard
                  latitude={weather?.coordinates?.lat}
                  longitude={weather?.coordinates?.lon}
                />

                {/* AQI and Pollen Count - Using Lazy Loaded Shared Components */}
                <LazyEnvironmentalDisplay weather={weather} theme={theme || 'dark'} />

                {/* Expandable Hourly Forecast */}
                {showHourlyForecast && weather?.hourlyForecast && weather.hourlyForecast.length > 0 && (
                  <LazyHourlyForecast
                    hourly={weather.hourlyForecast}
                    theme={theme}
                    tempUnit={weather.unit || '°F'}
                  />
                )}

                {/* Day click handler */}
                {(() => {
                  const handleDayClick = (index: number) => {
                    setSelectedDay(selectedDay === index ? null : index);
                  };

                  return (
                    <>
                      {/* 5-Day Forecast */}
                      {weather?.forecast && weather.forecast.length > 0 ? (
                        <LazyForecast
                          forecast={weather.forecast.map((day, index) => ({
                            ...day,
                            country: weather?.country || 'US'
                          }))}
                          theme={theme || 'dark'}
                          onDayClick={handleDayClick}
                          selectedDay={selectedDay}
                        />
                      ) : weather ? (
                        <div className="bg-gray-800 p-4 rounded-lg border-2 border-blue-500 text-center">
                          <p className="text-white font-mono">
                            No forecast data available
                          </p>
                        </div>
                      ) : null}

                      {/* Expandable Details Section */}
                      <LazyForecastDetails
                        forecast={(weather?.forecast || []).map((day, index) => ({
                          ...day,
                          country: weather?.country || 'US'
                        }))}
                        theme={theme || 'dark'}
                        selectedDay={selectedDay}
                        currentWeatherData={{
                          humidity: weather?.humidity || 0,
                          wind: weather?.wind || { speed: 0, direction: '', gust: null },
                          pressure: weather?.pressure || '1013',
                          uvIndex: weather?.uvIndex || 0,
                          sunrise: weather?.sunrise || 'N/A',
                          sunset: weather?.sunset || 'N/A'
                        }}
                      />
                    </>
                  );
                })()}

                {/* Weather Radar - Moved Below Forecast */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={cn("text-xl font-semibold text-center flex-1", themeClasses.headerText, themeClasses.glow)}>
                      Weather Radar
                    </h2>
                    <Link
                      href="/radar"
                      className={cn("px-3 py-1.5 border-2 rounded-md font-mono text-xs font-bold transition-colors hover:scale-105", themeClasses.borderColor, themeClasses.text, themeClasses.hoverBg)}
                    >
                      VIEW FULL RADAR →
                    </Link>
                  </div>
                  {/* Container with overflow-visible to allow controls to render properly */}
                  <div className="h-[450px] rounded-lg overflow-visible">
                    <LazyWeatherMap
                      latitude={weather?.coordinates?.lat}
                      longitude={weather?.coordinates?.lon}
                      locationName={weather?.location}
                      theme={theme || 'dark'}
                    />
                  </div>
                </div>
              </div>
            </ErrorBoundary>
          )}

          {/* SEO City Links Section with Random Display */}
          <RandomCityLinks theme={theme || 'dark'} />
        </ResponsiveContainer>
      </div>
      <Analytics />
    </PageWrapper>
  )
}

export default WeatherApp
