'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, Layers, ChevronDown, Camera, Film } from 'lucide-react'
import { isInMRMSCoverage } from '@/lib/utils/location-utils'
import { ThemeType } from '@/lib/theme-config'
import { buildRadMapUrl } from '@/lib/utils/radmap-utils'

// OpenLayers imports
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import ImageLayer from 'ol/layer/Image'
import TileWMS from 'ol/source/TileWMS'
import ImageStatic from 'ol/source/ImageStatic'
import XYZ from 'ol/source/XYZ'
import OSM from 'ol/source/OSM'
import { fromLonLat, transformExtent } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Icon } from 'ol/style'

interface WeatherMapProps {
  latitude?: number
  longitude?: number
  locationName?: string
  theme?: ThemeType
  defaultMode?: 'static' | 'animation'
}

type MapMode = 'static' | 'animation'

const WeatherMapOpenLayers = ({ 
  latitude, 
  longitude, 
  locationName, 
  theme = 'dark',
  defaultMode = 'animation'
}: WeatherMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const mrmsLayersRef = useRef<(TileLayer<TileWMS> | TileLayer<XYZ>)[]>([])
  const staticImageLayerRef = useRef<ImageLayer<ImageStatic> | null>(null)

  // Load mode preference from localStorage
  const [mode, setMode] = useState<MapMode>(() => {
    if (typeof window === 'undefined') return defaultMode
    const saved = localStorage.getItem('weather-map-mode')
    return (saved as MapMode) || defaultMode
  })

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    precipitation: true,
    clouds: false,
    wind: false,
    pressure: false,
    temperature: false,
  })
  
  const [opacity, setOpacity] = useState(0.85)
  const [layerMenuOpen, setLayerMenuOpen] = useState(false)
  const [staticImageKey, setStaticImageKey] = useState(0)

  // Animation state
  const [isPlaying, setIsPlaying] = useState(false)
  const [frameIndex, setFrameIndex] = useState(48) // Start at "now" (last frame)
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1)
  const timerRef = useRef<number | null>(null)

  // NEXRAD configuration
  // Iowa State NEXRAD data is available in 5-minute intervals
  const NEXRAD_STEP_MINUTES = 5
  const NEXRAD_PAST_STEPS = 48 // 4 hours past (5 min * 48 = 240 min = 4 hours)
  const PRELOAD_RADIUS = 2

  // Check if location is in US
  const isUSLocation = useMemo(() => {
    if (!latitude || !longitude) return false
    return isInMRMSCoverage(latitude, longitude)
  }, [latitude, longitude])

  // Generate NEXRAD timestamps
  const mrmsTimestamps = useMemo(() => {
    if (!isUSLocation) return []
    
    const now = Date.now()
    const quantize = (ms: number) => Math.floor(ms / (NEXRAD_STEP_MINUTES * 60 * 1000)) * (NEXRAD_STEP_MINUTES * 60 * 1000)
    const base = quantize(now)
    const times: number[] = []
    
    for (let i = NEXRAD_PAST_STEPS; i >= 0; i -= 1) {
      times.push(base - i * NEXRAD_STEP_MINUTES * 60 * 1000)
    }
    
    console.log(`🕐 Generated ${times.length} NEXRAD timestamps`)
    console.log('  First:', new Date(times[0]).toISOString())
    console.log('  Last:', new Date(times[times.length - 1]).toISOString())
    
    return times
  }, [isUSLocation])

  // Buffered times for preloading
  const bufferedTimes = useMemo(() => {
    if (mrmsTimestamps.length === 0) return []
    const start = Math.max(0, frameIndex - PRELOAD_RADIUS)
    const end = Math.min(mrmsTimestamps.length - 1, frameIndex + PRELOAD_RADIUS)
    return mrmsTimestamps.slice(start, end + 1)
  }, [mrmsTimestamps, frameIndex])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const centerLon = longitude || -98.5795
    const centerLat = latitude || 39.8283

    console.log('🗺️ Initializing OpenLayers map at:', centerLat, centerLon)

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

    console.log('✅ OpenLayers map initialized')

    return () => {
      map.setTarget(undefined)
      mapInstanceRef.current = null
    }
  }, []) // Only run once

  // Update map center when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return
    
    console.log('📍 Updating map center to:', latitude, longitude)
    mapInstanceRef.current.getView().setCenter(fromLonLat([longitude, latitude]))
    mapInstanceRef.current.getView().setZoom(10)
  }, [latitude, longitude])

  // Save mode preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('weather-map-mode', mode)
    }
  }, [mode])

  // Handle mode toggle
  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'static' ? 'animation' : 'static')
    if (mode === 'animation') {
      // Switching to static, pause animation
      setIsPlaying(false)
    }
  }, [mode])

  // Refresh static image
  const refreshStaticImage = useCallback(() => {
    setStaticImageKey(prev => prev + 1)
  }, [])

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
    })

    markerLayer.set('name', 'marker')
    map.addLayer(markerLayer)

    console.log('📌 Location marker added')
  }, [latitude, longitude])

  // Manage static image layer
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude || mode !== 'static' || !isUSLocation) return

    const map = mapInstanceRef.current

    // Remove existing static image layer
    if (staticImageLayerRef.current) {
      map.removeLayer(staticImageLayerRef.current)
      staticImageLayerRef.current = null
    }

    console.log('🖼️ Setting up static RadMap image layer')

    // Show entire continental USA
    // Bounds: approximately -125 to -65 longitude, 24 to 50 latitude
    const usaBounds = [-125, 24, -65, 50]
    const extent = transformExtent(usaBounds, 'EPSG:4326', 'EPSG:3857')
    
    // Use center of USA for RadMap request, with large radius to cover entire country
    const usaCenterLon = -95
    const usaCenterLat = 37
    const radiusDegrees = 30 // Large radius to cover entire USA

    // Build RadMap URL
    const radmapUrl = buildRadMapUrl({
      latitude: usaCenterLat,
      longitude: usaCenterLon,
      width: 2048,
      height: 1536,
      layers: ['nexrad', 'uscounties'],
      radiusDegrees
    })

    console.log('  RadMap URL:', radmapUrl)

    // Create static image source
    const imageSource = new ImageStatic({
      url: radmapUrl,
      imageExtent: extent,
      crossOrigin: 'anonymous',
    })

    // Create image layer
    const imageLayer = new ImageLayer({
      source: imageSource,
      opacity: opacity,
      zIndex: 500,
    })

    imageLayer.set('name', 'static-radmap')
    map.addLayer(imageLayer)
    staticImageLayerRef.current = imageLayer

    console.log('✅ Static RadMap layer added')

    return () => {
      if (staticImageLayerRef.current) {
        map.removeLayer(staticImageLayerRef.current)
        staticImageLayerRef.current = null
      }
    }
  }, [latitude, longitude, mode, isUSLocation, opacity, staticImageKey])

  // Manage MRMS WMS layers (only in animation mode)
  useEffect(() => {
    if (!mapInstanceRef.current || !isUSLocation || !activeLayers.precipitation || mode !== 'animation') {
      // Remove existing MRMS layers
      mrmsLayersRef.current.forEach(layer => {
        mapInstanceRef.current?.removeLayer(layer)
      })
      mrmsLayersRef.current = []
      return
    }

    const map = mapInstanceRef.current

    console.log('🎯 Setting up NEXRAD WMS layers')
    console.log('  Buffered times:', bufferedTimes.length)
    console.log('  Current frame:', frameIndex)

    // Remove existing NEXRAD layers
    mrmsLayersRef.current.forEach(layer => {
      map.removeLayer(layer)
    })
    mrmsLayersRef.current = []

    // Create new NEXRAD layers for buffered times
    bufferedTimes.forEach((timestamp, idx) => {
      const timeISO = new Date(timestamp).toISOString()
      const isCurrentFrame = idx === Math.min(frameIndex - (frameIndex - PRELOAD_RADIUS), bufferedTimes.length - 1)
      const layerOpacity = isCurrentFrame ? opacity : 0.15

      console.log(`  🗺️ Creating NEXRAD layer ${idx}:`, {
        time: timeISO,
        isCurrentFrame,
        opacity: layerOpacity
      })

      // Use Iowa State's WMS service for historical radar data
      // TMS tiles (nexrad-n0q) only work for current data, not historical timestamps
      const wmsSource = new TileWMS({
        url: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi',
        params: {
          'LAYERS': 'nexrad-n0q-900913',
          'FORMAT': 'image/png',
          'TRANSPARENT': true,
          'TIME': timeISO,
        },
        serverType: 'mapserver',
        transition: 0,
        crossOrigin: 'anonymous',
      })
      
      console.log(`  ✅ WMS source created for timestamp: ${timeISO}`)

      const radarLayer = new TileLayer({
        source: wmsSource,
        opacity: layerOpacity,
        zIndex: 500,
      })

      radarLayer.set('name', `nexrad-${timestamp}`)
      radarLayer.set('timestamp', timestamp)

      map.addLayer(radarLayer)
      mrmsLayersRef.current.push(radarLayer)
    })

    console.log(`✅ Added ${mrmsLayersRef.current.length} NEXRAD layers`)
  }, [bufferedTimes, frameIndex, isUSLocation, activeLayers.precipitation, opacity, mode])

  // Update layer opacities when frame changes
  useEffect(() => {
    if (!mapInstanceRef.current || mrmsLayersRef.current.length === 0) return

    const currentTimestamp = mrmsTimestamps[frameIndex]
    
    mrmsLayersRef.current.forEach(layer => {
      const layerTimestamp = layer.get('timestamp')
      const isCurrentFrame = layerTimestamp === currentTimestamp
      layer.setOpacity(isCurrentFrame ? opacity : 0.15)
    })
  }, [frameIndex, opacity, mrmsTimestamps])

  // Animation playback
  useEffect(() => {
    if (!isPlaying || mrmsTimestamps.length === 0) return

    const baseInterval = 600
    const interval = baseInterval / speed

    const handle = window.setInterval(() => {
      setFrameIndex((idx) => (idx + 1) % mrmsTimestamps.length)
    }, interval)

    timerRef.current = handle as unknown as number

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, speed, mrmsTimestamps])

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isUSLocation || !activeLayers.precipitation) return

      if (e.code === 'Space') {
        e.preventDefault()
        setIsPlaying(prev => !prev)
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        setFrameIndex(prev => Math.max(0, prev - 1))
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        setFrameIndex(prev => Math.min(mrmsTimestamps.length - 1, prev + 1))
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isUSLocation, activeLayers.precipitation, mrmsTimestamps.length])

  const currentTime = mrmsTimestamps[frameIndex]
  const humanTime = currentTime ? new Date(currentTime).toUTCString().replace(' GMT', '') : ''

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

  return (
    <div className={`relative w-full h-[600px] rounded-lg overflow-hidden ${themeStyles.container}`}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full bg-gray-900" />

      {/* Status Badge */}
      <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-md border-2 font-mono text-xs font-bold z-10 ${themeStyles.badge}`}>
        {isUSLocation ? (
          mode === 'static' ? (
            <span>📷 STATIC • IOWA STATE</span>
          ) : (
            <span>🎬 ANIMATION • NEXRAD</span>
          )
        ) : (
          <span>🌎 US LOCATIONS ONLY</span>
        )}
      </div>

      {/* Mode Toggle and Layer Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {/* Mode Toggle */}
        {isUSLocation && (
          <button
            onClick={toggleMode}
            className={`flex items-center gap-2 px-3 py-1.5 border-2 rounded-md font-mono text-xs font-bold transition-colors ${
              mode === 'static'
                ? 'bg-cyan-600 border-cyan-500 text-white hover:bg-cyan-700'
                : 'bg-gray-800/90 border-gray-600 text-white hover:bg-gray-700'
            }`}
            title={mode === 'static' ? 'Switch to Animation mode' : 'Switch to Static mode'}
          >
            {mode === 'static' ? (
              <><Camera className="w-4 h-4" /> STATIC</>
            ) : (
              <><Film className="w-4 h-4" /> ANIM</>
            )}
          </button>
        )}

        {/* Layer Controls */}
        <button
          onClick={() => setLayerMenuOpen(!layerMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/90 text-white border-2 border-gray-600 rounded-md font-mono text-xs font-bold hover:bg-gray-700 transition-colors"
        >
          <Layers className="w-4 h-4" />
          LAYERS
          <ChevronDown className={`w-4 h-4 transition-transform ${layerMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {layerMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800/95 border-2 border-gray-600 rounded-md overflow-hidden">
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
          </div>
        )}
      </div>

      {/* Animation Controls - Only for US locations with precipitation active in animation mode */}
      {isUSLocation && activeLayers.precipitation && mrmsTimestamps.length > 0 && mode === 'animation' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          {/* Timeline */}
          <div className="w-[600px] px-4 py-2 bg-gray-800/90 border-2 border-gray-600 rounded-md">
            <input
              type="range"
              min="0"
              max={mrmsTimestamps.length - 1}
              value={frameIndex}
              onChange={(e) => setFrameIndex(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(frameIndex / (mrmsTimestamps.length - 1)) * 100}%, #374151 ${(frameIndex / (mrmsTimestamps.length - 1)) * 100}%, #374151 100%)`
              }}
            />
            <div className="mt-1 text-center font-mono text-xs text-white">
              {humanTime}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFrameIndex(0)}
              className="px-2 py-1.5 bg-gray-800/90 border-2 border-gray-600 rounded text-white hover:bg-gray-700 transition-colors"
              title="Go to start"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-1.5 bg-cyan-600 border-2 border-cyan-500 rounded text-white font-mono text-xs font-bold hover:bg-cyan-700 transition-colors"
            >
              {isPlaying ? (
                <><Pause className="w-4 h-4 inline mr-1" /> PAUSE</>
              ) : (
                <><Play className="w-4 h-4 inline mr-1" /> PLAY</>
              )}
            </button>

            <button
              onClick={() => setFrameIndex(mrmsTimestamps.length - 1)}
              className="px-2 py-1.5 bg-gray-800/90 border-2 border-gray-600 rounded text-white hover:bg-gray-700 transition-colors"
              title="Go to end (now)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="flex gap-1 ml-2">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s as 0.5 | 1 | 2)}
                  className={`px-2 py-1 border-2 rounded font-mono text-xs font-bold transition-colors ${
                    speed === s
                      ? 'bg-cyan-600 border-cyan-500 text-white'
                      : 'bg-gray-800/90 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Radar Message for International */}
      {!isUSLocation && activeLayers.precipitation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
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

