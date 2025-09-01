'use client'

import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState } from 'react'

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface WeatherMapProps {
  latitude?: number
  longitude?: number
  locationName?: string
  theme?: 'dark' | 'miami' | 'tron'
}

const WeatherMap = ({ latitude, longitude, locationName, theme = 'dark' }: WeatherMapProps) => {
  const [map, setMap] = useState<L.Map | null>(null)
  const position: [number, number] = [latitude || 39.8283, longitude || -98.5795] // Default to US center
  
  useEffect(() => {
    if (map && latitude && longitude) {
      map.setView([latitude, longitude], 10)
    }
  }, [map, latitude, longitude])

  // Theme-based styles
  const getThemeStyles = () => {
    switch(theme) {
      case 'miami':
        return {
          container: 'border-4 border-pink-500 shadow-lg shadow-pink-500/50',
          overlay: 'bg-gradient-to-t from-purple-900/20 to-transparent'
        }
      case 'tron':
        return {
          container: 'border-2 border-cyan-400 shadow-lg shadow-cyan-400/50',
          overlay: 'bg-gradient-to-t from-cyan-900/20 to-transparent'
        }
      default:
        return {
          container: 'border-2 border-gray-600 shadow-lg',
          overlay: ''
        }
    }
  }

  const themeStyles = getThemeStyles()

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
          <LayersControl.Overlay checked name="Weather Radar">
            <TileLayer
              attribution='&copy; <a href="https://www.openweathermap.org/">OpenWeatherMap</a>'
              url={`/api/weather/radar/{z}/{x}/{y}`}
              opacity={0.7}
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Precipitation">
            <TileLayer
              attribution='&copy; <a href="https://www.openweathermap.org/">OpenWeatherMap</a>'
              url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`}
              opacity={0.6}
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Temperature">
            <TileLayer
              attribution='&copy; <a href="https://www.openweathermap.org/">OpenWeatherMap</a>'
              url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`}
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
    </div>
  )
}

export default WeatherMap
