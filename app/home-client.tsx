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
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/loading-state"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // (already in main block, just ensuring imports are present)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// Button import removed - no longer needed after hourly forecast toggle removal
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import PageWrapper from "@/components/page-wrapper"
import WeatherSearch from "@/components/weather-search"
import { ShareButton } from "@/components/share-weather-modal"
import dynamic from 'next/dynamic'

// PERFORMANCE: Lazy load RandomCityLinks as it's below the fold
const RandomCityLinks = dynamic(() => import('@/components/random-city-links'), {
  ssr: false,
  loading: () => <div className="mt-16 pt-8 h-48 animate-pulse bg-gray-800/30 rounded-lg" />
})
import { LazyForecast, LazyForecastDetails } from "@/components/lazy-weather-components"
import { AirQualityDisplay } from "@/components/air-quality-display"
import { PollenDisplay } from "@/components/pollen-display"
import LazyHourlyForecast from "@/components/lazy-hourly-forecast"
import { ResponsiveContainer, ResponsiveGrid } from "@/components/responsive-container"
import { ErrorBoundary } from "@/components/error-boundary"
import LazyWeatherMap from '@/components/lazy-weather-map'
import { WeatherSkeleton } from '@/components/weather-skeleton'
import { MoonPhaseIcon } from '@/components/moon-phase-icon'
import { useWeatherController } from "@/hooks/useWeatherController"

// Note: UV Index data is now only available in One Call API 3.0 (paid subscription required)
// The main weather API handles UV index estimation for free accounts

// API keys are now handled by internal API routes

// Using ThemeType from theme-utils
// Force rebuild for debug logs
function WeatherApp() {
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'weather')

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
              <div className="space-y-4 sm:space-y-6">
                {/* 1. Location Header with Large Temperature */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <h1 className={cn("text-xl sm:text-2xl font-extrabold tracking-wider uppercase", themeClasses.headerText, themeClasses.glow)} style={{
                      fontSize: "clamp(18px, 3.5vw, 28px)"
                    }}>
                      {weather.location} WEATHER
                    </h1>
                    {weather.forecast?.[0] && (
                      <ShareButton
                        weatherData={{
                          location: weather.location,
                          temperature: weather.temperature,
                          unit: weather.unit,
                          condition: weather.condition,
                          highTemp: Math.round(weather.forecast[0].highTemp),
                          lowTemp: Math.round(weather.forecast[0].lowTemp),
                        }}
                        variant="button"
                      />
                    )}
                  </div>
                  <p data-testid="temperature-value" className={cn("text-6xl sm:text-8xl font-bold my-2", themeClasses.text)} style={{
                    fontSize: "clamp(48px, 12vw, 96px)"
                  }}>
                    {weather?.temperature ?? 'N/A'}{weather?.temperature != null ? '°' : ''}
                  </p>
                  <p className={cn("text-base sm:text-lg", themeClasses.secondaryText)}>
                    {weather?.condition || 'Unknown'} - {weather?.description || 'No description available'}
                  </p>
                </div>

                {/* 2. Hourly Forecast - Always visible if data exists */}
                {weather?.hourlyForecast && weather.hourlyForecast.length > 0 && (
                  <LazyHourlyForecast
                    hourly={weather.hourlyForecast}
                    theme={theme}
                    tempUnit={weather.unit || '°F'}
                  />
                )}

                {/* 3. Two-column layout: 5-Day Forecast + AQI (left) / Radar (right) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* LEFT: 5-Day Forecast + AQI stacked */}
                  <div className="space-y-4">
                    {(() => {
                      const handleDayClick = (index: number) => {
                        setSelectedDay(selectedDay === index ? null : index);
                      };

                      return (
                        <>
                          {weather?.forecast && weather.forecast.length > 0 ? (
                            <LazyForecast
                              forecast={weather.forecast.map((day) => ({
                                ...day,
                                country: weather?.country || 'US'
                              }))}
                              theme={theme || 'dark'}
                              onDayClick={handleDayClick}
                              selectedDay={selectedDay}
                            />
                          ) : (
                            <div className="bg-terminal-bg-secondary p-4 rounded-lg border-0 border-terminal-border text-center">
                              <p className="text-terminal-text-primary font-mono">
                                No forecast data available
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {/* Air Quality */}
                    <AirQualityDisplay
                      aqi={weather.aqi}
                      theme={(theme || 'dark') as import('@/lib/theme-config').ThemeType}
                    />
                  </div>

                  {/* RIGHT: Weather Radar only */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-terminal-text-primary">
                        Weather Radar
                      </h2>
                      <Link
                        href="/radar"
                        className="px-2 py-1 border-0 rounded-md font-mono text-xs font-bold transition-colors hover:scale-105 text-terminal-text-primary hover:text-white"
                      >
                        VIEW FULL →
                      </Link>
                    </div>
                    <div className="h-[400px] rounded-lg overflow-visible">
                      <LazyWeatherMap
                        latitude={weather?.coordinates?.lat}
                        longitude={weather?.coordinates?.lon}
                        locationName={weather?.location}
                        theme={theme || 'dark'}
                        displayMode="widget"
                      />
                    </div>
                  </div>
                </div>

                {/* Expandable Forecast Details Section */}
                <LazyForecastDetails
                  forecast={(weather?.forecast || []).map((day) => ({
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

                {/* 4. Two-column layout: Moon Phase + Wind */}
                <ResponsiveGrid cols={{ sm: 1, md: 2 }} className="gap-4">
                  {/* Moon Phase Card */}
                  <Card className="weather-card-enter border-0 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '0ms' }}>
                    <CardHeader className="pb-2">
                      <CardTitle className={cn("text-xl mb-0", "text-terminal-text-primary")}>Moon Phase</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <p className={cn("text-lg font-semibold", themeClasses.text)}>{weather?.moonPhase?.phase || 'Unknown'}</p>
                          <p className={cn("text-sm", themeClasses.secondaryText)}>
                            {weather?.moonPhase?.illumination || 0}% illuminated
                          </p>
                          <p className={cn("text-sm", themeClasses.secondaryText)}>
                            Moonset: {weather?.moonPhase?.nextMoonset || 'N/A'}
                          </p>
                          <p className={cn("text-sm", themeClasses.secondaryText)}>
                            Full Moon: {weather?.moonPhase?.nextFullMoon || 'N/A'}
                          </p>
                        </div>
                        <MoonPhaseIcon
                          phase={weather?.moonPhase?.phase || 'new moon'}
                          illumination={weather?.moonPhase?.illumination || 0}
                          size={64}
                          className="flex-shrink-0"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Wind Card */}
                  <Card className="weather-card-enter border-0 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '50ms' }}>
                    <CardHeader className="pb-2 text-center">
                      <CardTitle className={cn("text-xl mb-0", "text-terminal-text-primary")}>Wind</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-2">
                      <p className={cn("text-2xl font-bold", themeClasses.text)}>
                        {weather?.wind?.speed || 'N/A'} mph
                      </p>
                      <p className={cn("text-sm", themeClasses.secondaryText)}>
                        {weather?.wind?.direction ? `Direction: ${weather.wind.direction}` : 'Direction: N/A'}
                      </p>
                      {weather?.wind?.gust && (
                        <p className={cn("text-sm", themeClasses.secondaryText)}>
                          Gusts up to {weather.wind.gust} mph
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </ResponsiveGrid>

                {/* 5. Four-column grid: UV, Sunrise/Sunset, Feels Like, Precipitation */}
                <ResponsiveGrid cols={{ sm: 2, md: 4 }} className="gap-4">
                  {/* UV Index */}
                  <Card className="weather-card-enter border-0 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '100ms' }}>
                    <CardHeader className="pb-1 text-center">
                      <CardTitle className={cn("text-sm mb-0", "text-terminal-text-primary")}>UV Index</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-1">
                      <p className={cn("text-2xl font-bold", themeClasses.text)}>{weather?.uvIndex ?? 'N/A'}</p>
                    </CardContent>
                  </Card>

                  {/* Sunrise/Sunset */}
                  <Card className="weather-card-enter border-0 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '150ms' }}>
                    <CardHeader className="pb-1 text-center">
                      <CardTitle className={cn("text-sm mb-0", "text-terminal-text-primary")}>Sun Times</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-1">
                      <div className="space-y-1">
                        <p className={cn("text-sm", themeClasses.text)}>
                          <span className="text-yellow-400">☀️</span> {weather?.sunrise || 'N/A'}
                        </p>
                        <p className={cn("text-sm", themeClasses.text)}>
                          <span className="text-orange-400">🌅</span> {weather?.sunset || 'N/A'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Feels Like */}
                  <Card className="weather-card-enter border-0 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '200ms' }}>
                    <CardHeader className="pb-1 text-center">
                      <CardTitle className={cn("text-sm mb-0", "text-terminal-text-primary")}>Feels Like</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-1">
                      <p className={cn("text-2xl font-bold", themeClasses.text)}>
                        {weather?.hourlyForecast?.[0]?.feelsLike != null
                          ? `${Math.round(weather.hourlyForecast[0].feelsLike)}°`
                          : `${weather?.temperature ?? 'N/A'}°`}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Precipitation Chance */}
                  <Card className="weather-card-enter border-0 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '250ms' }}>
                    <CardHeader className="pb-1 text-center">
                      <CardTitle className={cn("text-sm mb-0", "text-terminal-text-primary")}>Precip Chance</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-1">
                      <p className={cn("text-2xl font-bold", themeClasses.text)}>
                        {weather?.forecast?.[0]?.details?.precipitationChance ?? 0}%
                      </p>
                      <p className={cn("text-xs", themeClasses.headerText)}>Today</p>
                    </CardContent>
                  </Card>
                </ResponsiveGrid>

                {/* 6. Four-column grid: Visibility, Humidity, Pressure, Pollen */}
                <ResponsiveGrid cols={{ sm: 2, md: 4 }} className="gap-4">
                  {/* Visibility */}
                  <Card className="weather-card-enter border-0 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '300ms' }}>
                    <CardHeader className="pb-1 text-center">
                      <CardTitle className={cn("text-sm mb-0", "text-terminal-text-primary")}>Visibility</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-1">
                      <p className={cn("text-2xl font-bold", themeClasses.text)}>
                        {weather?.forecast?.[0]?.details?.visibility != null
                          ? `${weather.forecast[0].details.visibility} mi`
                          : 'N/A'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Humidity */}
                  <Card className="weather-card-enter border-0 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '350ms' }}>
                    <CardHeader className="pb-1 text-center">
                      <CardTitle className={cn("text-sm mb-0", "text-terminal-text-primary")}>Humidity</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-1">
                      <p className={cn("text-2xl font-bold", themeClasses.text)}>{weather?.humidity ?? 'N/A'}%</p>
                    </CardContent>
                  </Card>

                  {/* Pressure */}
                  <Card className="weather-card-enter border-0 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '400ms' }}>
                    <CardHeader className="pb-1 text-center">
                      <CardTitle className={cn("text-sm mb-0", "text-terminal-text-primary")}>Pressure</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-1">
                      <p className={cn("text-2xl font-bold", themeClasses.text)}>{weather?.pressure || 'N/A'}</p>
                    </CardContent>
                  </Card>

                  {/* Pollen */}
                  <Card className="weather-card-enter border-0 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '450ms' }}>
                    <CardHeader className="pb-1 text-center">
                      <CardTitle className={cn("text-sm mb-0", "text-terminal-text-primary")}>Pollen</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-1 px-2">
                      <PollenDisplay
                        pollen={weather.pollen}
                        theme={(theme || 'dark') as import('@/lib/theme-config').ThemeType}
                        minimal={true}
                        className="border-none shadow-none p-0 bg-transparent"
                      />
                    </CardContent>
                  </Card>
                </ResponsiveGrid>
              </div>
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