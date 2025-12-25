'use client'
// Build: v5 - Animation controls moved to top, fixed visibility issues, smoother playback
// Changes: absolute positioning instead of fixed, loading indicator only when paused,
// increased transition time for smoother frame changes

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, Layers, ChevronDown, Loader2 } from 'lucide-react'
import { isInMRMSCoverage } from '@/lib/utils/location-utils'
import { ThemeType } from '@/lib/theme-config'

// OpenLayers imports
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import TileWMS from 'ol/source/TileWMS'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Icon } from 'ol/style'

// CORRECT WMS-T endpoint that supports TIME parameter
// Reference: https://mesonet.agron.iastate.edu/ogc/
// The n0q.cgi endpoint does NOT support TIME - must use n0q-t.cgi
const NEXRAD_WMS_URL = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q-t.cgi'
const NEXRAD_LAYER = 'nexrad-n0q-wmst'

interface WeatherMapProps {
  latitude?: number
  longitude?: number
  locationName?: string
  theme?: ThemeType
}

const WeatherMapOpenLayers = ({
  latitude,
  longitude,
  locationName,
  theme = 'dark'
}: WeatherMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const radarLayerRef = useRef<TileLayer<TileWMS> | null>(null)
  const radarSourceRef = useRef<TileWMS | null>(null)

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    precipitation: true,
    clouds: false,
    wind: false,
    pressure: false,
    temperature: false,
  })

  const [opacity, setOpacity] = useState(0.85)
  const [layerMenuOpen, setLayerMenuOpen] = useState(false)

  // Animation state
  const [isPlaying, setIsPlaying] = useState(false)
  const [frameIndex, setFrameIndex] = useState(0)
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1)
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<number | null>(null)

  // NEXRAD configuration
  const NEXRAD_STEP_MINUTES = 5
  const NEXRAD_PAST_STEPS = 48 // 4 hours past (5 min * 48 = 240 min = 4 hours)

  // Check if location is in US
  const isUSLocation = useMemo(() => {
    if (!latitude || !longitude) return false
    return isInMRMSCoverage(latitude, longitude)
  }, [latitude, longitude])

  // Generate NEXRAD timestamps
  const timestamps = useMemo(() => {
    if (!isUSLocation) return []
    
    const now = Date.now()
    const quantize = (ms: number) => Math.floor(ms / (NEXRAD_STEP_MINUTES * 60 * 1000)) * (NEXRAD_STEP_MINUTES * 60 * 1000)
    const base = quantize(now)
    const times: number[] = []
    
    for (let i = NEXRAD_PAST_STEPS; i >= 0; i -= 1) {
      times.push(base - i * NEXRAD_STEP_MINUTES * 60 * 1000)
    }
    
    console.log(`🕐 [v4] Generated ${times.length} NEXRAD timestamps`)
    console.log('  First:', new Date(times[0]).toISOString())
    console.log('  Last:', new Date(times[times.length - 1]).toISOString())
    
    return times
  }, [isUSLocation])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const centerLon = longitude || -98.5795
    const centerLat = latitude || 39.8283

    console.log('🗺️ [v4] Initializing OpenLayers map at:', centerLat, centerLon)

    // Create base layer (OpenStreetMap)
    const baseLayer = new TileLayer({
      source: new OSM(),
      opacity: 0.7,
    })

    // Create map
    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer],
      view: new View({
        center: fromLonLat([centerLon, centerLat]),
        zoom: 10,
      }),
    })

    mapInstanceRef.current = map

    // Fix for production: force map to recalculate size after container renders
    setTimeout(() => {
      map.updateSize()
      console.log('📐 [v4] Map size updated')
    }, 100)

    // Also update on window resize
    const handleResize = () => map.updateSize()
    window.addEventListener('resize', handleResize)

    console.log('✅ [v4] OpenLayers map initialized')

    return () => {
      window.removeEventListener('resize', handleResize)
      map.setTarget(undefined)
      mapInstanceRef.current = null
    }
  }, [])

  // Update map center when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return
    
    console.log('📍 [v4] Updating map center to:', latitude, longitude)
    mapInstanceRef.current.getView().setCenter(fromLonLat([longitude, latitude]))
    mapInstanceRef.current.getView().setZoom(10)
  }, [latitude, longitude])

  // Add location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return

    const map = mapInstanceRef.current

    // Remove existing marker layer
    const existingMarker = map.getLayers().getArray().find(layer => 
      layer.get('name') === 'marker'
    )
    if (existingMarker) {
      map.removeLayer(existingMarker)
    }

    // Create marker feature
    const markerFeature = new Feature({
      geometry: new Point(fromLonLat([longitude, latitude])),
    })

    // Create marker layer
    const markerLayer = new VectorLayer({
      source: new VectorSource({
        features: [markerFeature],
      }),
      style: new Style({
        image: new Icon({
          src: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="cyan" stroke="black" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3" fill="black"></circle>
            </svg>
          `),
          scale: 1,
          anchor: [0.5, 1],
        }),
      }),
      zIndex: 1000,
    })

    markerLayer.set('name', 'marker')
    map.addLayer(markerLayer)

    console.log('📌 [v4] Location marker added')
  }, [latitude, longitude])

  // Initialize SINGLE radar layer with WMS-T support
  useEffect(() => {
    if (!mapInstanceRef.current || !isUSLocation || !activeLayers.precipitation) {
      // Remove radar layer if it exists
      if (radarLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(radarLayerRef.current)
        radarLayerRef.current = null
        radarSourceRef.current = null
      }
      return
    }

    const map = mapInstanceRef.current

    // Remove existing radar layer if any
    if (radarLayerRef.current) {
      map.removeLayer(radarLayerRef.current)
    }

    console.log('🎯 [v4] Creating SINGLE NEXRAD WMS-T layer')
    console.log('  URL:', NEXRAD_WMS_URL)
    console.log('  Layer:', NEXRAD_LAYER)

    // Create WMS source with TIME support
    // Key insight: n0q-t.cgi supports the TIME parameter, n0q.cgi does NOT
    const radarSource = new TileWMS({
      url: NEXRAD_WMS_URL,
      params: {
        'LAYERS': NEXRAD_LAYER,
        'FORMAT': 'image/png',
        'TRANSPARENT': 'true',
        'VERSION': '1.1.1',
        // TIME will be set via updateParams()
      },
      serverType: 'mapserver',
      transition: 300, // Smooth cross-fade between frames (increased for smoother playback)
      crossOrigin: 'anonymous',
    })

    // Track loading state - use a counter to handle concurrent tile loads
    let loadingTileCount = 0
    
    radarSource.on('tileloadstart', () => {
      loadingTileCount++
      // Only show loading indicator when not playing (to avoid button flicker)
      if (!isPlaying && loadingTileCount === 1) {
        setIsLoading(true)
      }
    })

    radarSource.on('tileloadend', () => {
      loadingTileCount = Math.max(0, loadingTileCount - 1)
      if (loadingTileCount === 0) {
        setIsLoading(false)
      }
    })

    radarSource.on('tileloaderror', () => {
      loadingTileCount = Math.max(0, loadingTileCount - 1)
      if (loadingTileCount === 0) {
        setIsLoading(false)
      }
      console.warn('⚠️ [v4] Tile load error')
    })

    const radarLayer = new TileLayer({
      source: radarSource,
      opacity: opacity,
      zIndex: 500,
    })

    radarLayer.set('name', 'nexrad-radar')
    map.addLayer(radarLayer)

    radarLayerRef.current = radarLayer
    radarSourceRef.current = radarSource

    // Set initial time to most recent
    if (timestamps.length > 0) {
      const initialIndex = timestamps.length - 1
      const initialTime = new Date(timestamps[initialIndex]).toISOString()
      radarSource.updateParams({ 'TIME': initialTime })
      setFrameIndex(initialIndex)
      console.log('📡 [v4] Initial radar time set to:', initialTime)
    }

    console.log('✅ [v4] NEXRAD WMS-T layer created successfully')

    return () => {
      if (radarLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(radarLayerRef.current)
        radarLayerRef.current = null
        radarSourceRef.current = null
      }
    }
  }, [isUSLocation, activeLayers.precipitation, timestamps.length > 0])

  // Update opacity when it changes
  useEffect(() => {
    if (radarLayerRef.current) {
      radarLayerRef.current.setOpacity(opacity)
    }
  }, [opacity])

  // Update TIME parameter when frame changes - THIS IS THE KEY FIX
  useEffect(() => {
    if (!radarSourceRef.current || timestamps.length === 0) return

    const currentTimestamp = timestamps[frameIndex]
    if (!currentTimestamp) return

    const timeISO = new Date(currentTimestamp).toISOString()
    
    // This is the correct way to animate WMS-T layers in OpenLayers
    // updateParams() triggers a re-fetch with the new TIME value
    radarSourceRef.current.updateParams({ 'TIME': timeISO })
    
    console.log(`📡 [v4] Frame ${frameIndex + 1}/${timestamps.length} - TIME: ${timeISO}`)
  }, [frameIndex, timestamps])

  // Animation playback
  useEffect(() => {
    if (!isPlaying || timestamps.length === 0) return

    const baseInterval = 700 // ms per frame at 1x speed (allows tiles to load smoothly)
    const interval = baseInterval / speed

    console.log(`▶️ [v5] Animation started - interval: ${interval}ms, speed: ${speed}x`)

    const handle = window.setInterval(() => {
      setFrameIndex((idx) => (idx + 1) % timestamps.length)
    }, interval)

    timerRef.current = handle as unknown as number

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
        console.log('⏸️ [v4] Animation stopped')
      }
    }
  }, [isPlaying, speed, timestamps.length])

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isUSLocation || !activeLayers.precipitation) return

      // Don't intercept keys when user is typing in an input field
      const activeElement = document.activeElement as HTMLElement
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        setIsPlaying(prev => !prev)
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        setIsPlaying(false)
        setFrameIndex(prev => Math.max(0, prev - 1))
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        setIsPlaying(false)
        setFrameIndex(prev => Math.min(timestamps.length - 1, prev + 1))
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isUSLocation, activeLayers.precipitation, timestamps.length])

  const currentTime = timestamps[frameIndex]
  const humanTime = currentTime ? new Date(currentTime).toUTCString().replace(' GMT', '') : ''

  // Check if current frame is the most recent (LIVE)
  const isLiveFrame = frameIndex === timestamps.length - 1

  // Calculate relative time for better UX
  const relativeTime = useMemo(() => {
    if (!currentTime) return ''
    const now = Date.now()
    const diff = currentTime - now
    const diffMinutes = Math.round(diff / 60000)

    // Within 3 minutes of now = LIVE
    if (Math.abs(diffMinutes) < 3) return 'LIVE'

    // Past frames
    if (diffMinutes < 0) {
      const absDiff = Math.abs(diffMinutes)
      const hours = Math.floor(absDiff / 60)
      const mins = absDiff % 60
      if (hours > 0) return `${hours}h ${mins}m ago`
      return `${mins}m ago`
    }

    // Future frames (shouldn't happen with current config)
    return humanTime
  }, [currentTime, humanTime])

  const themeStyles = useMemo(() => {
    switch(theme) {
      case 'miami':
        return { container: 'border-4 border-pink-500 shadow-lg shadow-pink-500/50', badge: 'bg-pink-600/90 text-white border-pink-400' }
      case 'tron':
        return { container: 'border-2 border-cyan-400 shadow-lg shadow-cyan-400/50', badge: 'bg-cyan-600/90 text-white border-cyan-400' }
      default:
        return { container: 'border-2 border-gray-600 shadow-lg', badge: 'bg-gray-800/90 text-white border-gray-600' }
    }
  }, [theme])

  // Handler for play/pause with loading feedback
  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  // Jump to start
  const handleSkipToStart = useCallback(() => {
    setIsPlaying(false)
    setFrameIndex(0)
  }, [])

  // Jump to end (live)
  const handleSkipToEnd = useCallback(() => {
    setIsPlaying(false)
    setFrameIndex(timestamps.length - 1)
  }, [timestamps.length])

  // Debug: log render conditions
  console.log('🎨 [v4] Render conditions:', {
    isUSLocation,
    precipitation: activeLayers.precipitation,
    timestampsLength: timestamps.length,
    shouldShowControls: isUSLocation && activeLayers.precipitation && timestamps.length > 0
  })

  return (
    <div 
      data-radar-container
      className={`relative w-full h-full rounded-lg overflow-visible ${themeStyles.container}`}
      style={{ minHeight: '350px' }}
    >
      {/* Map Container - explicit dimensions for production */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 bg-gray-900 rounded-lg overflow-hidden"
        style={{ zIndex: 1, width: '100%', height: '100%', minHeight: '350px' }}
      />

      {/* Loading Indicator - Only show when not playing to avoid visual disruption */}
      {isLoading && !isPlaying && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2001]">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600/90 text-white border-2 border-yellow-400 rounded-md font-mono text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            LOADING RADAR...
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-md border-2 font-mono text-xs font-bold z-[2000] ${themeStyles.badge}`}>
        {isUSLocation ? (
          <span>
            {isPlaying ? '▶️' : isLiveFrame ? '🔴 LIVE' : '🎬'} NEXRAD RADAR • 4 HOUR HISTORY
          </span>
        ) : (
          <span>🌎 US LOCATIONS ONLY</span>
        )}
      </div>

      {/* Layer Controls */}
      <div className="absolute top-4 right-4 z-[2000]">
        <button
          onClick={() => setLayerMenuOpen(!layerMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white border-2 border-gray-600 rounded-md font-mono text-xs font-bold hover:bg-gray-700 transition-colors shadow-xl"
        >
          <Layers className="w-4 h-4" />
          LAYERS
          <ChevronDown className={`w-4 h-4 transition-transform ${layerMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {layerMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border-2 border-gray-600 rounded-md overflow-hidden shadow-xl">
            <div className="p-2 border-b border-gray-600 font-mono text-xs font-bold text-white">
              RADAR LAYERS
            </div>
            <button
              onClick={() => setActiveLayers(prev => ({ ...prev, precipitation: !prev.precipitation }))}
              className={`w-full px-3 py-2 text-left font-mono text-xs hover:bg-gray-700 transition-colors ${
                activeLayers.precipitation ? 'bg-cyan-600/30 text-cyan-300' : 'text-gray-300'
              }`}
            >
              {activeLayers.precipitation ? '✓' : '○'} Precipitation {isUSLocation ? '(NEXRAD)' : ''}
            </button>
            
            {/* Opacity slider */}
            {activeLayers.precipitation && (
              <div className="px-3 py-2 border-t border-gray-600">
                <div className="font-mono text-xs text-gray-400 mb-1">OPACITY: {Math.round(opacity * 100)}%</div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Animation Controls - Positioned at TOP of map for better visibility */}
      {isUSLocation && activeLayers.precipitation && timestamps.length > 0 && (
        <div 
          className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto"
          style={{ zIndex: 2000 }}
        >
          {/* Compact Controls Bar */}
          <div className="flex items-center gap-2 bg-gray-900/95 px-3 py-2 rounded-md border-2 border-cyan-500 shadow-2xl backdrop-blur-sm">
            <button
              onClick={handleSkipToStart}
              className="px-2 py-1.5 bg-gray-700 border-2 border-gray-500 rounded text-white hover:bg-gray-600 transition-colors"
              title="Go to start (4 hours ago)"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handlePlayPause}
              className={`px-4 py-1.5 border-2 rounded text-white font-mono text-xs font-bold transition-colors min-w-[90px] ${
                isPlaying 
                  ? 'bg-yellow-600 border-yellow-400 hover:bg-yellow-500' 
                  : 'bg-cyan-600 border-cyan-400 hover:bg-cyan-500'
              }`}
            >
              {isPlaying ? (
                <><Pause className="w-4 h-4 inline mr-1" /> PAUSE</>
              ) : (
                <><Play className="w-4 h-4 inline mr-1" /> PLAY</>
              )}
            </button>

            <button
              onClick={handleSkipToEnd}
              className="px-2 py-1.5 bg-gray-700 border-2 border-gray-500 rounded text-white hover:bg-gray-600 transition-colors"
              title="Go to end (now)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Speed Controls */}
            <div className="flex gap-1 ml-1 border-l-2 border-gray-600 pl-2">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s as 0.5 | 1 | 2)}
                  className={`px-2 py-1 border-2 rounded font-mono text-xs font-bold transition-colors ${
                    speed === s
                      ? 'bg-cyan-600 border-cyan-400 text-white'
                      : 'bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Time Display */}
            <div className="ml-2 border-l-2 border-gray-600 pl-2 text-center min-w-[80px]">
              <span className={`font-mono text-xs font-bold ${isLiveFrame ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
                {relativeTime}
              </span>
            </div>
          </div>

          {/* Timeline Slider */}
          <div className="w-[500px] max-w-[90vw] px-3 py-1.5 bg-gray-900/95 border-2 border-gray-600 rounded-md shadow-xl backdrop-blur-sm">
            <input
              type="range"
              min="0"
              max={timestamps.length - 1}
              value={frameIndex}
              onChange={(e) => {
                setIsPlaying(false)
                setFrameIndex(parseInt(e.target.value))
              }}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(frameIndex / (timestamps.length - 1)) * 100}%, #374151 ${(frameIndex / (timestamps.length - 1)) * 100}%, #374151 100%)`
              }}
            />
            <div className="mt-1 flex justify-between items-center font-mono text-[10px] text-gray-400">
              <span>4h ago</span>
              <span>Frame {frameIndex + 1}/{timestamps.length}</span>
              <span>Now</span>
            </div>
          </div>
        </div>
      )}

      {/* No Radar Message for International */}
      {!isUSLocation && activeLayers.precipitation && (
        <div className="absolute inset-0 flex items-center justify-center z-[2000] pointer-events-none">
          <div className="bg-gray-800/95 border-2 border-gray-600 rounded-lg p-6 max-w-md text-center">
            <div className="text-2xl font-mono font-bold text-white mb-2">
              🌎 HIGH-RESOLUTION RADAR UNAVAILABLE
            </div>
            <div className="text-sm text-gray-300 mb-4">
              Animated radar is only available for US locations.
            </div>
            <div className="text-xs text-gray-400">
              Current conditions and forecasts are still available above.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WeatherMapOpenLayers
