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
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { ShareButton } from "@/components/share-weather-modal"
import { LazyForecast, LazyForecastDetails } from "@/components/lazy-weather-components"
import { AirQualityDisplay } from "@/components/air-quality-display"
import { PollenDisplay } from "@/components/pollen-display"
import LazyHourlyForecast from "@/components/lazy-hourly-forecast"
import { ResponsiveGrid } from "@/components/responsive-container"
import LazyWeatherMap from '@/components/lazy-weather-map'
import { MoonPhaseIcon } from '@/components/moon-phase-icon'
import type { WeatherData } from "@/lib/types"
import {
  getUVSeverity,
  getHumiditySeverity,
  getPressureCategory,
  getWindSeverity,
  getVisibilitySeverity,
  windDirectionToDegrees,
} from "@/lib/weather-severity"
import {
  Sun,
  Thermometer,
  Sunrise,
  Droplets,
  Gauge,
  Wind,
  CloudRain,
  Eye,
  Leaf,
  Moon,
  Navigation,
  ArrowDown,
  ArrowUp,
} from "lucide-react"

interface WeatherDisplayProps {
  weather: WeatherData
  theme: string
  selectedDay: number | null
  onDayClick: (index: number) => void
  precipitation?: { rain24h: number; snow24h: number } | null
  showRadar?: boolean
}

// Card style constants
const HERO_CARD = "weather-card-enter border-0 border-l-4 border-l-primary shadow-md weather-metric-glow weather-card-gradient hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
const METRIC_CARD = "group weather-card-enter border-0 border-t-2 border-t-primary/40 shadow-md weather-metric-glow weather-card-gradient hover:border-t-primary hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 min-h-[140px]"

export function WeatherDisplay({
  weather,
  theme,
  selectedDay,
  onDayClick,
  precipitation,
  showRadar = true
}: WeatherDisplayProps) {
  const themeClasses = getComponentStyles(theme as ThemeType, 'weather')

  // Compute severity values
  const uvSeverity = getUVSeverity(weather?.uvIndex ?? 0)
  const humiditySeverity = getHumiditySeverity(weather?.humidity ?? 0)
  const pressureCategory = getPressureCategory(weather?.pressure || '1013')
  const windSpeed = weather?.wind?.speed ?? 0
  const windSeverity = getWindSeverity(windSpeed)
  const windDeg = windDirectionToDegrees(weather?.wind?.direction || '')
  const visibilityMi = weather?.forecast?.[0]?.details?.visibility ?? 10
  const visibilitySeverity = getVisibilitySeverity(visibilityMi)

  const feelsLike = weather?.hourlyForecast?.[0]?.feelsLike != null
    ? Math.round(weather.hourlyForecast[0].feelsLike)
    : weather?.temperature ?? null
  const feelsLikeDelta = feelsLike != null && weather?.temperature != null
    ? feelsLike - weather.temperature
    : 0

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
              theme={(theme || 'nord') as ThemeType}
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
            theme={(theme || 'nord') as import('@/lib/theme-config').ThemeType}
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
                theme={(theme || 'nord') as ThemeType}
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
        theme={(theme || 'nord') as ThemeType}
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

      {/* 4. Hero Card: Moon Phase */}
      <Card className={cn(HERO_CARD)} style={{ animationDelay: '0ms' }}>
        <CardHeader className="pb-3 px-5 pt-5">
          <CardTitle className={cn("text-lg font-bold tracking-wide uppercase flex items-center gap-2", "text-terminal-text-primary")}>
            <Moon size={18} className="text-primary" />
            Moon Phase
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 px-5 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <p className={cn("text-lg font-semibold", themeClasses.text)}>{weather?.moonPhase?.phase || 'Unknown'}</p>
              <p className={cn("text-sm", themeClasses.secondaryText)}>
                {weather?.moonPhase?.illumination || 0}% illuminated
              </p>
              <Progress
                value={weather?.moonPhase?.illumination || 0}
                className="h-2 mt-2"
                indicatorColor="#EBCB8B"
              />
              <div className="flex gap-4 mt-2">
                <p className={cn("text-sm", themeClasses.secondaryText)}>
                  Moonset: {weather?.moonPhase?.nextMoonset || 'N/A'}
                </p>
                <p className={cn("text-sm", themeClasses.secondaryText)}>
                  Full Moon: {weather?.moonPhase?.nextFullMoon || 'N/A'}
                </p>
              </div>
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

      {/* 5. Three-column grid Row A: UV Index, Feels Like, Sun Times */}
      <TooltipProvider delayDuration={300}>
        <ResponsiveGrid cols={{ sm: 1, md: 3 }} className="gap-4">
          {/* UV Index */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className={cn(METRIC_CARD)} style={{ animationDelay: '30ms' }}>
                <CardHeader className="pb-2 pt-4 px-4 text-center">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5">
                    <Sun size={14} className="text-primary group-hover:text-accent transition-colors" />
                    UV Index
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-2 px-4 pb-4">
                  <p className={cn("text-3xl font-bold tabular-nums", themeClasses.text)}>
                    {weather?.uvIndex ?? 'N/A'}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-2 border-0"
                    style={{ color: uvSeverity.textColor, backgroundColor: `${uvSeverity.bgColor}20` }}
                  >
                    {uvSeverity.label}
                  </Badge>
                  <Progress
                    value={uvSeverity.percentage}
                    className="h-1.5 mt-3"
                    indicatorColor={uvSeverity.bgColor}
                  />
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>UV Index measures ultraviolet radiation. Apply sunscreen above 3.</TooltipContent>
          </Tooltip>

          {/* Feels Like */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className={cn(METRIC_CARD)} style={{ animationDelay: '60ms' }}>
                <CardHeader className="pb-2 pt-4 px-4 text-center">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5">
                    <Thermometer size={14} className="text-primary group-hover:text-accent transition-colors" />
                    Feels Like
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-2 px-4 pb-4">
                  <p className={cn("text-3xl font-bold tabular-nums", themeClasses.text)}>
                    {feelsLike != null ? `${feelsLike}°` : 'N/A'}
                  </p>
                  {feelsLikeDelta !== 0 && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {feelsLikeDelta < 0 ? (
                        <ArrowDown size={14} style={{ color: '#88C0D0' }} />
                      ) : (
                        <ArrowUp size={14} style={{ color: '#BF616A' }} />
                      )}
                      <span className="text-sm" style={{ color: feelsLikeDelta < 0 ? '#88C0D0' : '#BF616A' }}>
                        {Math.abs(feelsLikeDelta)}° {feelsLikeDelta < 0 ? 'cooler' : 'warmer'}
                      </span>
                    </div>
                  )}
                  {feelsLikeDelta === 0 && (
                    <p className="text-sm mt-2" style={{ color: '#A3BE8C' }}>Same as actual</p>
                  )}
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>How the temperature actually feels, accounting for wind and humidity.</TooltipContent>
          </Tooltip>

          {/* Sun Times */}
          <Card className={cn(METRIC_CARD)} style={{ animationDelay: '90ms' }}>
            <CardHeader className="pb-2 pt-4 px-4 text-center">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5">
                <Sunrise size={14} className="text-primary group-hover:text-accent transition-colors" />
                Sun Times
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-2 px-4 pb-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Sunrise</p>
                  <p className={cn("text-xl font-bold tabular-nums", themeClasses.text)}>
                    {weather?.sunrise || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Sunset</p>
                  <p className={cn("text-xl font-bold tabular-nums", themeClasses.text)}>
                    {weather?.sunset || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* 6. Three-column grid Row B: Humidity, Pressure, Wind */}
        <ResponsiveGrid cols={{ sm: 1, md: 3 }} className="gap-4">
          {/* Humidity */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className={cn(METRIC_CARD)} style={{ animationDelay: '120ms' }}>
                <CardHeader className="pb-2 pt-4 px-4 text-center">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5">
                    <Droplets size={14} className="text-primary group-hover:text-accent transition-colors" />
                    Humidity
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-2 px-4 pb-4">
                  <p className={cn("text-3xl font-bold tabular-nums", themeClasses.text)}>
                    {weather?.humidity ?? 'N/A'}%
                  </p>
                  <Progress
                    value={weather?.humidity ?? 0}
                    className="h-1.5 mt-3"
                    indicatorColor={humiditySeverity.bgColor}
                  />
                  <Badge
                    variant="outline"
                    className="mt-2 border-0"
                    style={{ color: humiditySeverity.textColor, backgroundColor: `${humiditySeverity.bgColor}20` }}
                  >
                    {humiditySeverity.label}
                  </Badge>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>Relative humidity. Comfortable range is 30-60%.</TooltipContent>
          </Tooltip>

          {/* Pressure */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className={cn(METRIC_CARD)} style={{ animationDelay: '150ms' }}>
                <CardHeader className="pb-2 pt-4 px-4 text-center">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5">
                    <Gauge size={14} className="text-primary group-hover:text-accent transition-colors" />
                    Pressure
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-2 px-4 pb-4">
                  <p className={cn("text-3xl font-bold tabular-nums", themeClasses.text)}>
                    {weather?.pressure || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">hPa</p>
                  <Badge
                    variant="outline"
                    className="mt-2 border-0"
                    style={{ color: pressureCategory.textColor, backgroundColor: `${pressureCategory.bgColor}20` }}
                  >
                    {pressureCategory.label}
                  </Badge>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>Atmospheric pressure. Standard is 1013.25 hPa.</TooltipContent>
          </Tooltip>

          {/* Wind */}
          <Card className={cn(METRIC_CARD)} style={{ animationDelay: '180ms' }}>
            <CardHeader className="pb-2 pt-4 px-4 text-center">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5">
                <Wind size={14} className="text-primary group-hover:text-accent transition-colors" />
                Wind
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-2 px-4 pb-4">
              <p className={cn("text-3xl font-bold tabular-nums", themeClasses.text)}>
                {windSpeed || 'N/A'} <span className="text-lg">mph</span>
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {weather?.wind?.direction && (
                  <Navigation
                    size={16}
                    className="text-primary"
                    style={{ transform: `rotate(${windDeg + 180}deg)` }}
                  />
                )}
                <span className={cn("text-sm", themeClasses.secondaryText)}>
                  {weather?.wind?.direction || 'N/A'}
                </span>
              </div>
              {weather?.wind?.gust && (
                <p className={cn("text-xs mt-1", themeClasses.secondaryText)}>
                  Gusts {weather.wind.gust} mph
                </p>
              )}
              <Badge
                variant="outline"
                className="mt-2 border-0"
                style={{ color: windSeverity.textColor, backgroundColor: `${windSeverity.bgColor}20` }}
              >
                {windSeverity.label}
              </Badge>
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* 7. Three-column grid Row C: Precipitation, Visibility, Pollen */}
        <ResponsiveGrid cols={{ sm: 1, md: 3 }} className="gap-4">
          {/* Precipitation */}
          <Card className={cn(METRIC_CARD)} style={{ animationDelay: '210ms' }}>
            <CardHeader className="pb-2 pt-4 px-4 text-center">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5">
                <CloudRain size={14} className="text-primary group-hover:text-accent transition-colors" />
                Precipitation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-2 px-4 pb-4">
              <p className={cn("text-3xl font-bold tabular-nums", themeClasses.text)}>
                {precipitation != null
                  ? `${((precipitation.rain24h ?? 0) + (precipitation.snow24h ?? 0)).toFixed(2)}"`
                  : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">24h Total</p>
            </CardContent>
          </Card>

          {/* Visibility */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className={cn(METRIC_CARD)} style={{ animationDelay: '240ms' }}>
                <CardHeader className="pb-2 pt-4 px-4 text-center">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5">
                    <Eye size={14} className="text-primary group-hover:text-accent transition-colors" />
                    Visibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-2 px-4 pb-4">
                  <p className={cn("text-3xl font-bold tabular-nums", themeClasses.text)}>
                    {weather?.forecast?.[0]?.details?.visibility != null
                      ? `${weather.forecast[0].details.visibility}`
                      : 'N/A'}
                    <span className="text-lg ml-1">mi</span>
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-2 border-0"
                    style={{ color: visibilitySeverity.textColor, backgroundColor: `${visibilitySeverity.bgColor}20` }}
                  >
                    {visibilitySeverity.label}
                  </Badge>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>How far you can see clearly.</TooltipContent>
          </Tooltip>

          {/* Pollen */}
          <Card className={cn(METRIC_CARD)} style={{ animationDelay: '270ms' }}>
            <CardHeader className="pb-2 pt-4 px-4 text-center">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5">
                <Leaf size={14} className="text-primary group-hover:text-accent transition-colors" />
                Pollen
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-2 px-4 pb-4">
              <PollenDisplay
                pollen={weather.pollen}
                theme={(theme || 'nord') as import('@/lib/theme-config').ThemeType}
                minimal={true}
                className="border-none shadow-none p-0 bg-transparent"
              />
            </CardContent>
          </Card>
        </ResponsiveGrid>
      </TooltipProvider>
    </div>
  )
}
