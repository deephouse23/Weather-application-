// @ts-nocheck
'use client'

import { MapContainer, TileLayer, Marker, Popup, LayersControl, Pane } from 'react-leaflet'
import PrecipCanvasLayer from './precip-canvas-layer'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

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
  theme?: 'dark' | 'miami' | 'tron'
  initialZoom?: number
}

const LAYERS = [
  { key: 'precipitation_new', name: 'Precipitation' },
  { key: 'clouds_new', name: 'Clouds' },
  { key: 'wind_new', name: 'Wind' },
  { key: 'pressure_new', name: 'Pressure' },
  { key: 'temp_new', name: 'Temperature' },
]

const WeatherMapClient = ({ latitude, longitude, locationName, theme = 'dark', initialZoom }: WeatherMapProps) => {
  const [map, setMap] = useState<L.Map | null>(null)
  const position: [number, number] = [latitude || 39.8283, longitude || -98.5795]
  const zoomLevel = typeof initialZoom === 'number' ? initialZoom : 10

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    precipitation_new: true,
    clouds_new: false,
    wind_new: false,
    pressure_new: false,
    temp_new: false,
  })
  const [opacity, setOpacity] = useState(0.8)

  // --- Phase 3: Time-lapse state ---
  const STEP_MINUTES = 10 // OpenWeather tiles typically update in 10-minute steps
  const PAST_STEPS = 6 // 1 hour past (6 x 10min)
  const FUTURE_STEPS = 12 // ~2 hours future (12 x 10min)
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
      map.setView([latitude, longitude], zoomLevel)
    }
  }, [map, latitude, longitude, zoomLevel])

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
  }, [frameTimes.length])

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden ${themeStyles.container}`}>
      <MapContainer 
        center={position} 
        zoom={zoomLevel} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
      >
        {/* Explicit panes enforce z-order: base < clouds < precip < UI */}
        <Pane name="basemap" style={{ zIndex: 200 }} />
        <Pane name="clouds" style={{ zIndex: 400 }} />
        <Pane name="precip" style={{ zIndex: 500 }} />
        <Pane name="labels" style={{ zIndex: 650, pointerEvents: 'none' as unknown as string }} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="grayscale contrast-125"
              pane="basemap"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              pane="basemap"
            />
          </LayersControl.BaseLayer>

          {/* Static layers (non-animated) */}
          {LAYERS.filter(l => l.key !== 'precipitation_new').map(l => (
            <LayersControl.Overlay key={l.key} checked={activeLayers[l.key]} name={l.name}>
              <TileLayer
                attribution='&copy; <a href="https://www.openweathermap.org/">OpenWeatherMap</a>'
                url={`/api/weather/radar/${l.key}/{z}/{x}/{y}`}
                opacity={l.key === 'clouds_new' ? 0.45 : 0.6}
                className={l.key === 'clouds_new' ? 'cloud-tiles' : undefined}
                pane={l.key === 'clouds_new' ? 'clouds' : 'clouds'}
              />
            </LayersControl.Overlay>
          ))}

          {/* Animated precipitation layer with preloaded frames (quantized buckets) */}
          {activeLayers['precipitation_new'] && (
            <LayersControl.Overlay checked name="Precipitation (Animated)">
              <>
                {bufferedTimes.map((t: number) => (
                  <PrecipCanvasLayer
                    key={`precip-${tileEpoch}-${t}`}
                    time={t}
                    opacity={t === currentTimestamp ? opacity : Math.max(0, Math.min(0.15, opacity * 0.2))}
                    pane="precip"
                    zIndex={500}
                  />
                ))}
              </>
            </LayersControl.Overlay>
          )}
        </LayersControl>

        {/* Labels-only pane above precip to keep roads/city names readable */}
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url={theme === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png' : 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png'}
          pane="labels"
          className="label-tiles"
        />

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

      {/* Legend (Reflectivity dBZ) */}
      <div className="absolute right-2 bottom-2 z-[1001]">
        <div className="rounded border border-white/20 bg-black/75 text-[11px] text-white/90 p-2 font-mono select-none">
          <div className="mb-1 text-[10px] uppercase tracking-wide opacity-80">Reflectivity (dBZ)</div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 rounded-sm" style={{ background: '#b7e4ff' }} title="10–20 dBZ very light" />
            <div className="w-4 h-3 rounded-sm" style={{ background: '#7fd2ff' }} title="20–30 dBZ light" />
            <div className="w-4 h-3 rounded-sm" style={{ background: '#4fb6ff' }} title="30–40 dBZ moderate" />
            <div className="w-4 h-3 rounded-sm" style={{ background: '#2f85ff' }} title="40–50 dBZ heavy" />
            <div className="w-4 h-3 rounded-sm" style={{ background: '#d24d4d' }} title="50–60 dBZ very heavy" />
            <div className="w-4 h-3 rounded-sm" style={{ background: '#8b0000' }} title=">=60 dBZ extreme" />
          </div>
          <div className="mt-1 flex justify-between text-[10px] opacity-75">
            <span>10</span><span>20</span><span>30</span><span>40</span><span>50</span><span>60+</span>
          </div>
        </div>
      </div>

      {/* Layer controls */}
      <div className="absolute left-2 top-2 z-[1000]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-2 py-1 text-xs border rounded bg-black/60 text-white">Layers</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {LAYERS.map(l => (
              <DropdownMenuItem key={l.key} onClick={() => toggleLayer(l.key)}>
                <span className={`inline-block w-3 h-3 mr-2 rounded ${activeLayers[l.key] ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                {l.name}
              </DropdownMenuItem>
            ))}
            <div className="px-2 py-1 text-xs text-muted-foreground">Opacity: {(opacity*100)|0}%</div>
            <div className="px-2 pb-2">
              <input type="range" min={0.3} max={1} step={0.05} value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} className="w-full" />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Animation controls */}
      <div className="absolute left-2 bottom-2 z-[1000] flex items-center gap-2 bg-black/60 p-2 rounded">
        <Button size="sm" variant="secondary" aria-label={isPlaying ? 'Pause animation (Space)' : 'Play animation (Space)'} onClick={() => setIsPlaying(p => !p)}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button size="sm" variant="secondary" aria-label="Snap to current time" onClick={goNow}>Now</Button>
        <div className="text-xs text-white/80 px-1" aria-live="polite" title="Frame time (UTC)">{humanTime}</div>
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

      {themeStyles.overlay && (
        <div className={`absolute inset-0 pointer-events-none ${themeStyles.overlay}`} />
      )}
    </div>
  )
}

export default WeatherMapClient