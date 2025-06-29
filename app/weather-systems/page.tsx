"use client"

import { useState } from 'react'
import NavBar from '@/components/nav-bar'

interface WeatherSystem {
  id: string
  name: string
  description: string
  characteristics: string[]
  examples: string[]
  color: string
}

const weatherSystems: WeatherSystem[] = [
  {
    id: 'high-pressure',
    name: 'High Pressure Systems',
    description: 'Areas where atmospheric pressure is higher than surrounding areas. Air descends and spreads outward.',
    characteristics: [
      'Clear skies and fair weather',
      'Clockwise rotation in Northern Hemisphere',
      'Dry, stable air masses',
      'Light winds near the center'
    ],
    examples: [
      'Bermuda High',
      'Pacific High',
      'Siberian High'
    ],
    color: 'text-green-400'
  },
  {
    id: 'low-pressure',
    name: 'Low Pressure Systems',
    description: 'Areas where atmospheric pressure is lower than surrounding areas. Air rises and converges.',
    characteristics: [
      'Cloudy skies and precipitation',
      'Counter-clockwise rotation in Northern Hemisphere',
      'Unstable air masses',
      'Strong winds and storms'
    ],
    examples: [
      'Extratropical cyclones',
      'Tropical cyclones',
      'Nor\'easters'
    ],
    color: 'text-red-400'
  },
  {
    id: 'fronts',
    name: 'Weather Fronts',
    description: 'Boundaries between different air masses with distinct temperature and humidity characteristics.',
    characteristics: [
      'Sharp temperature changes',
      'Wind direction shifts',
      'Precipitation patterns',
      'Pressure changes'
    ],
    examples: [
      'Cold fronts',
      'Warm fronts',
      'Stationary fronts',
      'Occluded fronts'
    ],
    color: 'text-blue-400'
  },
  {
    id: 'jet-streams',
    name: 'Jet Streams',
    description: 'Narrow bands of strong winds in the upper atmosphere that influence weather patterns.',
    characteristics: [
      'High-altitude winds (30,000-40,000 ft)',
      'Speeds of 100-200 mph',
      'Meandering paths',
      'Seasonal variations'
    ],
    examples: [
      'Polar jet stream',
      'Subtropical jet stream',
      'Arctic jet stream'
    ],
    color: 'text-yellow-400'
  }
]

export default function WeatherSystemsPage() {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-black text-cyan-400">
      <NavBar />
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 font-mono border-b-2 border-cyan-500 pb-4">
              WEATHER SYSTEMS
            </h1>
            <p className="text-lg text-cyan-300 max-w-3xl mx-auto">
              Explore the fundamental atmospheric systems that drive weather patterns across our planet.
              From high pressure zones to jet streams, understand how these systems interact to create our daily weather.
            </p>
          </div>

          {/* Interactive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {weatherSystems.map((system) => (
              <div
                key={system.id}
                className={`bg-gray-900 border-2 border-cyan-500 p-6 rounded-lg cursor-pointer transition-all duration-300 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20 ${
                  selectedSystem === system.id ? 'border-cyan-300 shadow-lg shadow-cyan-500/20' : ''
                }`}
                onClick={() => setSelectedSystem(selectedSystem === system.id ? null : system.id)}
              >
                <h3 className={`text-xl font-bold mb-3 font-mono ${system.color}`}>
                  {system.name}
                </h3>
                <p className="text-sm text-cyan-300 mb-4">
                  {system.description}
                </p>
                <div className="text-xs text-cyan-500">
                  Click for details →
                </div>
              </div>
            ))}
          </div>

          {/* Detailed View */}
          {selectedSystem && (
            <div className="bg-gray-900 border-2 border-cyan-500 p-8 rounded-lg mb-8">
              {(() => {
                const system = weatherSystems.find(s => s.id === selectedSystem)
                if (!system) return null
                
                return (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className={`text-3xl font-bold font-mono ${system.color}`}>
                        {system.name}
                      </h2>
                      <button
                        onClick={() => setSelectedSystem(null)}
                        className="text-cyan-400 hover:text-cyan-300 font-mono text-sm border border-cyan-500 px-4 py-2 rounded hover:bg-cyan-500 hover:text-black transition-all duration-200"
                      >
                        CLOSE
                      </button>
                    </div>
                    
                    <p className="text-lg text-cyan-300 mb-6">
                      {system.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Characteristics */}
                      <div>
                        <h3 className="text-xl font-bold mb-4 font-mono text-cyan-400 border-b border-cyan-500 pb-2">
                          Key Characteristics
                        </h3>
                        <ul className="space-y-2">
                          {system.characteristics.map((char, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-cyan-500 mr-2">▶</span>
                              <span className="text-cyan-300">{char}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Examples */}
                      <div>
                        <h3 className="text-xl font-bold mb-4 font-mono text-cyan-400 border-b border-cyan-500 pb-2">
                          Real-World Examples
                        </h3>
                        <ul className="space-y-2">
                          {system.examples.map((example, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-cyan-500 mr-2">●</span>
                              <span className="text-cyan-300">{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Educational Footer */}
          <div className="bg-gray-900 border border-cyan-500 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 font-mono text-cyan-400">
              How Weather Systems Interact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-cyan-300">
              <div>
                <h4 className="font-bold mb-2 text-cyan-400">Pressure Gradients</h4>
                <p>
                  The difference in pressure between high and low pressure systems creates pressure gradients,
                  which drive wind patterns and influence weather conditions.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-cyan-400">Frontal Boundaries</h4>
                <p>
                  Weather fronts form where different air masses meet, creating zones of active weather
                  with precipitation, temperature changes, and wind shifts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 