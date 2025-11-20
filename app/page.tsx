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


import React, { useState, useEffect, Suspense } from "react"
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import PageWrapper from "@/components/page-wrapper"
import { Analytics } from "@vercel/analytics/react"
import WeatherSearch from "@/components/weather-search"
import RandomCityLinks from "@/components/random-city-links"
import { APP_CONSTANTS } from "@/lib/utils"
import { LazyEnvironmentalDisplay, LazyForecast, LazyForecastDetails } from "@/components/lazy-weather-components"
import LazyHourlyForecast from "@/components/lazy-hourly-forecast"
import { ResponsiveContainer, ResponsiveGrid } from "@/components/responsive-container"
import { ErrorBoundary, SafeRender } from "@/components/error-boundary"
import { useLocationContext } from "@/components/location-context"
import LazyWeatherMap from '@/components/lazy-weather-map'
import { WeatherSkeleton } from '@/components/weather-skeleton'
import { useWeatherController } from "@/hooks/useWeatherController"

// Note: UV Index data is now only available in One Call API 3.0 (paid subscription required)
// The main weather API handles UV index estimation for free accounts

const formatPressureByRegion = (pressureHPa: number, countryCode: string): string => {
  const shouldUseInchesOfMercury = (countryCode: string): boolean => {
    const inHgCountries = ['US', 'CA', 'PR', 'VI', 'GU', 'AS', 'MP'];
    return inHgCountries.includes(countryCode);
  };

  if (shouldUseInchesOfMercury(countryCode)) {
    const inHg = pressureHPa * 0.02953;
    return `${inHg.toFixed(2)} inHg`;
  } else {
    return `${Math.round(pressureHPa)} hPa`;
  }
};

// API keys are now handled by internal API routes

// Using ThemeType from theme-utils

// Helper function to determine pressure unit (matches weather API logic)
const getPressureUnit = (countryCode: string): 'hPa' | 'inHg' => {
  const inHgCountries = ['US', 'CA', 'PR', 'VI', 'GU', 'AS', 'MP'];
  return inHgCountries.includes(countryCode) ? 'inHg' : 'hPa';
};


function WeatherApp() {
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'weather')
  const {
    locationInput,
    currentLocation,
    setLocationInput
  } = useLocationContext()

  // Use the new controller hook
  const {
    weather,
    loading,
    error,
    hasSearched,
    remainingSearches,
    handleSearch,
    handleLocationSearch,
    isAutoDetecting
  } = useWeatherController()

  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showHourlyForecast, setShowHourlyForecast] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Client-side mount effect
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSearchWrapper = (locationInput: string) => {
    handleSearch(locationInput)
  }

  // Helper function to safely access weather data
  const getWeatherData = <T,>(path: string, defaultValue: T): T => {
    try {
      const value = path
        .split('.')
        .reduce((obj: any, key: string) => (obj ? obj[key] : undefined), weather as any)
      return (value ?? defaultValue) as T
    } catch (error) {
      console.error('Error accessing weather data:', error)
      return defaultValue
    }
  }

  const formatWindDisplayHTML = (windDisplay: string): string => {
    // Convert wind display to HTML for colored wind speeds
    return windDisplay.replace(/(\d+)\s*(mph|km\/h)/gi, '<span class="wind-speed">$1 $2</span>')
  }

  // Tron Animated Grid Background Component - Same as PageWrapper
  const TronGridBackground = () => {
    if ((theme || 'dark') !== 'tron') return null;

    return (
      <>
        <style jsx>{`
          @keyframes tronWave {
            0% {
              transform: translateY(100vh);
              opacity: 0.8;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translateY(-100vh);
              opacity: 0.8;
            }
          }

          .tron-grid-base {
            background-image: 
              linear-gradient(rgba(0, 220, 255, 0.18) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 220, 255, 0.18) 1px, transparent 1px);
            background-size: 50px 50px;
          }

          .tron-grid-detail {
            background-image: 
              linear-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 240, 255, 0.08) 1px, transparent 1px);
            background-size: 10px 10px;
          }

          .tron-wave {
            background: linear-gradient(
              to top,
              transparent 0%,
              rgba(0, 204, 255, 0.4) 45%,
              rgba(0, 240, 255, 0.6) 50%,
              rgba(0, 204, 255, 0.4) 55%,
              transparent 100%
            );
            height: 200px;
            width: 100%;
            animation: tronWave 3.5s infinite linear;
            filter: blur(2px);
          }

          .tron-wave-glow {
            background: linear-gradient(
              to top,
              transparent 0%,
              rgba(0, 220, 255, 0.2) 40%,
              rgba(0, 240, 255, 0.35) 50%,
              rgba(0, 220, 255, 0.2) 60%,
              transparent 100%
            );
            height: 300px;
            width: 100%;
            animation: tronWave 3.5s infinite linear;
            animation-delay: 0.2s;
            filter: blur(4px);
          }

          .tron-pulse-grid {
            background-image: 
              linear-gradient(rgba(0, 220, 255, 0.25) 2px, transparent 2px),
              linear-gradient(90deg, rgba(0, 220, 255, 0.25) 2px, transparent 2px);
            background-size: 50px 50px;
            animation: tronGridPulse 3.5s infinite linear;
          }

          @keyframes tronGridPulse {
            0%, 100% {
              opacity: 0.1;
            }
            50% {
              opacity: 0.3;
            }
          }
        `}</style>

        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Base static grid */}
          <div className="absolute inset-0 tron-grid-base opacity-15" />

          {/* Detail grid */}
          <div className="absolute inset-0 tron-grid-detail opacity-8" />

          {/* Pulsing grid overlay */}
          <div className="absolute inset-0 tron-pulse-grid" />

          {/* Animated wave effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="tron-wave absolute left-0 right-0" />
          </div>

          {/* Secondary wave with glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="tron-wave-glow absolute left-0 right-0" />
          </div>

          {/* Subtle corner accent lines */}
          <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#00DCFF] opacity-25"></div>
          <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[#00DCFF] opacity-25"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[#00DCFF] opacity-25"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#00DCFF] opacity-25"></div>
        </div>
      </>
    );
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


  // Helper function to get moon phase icon
  const getMoonPhaseIcon = (phase: string): string => {
    const phaseLower = phase.toLowerCase();

    if (phaseLower.includes('new')) return '●';
    if (phaseLower.includes('waxing crescent')) return '☽';
    if (phaseLower.includes('first quarter')) return '☽';
    if (phaseLower.includes('waxing gibbous')) return '❍';
    if (phaseLower.includes('full')) return '○';
    if (phaseLower.includes('waning gibbous')) return '❍';
    if (phaseLower.includes('last quarter')) return '☾';
    if (phaseLower.includes('waning crescent')) return '☾';

    return '○';
  };

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
      <TronGridBackground />

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
                        location={currentLocation || locationInput}
                        theme={theme as ThemeType}
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

                {/* 7-Day Forecast Grid */}
                <div className="mt-8">
                  <h2 className={cn("text-xl font-bold mb-4 pixel-font", themeClasses.text)}>
                    7-DAY FORECAST
                  </h2>
                  <ResponsiveGrid cols={{ sm: 2, md: 3, lg: 4 }} className="gap-4">
                    {weather.forecast.map((day, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-105",
                          selectedDay === index
                            ? "bg-primary/20 border-primary ring-2 ring-primary/50"
                            : `${themeClasses.cardBg} ${themeClasses.border} hover:border-primary/50`
                        )}
                      >
                        <div className="text-center space-y-2">
                          <div className="font-bold text-lg">{day.day.substring(0, 3)}</div>
                          <div className="text-xs opacity-70">{new Date().toLocaleDateString()}</div>
                          <div className="text-4xl my-2">{getWeatherIcon(day.condition)}</div>
                          <div className="flex justify-center gap-2 text-sm font-mono">
                            <span className="text-red-400">{Math.round(day.highTemp)}°</span>
                            <span className="text-blue-400">{Math.round(day.lowTemp)}°</span>
                          </div>
                          <div className="text-xs font-bold mt-2 truncate px-1">
                            {day.condition}
                          </div>

                          {/* Mini details for selected day */}
                          {selectedDay === index && (
                            <div className="mt-4 pt-4 border-t border-gray-700 text-xs space-y-1 text-left animate-in fade-in">
                              <div className="flex justify-between">
                                <span>Rain:</span>
                                <span>{day.details?.precipitationChance || 0}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Wind:</span>
                                <span>{day.details?.windSpeed || 0} mph</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Hum:</span>
                                <span>{day.details?.humidity || 0}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </ResponsiveGrid>
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