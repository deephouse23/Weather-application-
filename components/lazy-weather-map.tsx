'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const WeatherMap = dynamic(() => import('./weather-map-animated'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg border-2 border-gray-600">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
})

export default WeatherMap