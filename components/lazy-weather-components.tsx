/**
 * 16-Bit Weather Platform - BETA v0.3.2
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

/**
 * Lazy-loaded weather components for better performance
 * Components load only when needed, improving initial page load times
 */

import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ErrorBoundary } from './error-boundary'

// Lazy load weather components
const Forecast = lazy(() => import('./forecast'))
const ForecastDetails = lazy(() => import('./forecast-details'))
const EnvironmentalDisplay = lazy(() => import('./environmental-display'))

// Loading spinner component
function WeatherComponentLoader({ theme }: { theme: 'dark' | 'miami' | 'tron' }) {
  return (
    <div className="flex justify-center items-center py-8">
      <Loader2 className={cn(
        "h-8 w-8 animate-spin",
        theme === "dark" && "text-blue-500",
        theme === "miami" && "text-pink-500",
        theme === "tron" && "text-cyan-500"
      )} />
      <span className="ml-2 text-white text-sm">Loading weather data...</span>
    </div>
  )
}

// Lazy wrapper components with fallback loading states
export function LazyForecast(props: any) {
  return (
    <ErrorBoundary componentName="Weather Forecast" theme={props.theme}>
      <Suspense fallback={<WeatherComponentLoader theme={props.theme} />}>
        <Forecast {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

export function LazyForecastDetails(props: any) {
  return (
    <ErrorBoundary componentName="Forecast Details" theme={props.theme}>
      <Suspense fallback={<WeatherComponentLoader theme={props.theme} />}>
        <ForecastDetails {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

export function LazyEnvironmentalDisplay(props: any) {
  return (
    <ErrorBoundary componentName="Environmental Display" theme={props.theme}>
      <Suspense fallback={<WeatherComponentLoader theme={props.theme} />}>
        <EnvironmentalDisplay {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}