'use client'

import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { WMSTileLayer } from './WMSTileLayer'
import { isInMRMSCoverage } from '@/lib/utils/location-utils'
import { Activity, AlertCircle, Info } from 'lucide-react'
import { ThemeType } from '@/lib/theme-config'

// Fix for default icon issue with webpack
let iconsInitialized = false

if (typeof window !== 'undefined' && !iconsInitialized) {
  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
  
  iconsInitialized = true
}

interface WeatherMapProps {
  latitude?: number
  longitude?: number
  locationName?: string
  theme?: ThemeType
}

const LAYERS = [
  { key: 'precipitation_new', name: 'Precipitation' },
  { key: 'clouds_new', name: 'Clouds' },
  { key: 'wind_new', name: 'Wind' },
  { key: 'pressure_new', name: 'Pressure' },
  { key: 'temp_new', name: 'Temperature' },
]

const WeatherMapClient = ({ latitude, longitude, locationName, theme = 'dark' }: WeatherMapProps) => {
  const [map, setMap] = useState<L.Map | null>(null)
  const position: [number, number] = [latitude || 39.8283, longitude || -98.5795]
  
  // Debug logging
  useEffect(() => {
    console.log('WeatherMap props received:', { latitude, longitude, locationName })
    console.log('isUSLocation:', latitude && longitude ? isInMRMSCoverage(latitude, longitude) : 'no coordinates')
  }, [latitude, longitude, locationName])

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    precipitation_new: true,
    clouds_new: false,
    wind_new: false,
    pressure_new: false,
    temp_new: false,
  })
  const [opacity, setOpacity] = useState(0.85)

  // MRMS (NOAA Multi-Radar/Multi-Sensor) - US only, high quality, FREE
  // This is the ONLY radar source - no fallback to OpenWeather
  const isUSLocation = useMemo(() => {
    if (!latitude || !longitude) return false
    return isInMRMSCoverage(latitude, longitude)
  }, [latitude, longitude])

  const [mrmsOpacity, setMrmsOpacity] = useState(0.85)

  // --- Phase 3: Time-lapse state ---
  const STEP_MINUTES = 10 // OpenWeather tiles typically update in 10-minute steps
  const PAST_STEPS = 6 // 1 hour past (6 x 10min)
  const FUTURE_STEPS = 12 // ~2 hours future (12 x 10min)

  // MRMS-specific time index (4-hour rolling window, past only)
  const MRMS_STEP_MINUTES = 10
  const MRMS_PAST_STEPS = 24 // 4 hours past (24 x 10min) - NOAA's rolling window
  const [frameTimes, setFrameTimes] = useState<number[]>([])
  const [frameIndex, setFrameIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1) // playback speed multiplier
  const timerRef = useRef<number | null>(null)
  const lastNowRef = useRef<number>(0)

  const quantizeToStep = (ms: number, stepMinutes: number) => {
    const stepMs = stepMinutes * 60 * 1000
    return Math.floor(ms / stepMs) * stepMs
  }

  const buildTimeIndex = useCallback(() => {
    const now = Date.now()
    lastNowRef.current = now
    const base = quantizeToStep(now, STEP_MINUTES)
    const past: number[] = []
    for (let i = PAST_STEPS; i > 0; i -= 1) past.push(base - i * STEP_MINUTES * 60 * 1000)
    const future: number[] = []
    for (let i = 0; i <= FUTURE_STEPS; i += 1) future.push(base + i * STEP_MINUTES * 60 * 1000)
    const frames = [...past, ...future]
    setFrameTimes(frames)
    // place the index at "now" (first element of future array inside frames)
    setFrameIndex(past.length)
  }, [])

  useEffect(() => {
    buildTimeIndex()
    const id = setInterval(() => {
      // Rebuild index roughly every 5 minutes to follow the wall clock
      buildTimeIndex()
    }, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [buildTimeIndex])

  // Playback timer
  useEffect(() => {
    if (!isPlaying || frameTimes.length === 0) return
    const baseInterval = 600 // ms per frame at 1x
    const interval = baseInterval / speed
    const handle = window.setInterval(() => {
      setFrameIndex((idx) => (idx + 1) % frameTimes.length)
    }, interval)
    timerRef.current = handle as unknown as number
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [isPlaying, speed, frameTimes])

  const currentTimestamp = frameTimes[frameIndex]
  const humanTime = useMemo(() => {
    if (!currentTimestamp) return ''
    const d = new Date(currentTimestamp)
    return d.toUTCString().replace(' GMT', '')
  }, [currentTimestamp])

  useEffect(() => {
    if (map && latitude && longitude) {
      map.setView([latitude, longitude], 10)
    }
  }, [map, latitude, longitude])

  const themeStyles = useMemo(() => {
    switch(theme) {
      case 'miami':
        return { container: 'border-4 border-pink-500 shadow-lg shadow-pink-500/50', overlay: 'bg-gradient-to-t from-purple-900/20 to-transparent' }
      case 'tron':
        return { container: 'border-2 border-cyan-400 shadow-lg shadow-cyan-400/50', overlay: 'bg-gradient-to-t from-cyan-900/20 to-transparent' }
      default:
        return { container: 'border-2 border-gray-600 shadow-lg', overlay: '' }
    }
  }, [theme])

  const toggleLayer = (key: string) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const goNow = () => {
    // Snap to the frame closest to current quantized now
    const nowQ = quantizeToStep(Date.now(), STEP_MINUTES)
    let closest = 0
    let minDiff = Number.MAX_SAFE_INTEGER
    frameTimes.forEach((t, i) => {
      const diff = Math.abs(t - nowQ)
      if (diff < minDiff) { minDiff = diff; closest = i }
    })
    setFrameIndex(closest)
  }

  // Preload buffer around current frame for smooth cross-fade
  const PRELOAD_RADIUS = 2 // keep ±2 buffered
  const bufferedTimes = useMemo(() => {
    if (frameTimes.length === 0) return [] as number[]
    const start = Math.max(0, frameIndex - PRELOAD_RADIUS)
    const end = Math.min(frameTimes.length - 1, frameIndex + PRELOAD_RADIUS)
    return frameTimes.slice(start, end + 1)
  }, [frameTimes, frameIndex])

  // MRMS-specific buffered times (uses 4-hour past window instead of past+future)
  const mrmsBufferedTimes = useMemo(() => {
    if (!isUSLocation) return []
    const now = Date.now()
    const base = quantizeToStep(now, MRMS_STEP_MINUTES)
    const times: number[] = []
    // Generate past 4 hours
    for (let i = MRMS_PAST_STEPS; i >= 0; i -= 1) {
      times.push(base - i * MRMS_STEP_MINUTES * 60 * 1000)
    }
    // Buffer around current frame within MRMS times
    const mrmsFrameIndex = Math.min(frameIndex, times.length - 1)
    const start = Math.max(0, mrmsFrameIndex - PRELOAD_RADIUS)
    const end = Math.min(times.length - 1, mrmsFrameIndex + PRELOAD_RADIUS)
    return times.slice(start, end + 1)
  }, [isUSLocation, frameIndex])

  // Abort in-flight tile fetches on scrub by forcing a remount key
  const [tileEpoch, setTileEpoch] = useState<number>(0)
  useEffect(() => {
    // When user scrubs (frameIndex changes via input), bump epoch
    // This causes TileLayers to remount and let previous requests be GC'ed/aborted by browser
    setTileEpoch((e) => (e + 1) % Number.MAX_SAFE_INTEGER)
  }, [frameIndex])

  // Reduced FPS indicator and easing opacity
  const [reducedFps, setReducedFps] = useState<boolean>(false)
  const networkSlowRef = useRef<number>(0)
  useEffect(() => {
    const handler = () => {
      // naive heuristic: if 3+ rapid frame changes within 500ms (likely scrub), show reduced FPS for 3s
      const now = performance.now()
      if (now - networkSlowRef.current < 500) setReducedFps(true)
      networkSlowRef.current = now
      const id = setTimeout(() => setReducedFps(false), 3000)
      return () => clearTimeout(id)
    }
    // listen to index changes
    handler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameIndex])

  // Keyboard accessibility: Space toggles play/pause, ArrowLeft/Right scrubs
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isUSLocation || !activeLayers['precipitation_new']) return // Only allow keyboard controls for US locations with radar active
      
      if (e.code === 'Space') {
        e.preventDefault()
        setIsPlaying(p => !p)
      } else if (e.code === 'ArrowRight') {
        setFrameIndex(i => Math.min(i + 1, Math.max(0, frameTimes.length - 1)))
      } else if (e.code === 'ArrowLeft') {
        setFrameIndex(i => Math.max(i - 1, 0))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [frameTimes.length, isUSLocation, activeLayers])

  // Radar Status Badge Component
  const RadarStatusBadge = () => {
    if (!activeLayers['precipitation_new']) return null
    
    if (isUSLocation) {
      return (
        <div className="bg-blue-600/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 border border-blue-400/30">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-medium text-white">NOAA MRMS • HIGH-RES • LIVE</span>
        </div>
      )
    }
    
    return (
      <div className="bg-gray-700/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-500/30">
        <AlertCircle className="w-4 h-4" />
        <span className="text-xs font-medium text-white">US LOCATIONS ONLY</span>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden ${themeStyles.container}`}>
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

          {/* Static layers (non-animated) - Always use OpenWeather */}
          {LAYERS.filter(l => l.key !== 'precipitation_new').map(l => (
            <LayersControl.Overlay key={l.key} checked={activeLayers[l.key]} name={l.name}>
              <TileLayer
                attribution='&copy; <a href="https://www.openweathermap.org/">OpenWeatherMap</a>'
                url={`/api/weather/radar/${l.key}/{z}/{x}/{y}`}
                opacity={opacity}
              />
            </LayersControl.Overlay>
          ))}

          {/* NOAA MRMS Precipitation - US Only */}
          {activeLayers['precipitation_new'] && isUSLocation && mrmsBufferedTimes.length > 0 && (
            <LayersControl.Overlay checked name="NOAA MRMS Radar">
              <>
                {mrmsBufferedTimes.map((t) => (
                  <WMSTileLayer
                    key={`mrms-${tileEpoch}-${t}`}
                    url="https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer"
                    layers="1"
                    format="image/png"
                    transparent={true}
                    opacity={t === mrmsBufferedTimes[Math.min(frameIndex, mrmsBufferedTimes.length - 1)] ? mrmsOpacity : Math.max(0, Math.min(0.15, mrmsOpacity * 0.2))}
                    time={new Date(t).toISOString()}
                    attribution='&copy; <a href="https://www.noaa.gov/">NOAA MRMS</a>'
                    zIndex={500}
                  />
                ))}
              </>
            </LayersControl.Overlay>
          )}
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

      {/* International: Show message instead of radar */}
      {activeLayers['precipitation_new'] && !isUSLocation && (
        <div className="absolute inset-0 flex items-center justify-center z-[400] bg-black/40 backdrop-blur-sm pointer-events-none">
          <div className="bg-gray-900/95 border-2 border-gray-600 rounded-lg p-6 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">High-Resolution Radar Unavailable</h3>
            <p className="text-sm text-gray-300 mb-4">
              Animated NOAA MRMS radar is only available for United States locations.
            </p>
            <p className="text-xs text-gray-400">
              Current conditions and forecasts are available in the sections above.
            </p>
          </div>
        </div>
      )}

      {/* Radar Status Badge */}
      <div className="absolute top-2 left-2 z-[1001]">
        <RadarStatusBadge />
      </div>

      {/* Layer controls */}
      <div className="absolute top-2 right-2 z-[1000]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-3 py-2 text-xs border rounded bg-black/80 text-white hover:bg-black/90 transition-colors">
              Layers
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuLabel>Radar Layers</DropdownMenuLabel>
            
            <DropdownMenuItem onClick={() => toggleLayer('precipitation_new')}>
              <span className={`inline-block w-3 h-3 mr-2 rounded ${activeLayers['precipitation_new'] ? 'bg-blue-400' : 'bg-gray-400'}`}></span>
              <div className="flex flex-col">
                <span className="font-medium">Precipitation</span>
                <span className="text-[10px] text-gray-500">NOAA MRMS • US only</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Weather Overlays</DropdownMenuLabel>
            
            {LAYERS.filter(l => l.key !== 'precipitation_new').map(l => (
              <DropdownMenuItem key={l.key} onClick={() => toggleLayer(l.key)}>
                <span className={`inline-block w-3 h-3 mr-2 rounded ${activeLayers[l.key] ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                {l.name}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-xs text-muted-foreground">
              Opacity: {mrmsOpacity * 100 | 0}%
            </div>
            <div className="px-2 pb-2">
              <input
                type="range"
                min={0.3}
                max={1}
                step={0.05}
                value={mrmsOpacity}
                onChange={e => setMrmsOpacity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Animation Controls - Always show for US locations when precipitation layer is active */}
      {isUSLocation && activeLayers['precipitation_new'] && (
        <div className="absolute left-2 bottom-2 z-[1000] flex items-center gap-2 bg-black/80 backdrop-blur-sm p-2 rounded border border-gray-600">
          <Button 
            size="sm" 
            variant="secondary" 
            aria-label={isPlaying ? 'Pause animation (Space)' : 'Play animation (Space)'} 
            onClick={() => setIsPlaying(p => !p)}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button size="sm" variant="secondary" aria-label="Snap to current time" onClick={goNow}>Now</Button>
          <div className="text-xs text-white/80 px-1 min-w-[200px]" aria-live="polite" title="Frame time (UTC)">
            {humanTime}
          </div>
          <div className="flex items-center gap-2" title="Playback speed">
            <span className="text-xs text-white/70">Speed</span>
            <ToggleGroup type="single" value={String(speed)} onValueChange={(v) => v && setSpeed(Number(v) as 0.5 | 1 | 2)}>
              <ToggleGroupItem value="0.5" aria-label="Speed 0.5x">0.5×</ToggleGroupItem>
              <ToggleGroupItem value="1" aria-label="Speed 1x">1×</ToggleGroupItem>
              <ToggleGroupItem value="2" aria-label="Speed 2x">2×</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="min-w-[160px]" title="Scrub frames (Left/Right arrows)">
            <input
              type="range"
              min={0}
              max={Math.max(0, frameTimes.length - 1)}
              step={1}
              value={frameIndex}
              onChange={(e) => setFrameIndex(parseInt(e.target.value))}
              className="w-48"
              aria-label="Scrub frames"
            />
          </div>
          {reducedFps && (
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-300/40" aria-live="polite">reduced FPS</span>
          )}
        </div>
      )}

      {themeStyles.overlay && (
        <div className={`absolute inset-0 pointer-events-none ${themeStyles.overlay}`} />
      )}
    </div>
  )
}

export default WeatherMapClient
