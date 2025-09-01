'use client'

import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState, useRef, useCallback } from 'react'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Clock, 
  CloudRain
} from 'lucide-react'

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface WeatherMapAnimatedProps {
  latitude?: number
  longitude?: number
  locationName?: string
  theme?: 'dark' | 'miami' | 'tron'
  apiKey?: string
}

const WeatherMapAnimated = ({ 
  latitude, 
  longitude, 
  locationName, 
  theme = 'dark',
  apiKey 
}: WeatherMapAnimatedProps) => {
  const [map, setMap] = useState<L.Map | null>(null)
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0) // 0-4, where 0 is "now"
  const [isPlaying, setIsPlaying] = useState(false)
  const [radarOpacity, setRadarOpacity] = useState(70)
  const [isLoading, setIsLoading] = useState(true)
  const [precipitationLayer, setPrecipitationLayer] = useState<L.TileLayer | null>(null)
  const animationInterval = useRef<NodeJS.Timeout | null>(null)
  
  const position: [number, number] = [latitude || 39.8283, longitude || -98.5795]
  
  // Time labels for the timeline (free plan: current + forecast only)
  const timeLabels = ['Now', '+1h', '+2h', '+3h', '+4h']
  
  // Calculate timestamp for each time frame (free plan: current + forecast)
  const getTimestamp = (index: number) => {
    const now = Date.now()
    const hoursOffset = index // 0 to +4 hours from now
    return Math.floor((now + hoursOffset * 3600000) / 1000) // Convert to seconds
  }
  
  // Format time for display
  const formatTime = (index: number) => {
    const date = new Date(getTimestamp(index) * 1000)
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }
  
  // Update map view when location changes and set loading state
  useEffect(() => {
    if (map && latitude && longitude) {
      map.setView([latitude, longitude], 10)
    }
    // Set loading to false after a short delay to ensure controls appear
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [map, latitude, longitude])
  
  // Handle animation playback
  useEffect(() => {
    if (isPlaying) {
      animationInterval.current = setInterval(() => {
        setCurrentTimeIndex(prev => {
          if (prev >= 4) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (animationInterval.current) {
        clearInterval(animationInterval.current)
        animationInterval.current = null
      }
    }
    
    return () => {
      if (animationInterval.current) {
        clearInterval(animationInterval.current)
      }
    }
  }, [isPlaying])
  
  // Update precipitation layer URL when time changes (free plan compatible)
  useEffect(() => {
    if (precipitationLayer && apiKey) {
      // Free plan: use current precipitation tiles for all timeframes
      // Note: Historical data requires Weather Maps 2.0 API (paid plan)
      const url = `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`
      precipitationLayer.setUrl(url)
      
      console.log(`Loading precipitation for: ${timeLabels[currentTimeIndex]}`)
    }
  }, [currentTimeIndex, precipitationLayer, apiKey, timeLabels])
  
  // Theme-based styles
  const getThemeStyles = () => {
    switch(theme) {
      case 'miami':
        return {
          container: 'border-4 border-pink-500 shadow-lg shadow-pink-500/50',
          overlay: 'bg-gradient-to-t from-purple-900/20 to-transparent',
          controls: 'bg-black/95 border-pink-500 shadow-2xl',
          button: 'bg-pink-600 hover:bg-pink-700 text-white',
          buttonSecondary: 'bg-purple-600 hover:bg-purple-700 text-white',
          timeline: 'bg-purple-900/30',
          timelineActive: 'bg-pink-500',
          timelineHover: 'hover:bg-pink-700',
          text: 'text-pink-100',
          accent: 'text-pink-400'
        }
      case 'tron':
        return {
          container: 'border-2 border-cyan-400 shadow-lg shadow-cyan-400/50',
          overlay: 'bg-gradient-to-t from-cyan-900/20 to-transparent',
          controls: 'bg-black/95 border-cyan-400 shadow-2xl',
          button: 'bg-cyan-600 hover:bg-cyan-700 text-white',
          buttonSecondary: 'bg-blue-600 hover:bg-blue-700 text-white',
          timeline: 'bg-blue-900/30',
          timelineActive: 'bg-cyan-400',
          timelineHover: 'hover:bg-cyan-600',
          text: 'text-cyan-100',
          accent: 'text-cyan-400'
        }
      default:
        return {
          container: 'border-2 border-gray-600 shadow-lg',
          overlay: '',
          controls: 'bg-gray-900/95 border-gray-600 shadow-2xl',
          button: 'bg-gray-700 hover:bg-gray-600 text-white',
          buttonSecondary: 'bg-gray-800 hover:bg-gray-700 text-white',
          timeline: 'bg-gray-800/30',
          timelineActive: 'bg-gray-500',
          timelineHover: 'hover:bg-gray-600',
          text: 'text-gray-100',
          accent: 'text-gray-400'
        }
    }
  }
  
  const themeStyles = getThemeStyles()
  
  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])
  
  const handleSkipToStart = useCallback(() => {
    setCurrentTimeIndex(0)
    setIsPlaying(false)
  }, [])
  
  const handleSkipToEnd = useCallback(() => {
    setCurrentTimeIndex(4)
    setIsPlaying(false)
  }, [])
  
  const handleTimeSelect = useCallback((index: number) => {
    setCurrentTimeIndex(index)
    setIsPlaying(false)
  }, [])

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden ${themeStyles.container}`} style={{ isolation: 'isolate' }}>
      <MapContainer 
        center={position} 
        zoom={10} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="grayscale contrast-125"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.Overlay checked name="Weather Radar">
            <TileLayer
              attribution='&copy; <a href="https://www.openweathermap.org/">OpenWeatherMap</a>'
              url={`/api/weather/radar/{z}/{x}/{y}`}
              opacity={radarOpacity / 100}
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Precipitation">
            <TileLayer
              ref={(layer) => setPrecipitationLayer(layer)}
              attribution='&copy; <a href="https://www.openweathermap.org/">OpenWeatherMap</a>'
              url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`}
              opacity={0.6}
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Clouds">
            <TileLayer
              attribution='&copy; <a href="https://www.openweathermap.org/">OpenWeatherMap</a>'
              url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`}
              opacity={0.5}
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Temperature">
            <TileLayer
              attribution='&copy; <a href="https://www.openweathermap.org/">OpenWeatherMap</a>'
              url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`}
              opacity={0.6}
            />
          </LayersControl.Overlay>
        </LayersControl>
        {latitude && longitude && (
          <Marker position={[latitude, longitude]}>
            <Popup>
              <div className="text-center">
                <strong>{locationName || 'Selected Location'}</strong>
                <br />
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {themeStyles.overlay && (
        <div className={`absolute inset-0 pointer-events-none ${themeStyles.overlay}`} />
      )}
      
      {/* Time Display Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none z-[1001]">
        <div className={`px-4 py-2 rounded-lg ${themeStyles.controls} border backdrop-blur-md`}>
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${themeStyles.accent}`} />
            <span className={`font-mono text-sm ${themeStyles.text}`}>
              {timeLabels[currentTimeIndex]} - {formatTime(currentTimeIndex)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Always Visible Controls Panel */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-[1000] pointer-events-auto"
        style={{ 
          display: 'block !important',
          visibility: 'visible !important',
          position: 'absolute !important'
        }}
      >
        <div 
          className={`${themeStyles.controls} border-t backdrop-blur-md p-4 min-h-[120px]`} 
          style={{ 
            display: 'block !important', 
            visibility: 'visible !important',
            position: 'relative',
            zIndex: 1002
          }}
        >
          {/* Timeline */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className={`w-4 h-4 ${themeStyles.accent}`} />
              <span className={`text-sm font-mono ${themeStyles.text}`}>Precipitation Timeline</span>
            </div>
            <div className="flex gap-1" style={{ minHeight: '36px' }}>
              {timeLabels.map((label, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeSelect(index)}
                  className={`flex-1 py-2 px-1 text-xs font-mono rounded transition-all duration-300 min-h-[32px] ${
                    index === currentTimeIndex 
                      ? `${themeStyles.timelineActive} text-black font-bold shadow-md` 
                      : `${themeStyles.timeline} ${themeStyles.text} ${themeStyles.timelineHover} border border-opacity-50`
                  }`}
                  style={{ 
                    pointerEvents: 'auto',
                    position: 'relative',
                    zIndex: 1003
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Progress indicator */}
            <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${themeStyles.timelineActive} transition-all duration-300`}
                style={{ width: `${(currentTimeIndex + 1) * 20}%` }}
              />
            </div>
          </div>
          
          {/* Playback Controls */}
          <div className="flex items-center justify-between gap-4" style={{ minHeight: '44px' }}>
            <div className="flex gap-2">
              <button
                onClick={handleSkipToStart}
                className={`p-2 rounded-lg ${themeStyles.button} transition-all duration-300 shadow-md`}
                title="Skip to Beginning"
                style={{ 
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 1003,
                  minWidth: '40px',
                  minHeight: '40px'
                }}
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={handlePlayPause}
                className={`px-4 py-2 rounded-lg ${themeStyles.button} transition-all duration-300 
                  flex items-center gap-2 font-mono shadow-md`}
                style={{ 
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 1003,
                  minHeight: '40px'
                }}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={handleSkipToEnd}
                className={`p-2 rounded-lg ${themeStyles.button} transition-all duration-300 shadow-md`}
                title="Skip to End"
                style={{ 
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 1003,
                  minWidth: '40px',
                  minHeight: '40px'
                }}
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            
            {/* Opacity Slider */}
            <div className="flex items-center gap-2 min-w-[200px]">
              <span className={`text-xs font-mono ${themeStyles.text} whitespace-nowrap`}>Radar:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={radarOpacity}
                onChange={(e) => setRadarOpacity(Number(e.target.value))}
                className="flex-1"
                style={{ minWidth: '100px' }}
              />
              <span className={`text-xs font-mono ${themeStyles.text} w-10 text-right`}>
                {radarOpacity}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherMapAnimated