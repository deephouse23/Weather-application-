'use client'

import dynamic from 'next/dynamic'

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
      <WeatherMap />
    </div>
  )
}

export const runtime = 'edge'
