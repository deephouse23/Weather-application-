'use client'

import dynamic from 'next/dynamic'

interface WeatherMapProps {
  latitude?: number
  longitude?: number
  locationName?: string
  theme?: 'dark' | 'miami' | 'tron'
  initialZoom?: number
}

// Create a completely dynamic map component with no SSR
const MapComponent = dynamic(() => import('./weather-map-client'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-white">Loading map...</div>
    </div>
  )
})

const WeatherMap = (props: WeatherMapProps) => {
  return <MapComponent {...props} />
}

export default WeatherMap
