/**
 * 16-Bit Weather Platform - Server-Rendered Homepage Shell
 *
 * PERFORMANCE: This component renders on the server to provide
 * immediate visual content (LCP improvement). The interactive
 * weather data is loaded progressively via Suspense.
 */

import { cn } from "@/lib/utils"

/**
 * Static welcome message - server rendered for fast LCP
 */
export function WelcomeMessage() {
  return (
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
  )
}

/**
 * Server-rendered skeleton for weather cards - provides immediate visual structure
 */
export function WeatherCardsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Location Title Skeleton */}
      <div className="text-center mb-4">
        <div className="h-8 rounded-md w-64 mx-auto animate-pulse bg-gray-700/50" />
      </div>

      {/* 3-column weather cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={`card-${i}`}
            className="p-4 rounded-md border-2 bg-gray-800/50 border-gray-700 animate-pulse"
          >
            <div className="h-6 rounded w-24 mx-auto mb-3 bg-gray-600/50" />
            <div className="h-10 rounded w-20 mx-auto bg-gray-600/50" />
          </div>
        ))}
      </div>

      {/* Sun/UV/Moon skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={`info-${i}`}
            className="p-4 rounded-md border-2 bg-gray-800/50 border-gray-700 animate-pulse"
          >
            <div className="h-6 rounded w-20 mx-auto mb-2 bg-gray-600/50" />
            <div className="h-8 rounded w-16 mx-auto bg-gray-600/50" />
          </div>
        ))}
      </div>

      {/* 5-day forecast skeleton */}
      <div className="p-4 rounded-md border-2 bg-gray-800/50 border-gray-700 animate-pulse">
        <div className="h-6 rounded w-32 mb-4 bg-gray-600/50" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={`forecast-${i}`}
              className="h-32 rounded bg-gray-600/30"
            />
          ))}
        </div>
      </div>

      {/* Map skeleton */}
      <div className="h-[450px] rounded-md border-2 bg-gray-800/50 border-gray-700 animate-pulse">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-500 font-mono text-sm">
            Loading Weather Radar...
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Server-rendered search form placeholder - provides immediate interactivity appearance
 */
export function SearchFormShell() {
  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="flex gap-2">
        <div className="flex-1 h-12 rounded-md border-2 bg-gray-800/50 border-gray-700" />
        <div className="w-24 h-12 rounded-md border-2 bg-gray-700/50 border-gray-600" />
      </div>
    </div>
  )
}
