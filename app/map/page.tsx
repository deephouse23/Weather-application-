'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const WeatherMap = dynamic(() => import('@/components/weather-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-gray-900">
      <div className="text-white text-center">
        <div className="mb-2">Loading Weather Map...</div>
        <div className="text-sm text-gray-400">Initializing map components</div>
      </div>
    </div>
  )
})

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <div className="p-2">
        <Link href="/" className="inline-block text-xs font-mono px-2 py-1 border-2 border-gray-600 hover:bg-gray-700 transition-colors" aria-label="Return to Home">
          ← Home
        </Link>
      </div>
      <WeatherMap />
    </div>
  )
}

export const runtime = 'edge'
