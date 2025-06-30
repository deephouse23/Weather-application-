"use client"

import { useState } from 'react'
import NavBar from '@/components/nav-bar'

export default function RadarPage() {
  const [selectedMap, setSelectedMap] = useState('precipitation')
  const [isLoading, setIsLoading] = useState(false)

  const mapTypes = [
    { id: 'precipitation', name: 'PRECIPITATION', emoji: '🌧️' },
    { id: 'temperature', name: 'TEMPERATURE', emoji: '🌡️' },
    { id: 'wind', name: 'WIND SPEED', emoji: '💨' },
    { id: 'pressure', name: 'PRESSURE', emoji: '📊' },
    { id: 'clouds', name: 'CLOUD COVER', emoji: '☁️' },
    { id: 'humidity', name: 'HUMIDITY', emoji: '💧' }
  ]

  const handleMapChange = (mapType: string) => {
    setIsLoading(true)
    setSelectedMap(mapType)
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400">
      <NavBar />
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-mono uppercase tracking-wider">
              16-BIT WEATHER RADAR
            </h1>
            <p className="text-lg text-cyan-600 font-mono mb-6">
              Real-time atmospheric monitoring system • Interactive weather maps
            </p>
          </div>

          {/* Map Type Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {mapTypes.map(mapType => (
              <button
                key={mapType.id}
                onClick={() => handleMapChange(mapType.id)}
                className={`px-6 py-3 font-mono text-sm border-2 transition-all duration-200 flex items-center gap-2 ${
                  selectedMap === mapType.id
                    ? 'border-cyan-400 bg-cyan-400 text-black'
                    : 'border-cyan-600 text-cyan-400 hover:border-cyan-400'
                }`}
              >
                <span className="text-lg">{mapType.emoji}</span>
                <span>{mapType.name}</span>
              </button>
            ))}
          </div>

          {/* Radar Display */}
          <div className="border-2 border-cyan-400 p-6 mb-8">
            <div className="aspect-video bg-gray-900 border border-cyan-400/30 flex items-center justify-center relative">
              {isLoading ? (
                <div className="text-center">
                  <div className="text-4xl mb-4 animate-pulse">🔄</div>
                  <div className="font-mono text-lg">LOADING RADAR DATA...</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {mapTypes.find(m => m.id === selectedMap)?.emoji}
                  </div>
                  <div className="font-mono text-2xl mb-2">
                    {mapTypes.find(m => m.id === selectedMap)?.name} RADAR
                  </div>
                  <div className="text-cyan-600 font-mono text-sm">
                    Interactive weather map display
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-4 text-xs font-mono">
                    <div className="border border-cyan-400/30 p-2">
                      <div className="text-cyan-300">LATITUDE</div>
                      <div>40.7128°N</div>
                    </div>
                    <div className="border border-cyan-400/30 p-2">
                      <div className="text-cyan-300">LONGITUDE</div>
                      <div>74.0060°W</div>
                    </div>
                    <div className="border border-cyan-400/30 p-2">
                      <div className="text-cyan-300">ZOOM</div>
                      <div>LEVEL 8</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Radar Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="border-2 border-cyan-400 p-4">
              <h3 className="text-lg font-mono font-bold mb-4 text-center">🎮 CONTROLS</h3>
              <div className="space-y-2 text-sm font-mono">
                <div>• CLICK: Zoom in/out</div>
                <div>• DRAG: Pan map</div>
                <div>• SCROLL: Adjust zoom</div>
                <div>• DOUBLE-CLICK: Reset view</div>
              </div>
            </div>

            <div className="border-2 border-cyan-400 p-4">
              <h3 className="text-lg font-mono font-bold mb-4 text-center">📡 DATA SOURCES</h3>
              <div className="space-y-2 text-sm font-mono">
                <div>• NOAA Weather Radar</div>
                <div>• Satellite Imagery</div>
                <div>• Surface Stations</div>
                <div>• Weather Models</div>
              </div>
            </div>

            <div className="border-2 border-cyan-400 p-4">
              <h3 className="text-lg font-mono font-bold mb-4 text-center">⚡ UPDATE FREQUENCY</h3>
              <div className="space-y-2 text-sm font-mono">
                <div>• Radar: Every 5 min</div>
                <div>• Satellite: Every 15 min</div>
                <div>• Surface: Every 1 min</div>
                <div>• Models: Every 6 hours</div>
              </div>
            </div>

            <div className="border-2 border-cyan-400 p-4">
              <h3 className="text-lg font-mono font-bold mb-4 text-center">🎯 FEATURES</h3>
              <div className="space-y-2 text-sm font-mono">
                <div>• Real-time updates</div>
                <div>• Multiple layers</div>
                <div>• Historical data</div>
                <div>• Forecast overlay</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="border-2 border-cyan-400 p-6">
            <h2 className="text-2xl font-mono font-bold mb-6 text-center">
              🎨 RADAR LEGEND
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-mono font-bold mb-4 text-cyan-300">🌧️ PRECIPITATION:</h3>
                <div className="space-y-1 text-sm font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-400"></div>
                    <span>Light Rain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-400"></div>
                    <span>Moderate Rain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400"></div>
                    <span>Heavy Rain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-400"></div>
                    <span>Severe Storm</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-mono font-bold mb-4 text-cyan-300">🌡️ TEMPERATURE:</h3>
                <div className="space-y-1 text-sm font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600"></div>
                    <span>Below Freezing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-cyan-400"></div>
                    <span>Cold</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400"></div>
                    <span>Warm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600"></div>
                    <span>Hot</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-mono font-bold mb-4 text-cyan-300">💨 WIND SPEED:</h3>
                <div className="space-y-1 text-sm font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-400"></div>
                    <span>Light Breeze</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400"></div>
                    <span>Moderate Wind</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-400"></div>
                    <span>Strong Wind</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-400"></div>
                    <span>Hurricane Force</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-cyan-400 text-black px-4 py-2 font-mono text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              RADAR SYSTEM ONLINE
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 