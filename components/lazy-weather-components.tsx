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

/**
 * Lazy-loaded weather components for better performance
 * Components load only when needed, improving initial page load times
 */

import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ErrorBoundary } from './error-boundary'
import { WeatherData } from '@/lib/types'
import { ThemeType } from '@/lib/theme-config'

// Lazy load weather components
const Forecast = lazy(() => import('./forecast'))
const ForecastDetails = lazy(() => import('./forecast-details'))
const EnvironmentalDisplay = lazy(() => import('./environmental-display'))

// Loading spinner component
function WeatherComponentLoader({ theme }: { theme: ThemeType }) {
  return (
    <div className="flex justify-center items-center py-8">
      <Loader2 className={cn(
        "h-8 w-8 animate-spin",
        theme === "dark" && "text-blue-500",
        theme === "miami" && "text-pink-500",
        theme === "synthwave84" && "text-[#ff7edb]",
        theme === "dracula" && "text-[#ff79c6]",
        theme === "cyberpunk" && "text-[#00ffff]",
        theme === "matrix" && "text-[#00ff41]"
      )} />
      <span className="ml-2 text-white text-sm">Loading weather data...</span>
    </div>
  )
}

// Lazy wrapper components with fallback loading states
interface ForecastDay {
  day: string;
  highTemp: number;
  lowTemp: number;
  condition: string;
  description: string;
  country?: string;
}

export function LazyForecast(props: { 
  forecast: ForecastDay[]; 
  theme?: ThemeType; 
  onDayClick?: (index: number) => void;
  selectedDay?: number | null;
}) {
  return (
    <ErrorBoundary componentName="Weather Forecast">
      <Suspense fallback={<WeatherComponentLoader theme={props.theme || 'dark'} />}>
        <Forecast {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

export function LazyForecastDetails(props: { 
  forecast: ForecastDay[];
  selectedDay: number | null;
  theme?: ThemeType;
  currentWeatherData?: {
    humidity: number;
    wind: { speed: number; direction?: string };
    pressure: string;
    uvIndex: number;
    sunrise: string;
    sunset: string;
  };
}) {
  return (
    <ErrorBoundary componentName="Forecast Details">
      <Suspense fallback={<WeatherComponentLoader theme={props.theme || 'dark'} />}>
        <ForecastDetails {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

export function LazyEnvironmentalDisplay(props: { 
  weather: WeatherData;
  theme: ThemeType;
  className?: string;
  minimal?: boolean;
}) {
  return (
    <ErrorBoundary componentName="Environmental Display">
      <Suspense fallback={<WeatherComponentLoader theme={props.theme} />}>
        <EnvironmentalDisplay {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}