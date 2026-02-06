"use client"

/**
 * 16-Bit Weather Platform - v1.0.0
 *
 * Shared Weather Display Component
 * Used by both the homepage and city weather pages for consistent layouts
 */

import React from "react"
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { ShareButton } from "@/components/share-weather-modal"
import { LazyForecast, LazyForecastDetails } from "@/components/lazy-weather-components"
import { AirQualityDisplay } from "@/components/air-quality-display"
import { PollenDisplay } from "@/components/pollen-display"
import LazyHourlyForecast from "@/components/lazy-hourly-forecast"
import { ResponsiveGrid } from "@/components/responsive-container"
import LazyWeatherMap from '@/components/lazy-weather-map'
import { MoonPhaseIcon } from '@/components/moon-phase-icon'
import { WeatherData } from "@/lib/types"

interface WeatherDisplayProps {
  weather: WeatherData
  theme: string
  selectedDay: number | null
  onDayClick: (index: number) => void
  precipitation?: { rain24h: number; snow24h: number } | null
  showRadar?: boolean
}

export function WeatherDisplay({
  weather,
  theme,
  selectedDay,
  onDayClick,
  precipitation,
  showRadar = true
}: WeatherDisplayProps) {
  const themeClasses = getComponentStyles(theme as ThemeType, 'weather')

  return (
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
          theme={theme as ThemeType}
          tempUnit={weather.unit || '°F'}
        />
      )}

      {/* 3. Two-column layout: 5-Day Forecast + AQI (left) / Radar (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: 5-Day Forecast + AQI stacked */}
        <div className="space-y-4">
          {weather?.forecast && weather.forecast.length > 0 ? (
            <LazyForecast
              forecast={weather.forecast.map((day) => ({
                ...day,
                country: weather?.country || 'US'
              }))}
              theme={(theme || 'dark') as ThemeType}
              onDayClick={onDayClick}
              selectedDay={selectedDay}
            />
          ) : (
            <div className="bg-terminal-bg-secondary p-4 rounded-lg border-0 border-terminal-border text-center">
              <p className="text-terminal-text-primary font-mono">
                No forecast data available
              </p>
            </div>
          )}

          {/* Air Quality */}
          <AirQualityDisplay
            aqi={weather.aqi}
            theme={(theme || 'dark') as import('@/lib/theme-config').ThemeType}
          />
        </div>

        {/* RIGHT: Weather Radar only */}
        {showRadar && (
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
                theme={(theme || 'dark') as ThemeType}
                displayMode="widget"
              />
            </div>
          </div>
        )}
      </div>

      {/* Expandable Forecast Details Section */}
      <LazyForecastDetails
        forecast={(weather?.forecast || []).map((day) => ({
          ...day,
          country: weather?.country || 'US'
        }))}
        theme={(theme || 'dark') as ThemeType}
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

        {/* Precipitation (24h actuals - rain + snow combined) */}
        <Card className="weather-card-enter border-0 shadow-md hover:shadow-lg transition-all duration-300" style={{ animationDelay: '250ms' }}>
          <CardHeader className="pb-1 text-center">
            <CardTitle className={cn("text-sm mb-0", "text-terminal-text-primary")}>Precipitation</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-1">
            <p className={cn("text-2xl font-bold", themeClasses.text)}>
              {precipitation != null
                ? `${((precipitation.rain24h ?? 0) + (precipitation.snow24h ?? 0)).toFixed(2)}"`
                : 'N/A'}
            </p>
            <p className={cn("text-xs", themeClasses.headerText)}>24h Total</p>
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
  )
}
