'use client'

import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    precipitation_new: true,
    clouds_new: false,
    wind_new: false,
    pressure_new: false,
    temp_new: false,
  })
  const [opacity, setOpacity] = useState(0.7)

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

          {LAYERS.map(l => (
            <LayersControl.Overlay key={l.key} checked={activeLayers[l.key]} name={l.name}>
              <TileLayer
                attribution='&copy; <a href="https://www.openweathermap.org/">OpenWeatherMap</a>'
                url={`/api/weather/radar/${l.key}/{z}/{x}/{y}`}
                opacity={opacity}
              />
            </LayersControl.Overlay>
          ))}
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

      {themeStyles.overlay && (
        <div className={`absolute inset-0 pointer-events-none ${themeStyles.overlay}`} />
      )}
    </div>
  )
}

export default WeatherMapClient