"use client"

import { useState } from 'react'
import NavBar from '@/components/nav-bar'

interface WeatherSystem {
  id: string
  name: string
  type: string
  rarity: string
  windSpeed: string
  pressure?: string
  formation: string
  emoji: string
  category: 'pressure' | 'frontal' | 'large-scale' | 'specialized'
}

const weatherSystems: WeatherSystem[] = [
  // PRESSURE SYSTEMS
  {
    id: 'cyclones',
    name: 'CYCLONES',
    type: 'LOW PRESSURE',
    rarity: 'common',
    windSpeed: '30-80 mph',
    pressure: '950-1010 mb',
    formation: 'Warm air rises, creating low pressure at surface. Air converges and rotates counterclockwise in Northern Hemisphere.',
    emoji: '🌀',
    category: 'pressure'
  },
  {
    id: 'anticyclones',
    name: 'ANTICYCLONES',
    type: 'HIGH PRESSURE',
    rarity: 'common',
    windSpeed: '5-25 mph',
    pressure: '1020-1050 mb',
    formation: 'Cold air descends, creating high pressure at surface. Air diverges and rotates clockwise in Northern Hemisphere.',
    emoji: '☀️',
    category: 'pressure'
  },
  {
    id: 'depressions',
    name: 'DEPRESSIONS',
    type: 'MATURE LOW PRESSURE',
    rarity: 'uncommon',
    windSpeed: '25-60 mph',
    pressure: '970-1000 mb',
    formation: 'Fully developed cyclonic system with well-defined warm and cold fronts.',
    emoji: '🌧️',
    category: 'pressure'
  },
  {
    id: 'blocking-highs',
    name: 'BLOCKING HIGHS',
    type: 'PERSISTENT HIGH PRESSURE',
    rarity: 'elite tier',
    windSpeed: '5-20 mph (light winds)',
    pressure: '1025-1055 mb',
    formation: 'Anticyclone becomes stationary, blocking normal weather pattern flow.',
    emoji: '🛡️',
    category: 'pressure'
  },

  // FRONTAL SYSTEMS
  {
    id: 'warm-fronts',
    name: 'WARM FRONTS',
    type: 'ADVANCING WARM AIR',
    rarity: 'common',
    windSpeed: '10-30 mph',
    formation: 'Warm air mass gradually overrides cooler air ahead.',
    emoji: '🌤️',
    category: 'frontal'
  },
  {
    id: 'cold-fronts',
    name: 'COLD FRONTS',
    type: 'ADVANCING COLD AIR',
    rarity: 'common',
    windSpeed: '25-60 mph, gusty',
    formation: 'Dense cold air rapidly undercuts and lifts warm air.',
    emoji: '⚡',
    category: 'frontal'
  },
  {
    id: 'occluded-fronts',
    name: 'OCCLUDED FRONTS',
    type: 'COMPLEX FRONTAL MERGER',
    rarity: 'uncommon',
    windSpeed: '20-50 mph',
    formation: 'Fast-moving cold front catches up to warm front, lifting warm air completely off surface.',
    emoji: '🥪',
    category: 'frontal'
  },
  {
    id: 'stationary-fronts',
    name: 'STATIONARY FRONTS',
    type: 'NON-MOVING BOUNDARY',
    rarity: 'uncommon',
    windSpeed: 'Variable, often light',
    formation: 'Two air masses meet but neither advances significantly.',
    emoji: '⚖️',
    category: 'frontal'
  },

  // LARGE-SCALE SYSTEMS
  {
    id: 'atmospheric-rivers',
    name: 'ATMOSPHERIC RIVERS',
    type: 'MOISTURE TRANSPORT SYSTEM',
    rarity: 'boss level',
    windSpeed: '50-150 mph at jet level',
    formation: 'Jet stream guides narrow bands of moisture from tropics.',
    emoji: '🌊',
    category: 'large-scale'
  },
  {
    id: 'jet-streams',
    name: 'JET STREAMS',
    type: 'HIGH-ALTITUDE WIND SYSTEM',
    rarity: 'elite tier',
    windSpeed: '80-275 mph',
    formation: 'Temperature differences between air masses create pressure gradients.',
    emoji: '✈️',
    category: 'large-scale'
  },
  {
    id: 'monsoons',
    name: 'MONSOONS',
    type: 'SEASONAL WIND REVERSAL',
    rarity: 'elite tier',
    windSpeed: '10-40 mph surface winds',
    formation: 'Seasonal heating/cooling differences between land and ocean.',
    emoji: '🏔️',
    category: 'large-scale'
  },
  {
    id: 'polar-vortex',
    name: 'POLAR VORTEX',
    type: 'CIRCUMPOLAR CIRCULATION',
    rarity: 'boss level',
    windSpeed: '60-200 mph',
    formation: 'Strong temperature gradient around polar regions.',
    emoji: '🧊',
    category: 'large-scale'
  },

  // SPECIALIZED SYSTEMS
  {
    id: 'mid-latitude-cyclones',
    name: 'MID-LATITUDE CYCLONES',
    type: 'EXTRA-TROPICAL STORM',
    rarity: 'elite tier',
    windSpeed: '30-80 mph',
    pressure: '950-1000 mb at center',
    formation: 'Temperature contrasts along polar front.',
    emoji: '🌪️',
    category: 'specialized'
  },
  {
    id: 'tropical-cyclones',
    name: 'TROPICAL CYCLONES',
    type: 'TROPICAL STORM SYSTEM',
    rarity: 'boss level',
    windSpeed: '74+ mph (hurricane threshold)',
    pressure: '900-980 mb (intense storms)',
    formation: 'Warm ocean water (26.5°C+) provides energy.',
    emoji: '🌀',
    category: 'specialized'
  },
  {
    id: 'squall-lines',
    name: 'SQUALL LINES',
    type: 'LINEAR THUNDERSTORM COMPLEX',
    rarity: 'rare',
    windSpeed: '60-100+ mph gusts',
    formation: 'Cold front or convergence line triggers line of thunderstorms.',
    emoji: '⛈️',
    category: 'specialized'
  },
  {
    id: 'mesoscale-convective-complexes',
    name: 'MESOSCALE CONVECTIVE COMPLEXES',
    type: 'LARGE THUNDERSTORM CLUSTER',
    rarity: 'rare',
    windSpeed: 'Variable, 50-100+ mph in embedded storms',
    formation: 'Multiple thunderstorms merge into organized system.',
    emoji: '🏙️',
    category: 'specialized'
  }
]

const categories = [
  { id: 'all', name: 'ALL SYSTEMS', count: weatherSystems.length },
  { id: 'pressure', name: 'PRESSURE (4)', count: weatherSystems.filter(s => s.category === 'pressure').length },
  { id: 'frontal', name: 'FRONTAL (4)', count: weatherSystems.filter(s => s.category === 'frontal').length },
  { id: 'large-scale', name: 'LARGE SCALE (4)', count: weatherSystems.filter(s => s.category === 'large-scale').length },
  { id: 'specialized', name: 'SPECIALIZED (4)', count: weatherSystems.filter(s => s.category === 'specialized').length }
]

export default function WeatherSystemsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSystem, setSelectedSystem] = useState<WeatherSystem | null>(null)

  const filteredSystems = selectedCategory === 'all' 
    ? weatherSystems 
    : weatherSystems.filter(system => system.category === selectedCategory)

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-green-400'
      case 'uncommon': return 'text-yellow-400'
      case 'elite tier': return 'text-purple-400'
      case 'boss level': return 'text-red-400'
      case 'rare': return 'text-orange-400'
      default: return 'text-cyan-400'
    }
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400">
      <NavBar />
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-mono uppercase tracking-wider">
              16-BIT WEATHER SYSTEMS
            </h1>
            <p className="text-lg text-cyan-600 font-mono mb-6">
              Interactive 16-bit atmospheric phenomena database • 16 systems documented
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 font-mono text-sm border-2 transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'border-cyan-400 bg-cyan-400 text-black'
                    : 'border-cyan-600 text-cyan-400 hover:border-cyan-400'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Weather Systems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {filteredSystems.map(system => (
              <div
                key={system.id}
                onClick={() => setSelectedSystem(system)}
                className="border-2 border-cyan-400 p-6 cursor-pointer hover:bg-cyan-400 hover:text-black transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{system.emoji}</div>
                  <h3 className="text-lg font-mono font-bold mb-2">{system.name}</h3>
                  <div className="text-sm font-mono mb-2">{system.type}</div>
                  <div className={`text-xs font-mono mb-2 ${getRarityColor(system.rarity)}`}>
                    {system.rarity}
                  </div>
                  <div className="text-xs font-mono mb-2">
                    Wind Speed: {system.windSpeed}
                  </div>
                  {system.pressure && (
                    <div className="text-xs font-mono mb-2">
                      Pressure: {system.pressure}
                    </div>
                  )}
                  <div className="text-xs font-mono mb-4">
                    Formation: {system.formation.substring(0, 80)}...
                  </div>
                  <div className="text-xs font-mono group-hover:text-black">
                    ▶ CLICK FOR FULL ANALYSIS
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Classification Database */}
          <div className="border-2 border-cyan-400 p-6 mb-8">
            <h2 className="text-2xl font-mono font-bold mb-6 text-center">
              🎮 WEATHER SYSTEMS CLASSIFICATION DATABASE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-lg font-mono font-bold mb-4 text-cyan-300">► PRESSURE SYSTEMS:</h3>
                <ul className="text-sm font-mono space-y-2">
                  <li>• Cyclones: 950-1010 mb</li>
                  <li>• Anticyclones: 1020-1050 mb</li>
                  <li>• Depressions: Mature lows</li>
                  <li>• Blocking Highs: Stationary</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold mb-4 text-cyan-300">► FRONTAL SYSTEMS:</h3>
                <ul className="text-sm font-mono space-y-2">
                  <li>• Warm: Gradual advance</li>
                  <li>• Cold: Rapid undercut</li>
                  <li>• Occluded: Front merger</li>
                  <li>• Stationary: Boundary hold</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold mb-4 text-cyan-300">► LARGE-SCALE:</h3>
                <ul className="text-sm font-mono space-y-2">
                  <li>• Atmospheric Rivers: Moisture transport</li>
                  <li>• Jet Streams: High-altitude winds</li>
                  <li>• Monsoons: Seasonal reversal</li>
                  <li>• Polar Vortex: Arctic circulation</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold mb-4 text-cyan-300">► SPECIALIZED:</h3>
                <ul className="text-sm font-mono space-y-2">
                  <li>• Mid-Latitude Cyclones: Extra-tropical</li>
                  <li>• Tropical Cyclones: Hurricane systems</li>
                  <li>• Squall Lines: Linear storms</li>
                  <li>• Mesoscale Complexes: Storm clusters</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="border-2 border-cyan-400 p-6">
            <h2 className="text-2xl font-mono font-bold mb-6 text-center">
              🏆 METEOROLOGIST ACHIEVEMENTS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm font-mono">
              <div className="text-center p-3 border border-cyan-400/30">
                <div className="text-2xl mb-2">🌀</div>
                <div>Storm Tracker: Identify 5 pressure systems</div>
              </div>
              <div className="text-center p-3 border border-cyan-400/30">
                <div className="text-2xl mb-2">❄️</div>
                <div>Front Hunter: Master frontal boundaries</div>
              </div>
              <div className="text-center p-3 border border-cyan-400/30">
                <div className="text-2xl mb-2">🌍</div>
                <div>Global Observer: Discover large-scale systems</div>
              </div>
              <div className="text-center p-3 border border-cyan-400/30">
                <div className="text-2xl mb-2">⚡</div>
                <div>Elite Meteorologist: BOSS LEVEL unlocked</div>
              </div>
              <div className="text-center p-3 border border-cyan-400/30">
                <div className="text-2xl mb-2">🎯</div>
                <div>System Specialist: All categories explored</div>
              </div>
              <div className="text-center p-3 border border-cyan-400/30">
                <div className="text-2xl mb-2">👑</div>
                <div>Weather Master: Complete database analyzed</div>
              </div>
            </div>
            <div className="text-center mt-6 text-sm text-cyan-600 font-mono">
              Click on weather systems to unlock achievements and explore the atmospheric physics!
            </div>
          </div>
        </div>
      </div>

      {/* Modal for detailed system view */}
      {selectedSystem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border-2 border-cyan-400 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-4xl mb-2">{selectedSystem.emoji}</div>
                <h2 className="text-2xl font-mono font-bold">{selectedSystem.name}</h2>
                <div className="text-lg font-mono text-cyan-300">{selectedSystem.type}</div>
              </div>
              <button
                onClick={() => setSelectedSystem(null)}
                className="text-cyan-400 hover:text-cyan-300 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-sm font-mono">
              <div>
                <span className="text-cyan-300">Rarity:</span> 
                <span className={`ml-2 ${getRarityColor(selectedSystem.rarity)}`}>
                  {selectedSystem.rarity}
                </span>
              </div>
              <div>
                <span className="text-cyan-300">Wind Speed:</span> {selectedSystem.windSpeed}
              </div>
              {selectedSystem.pressure && (
                <div>
                  <span className="text-cyan-300">Pressure:</span> {selectedSystem.pressure}
                </div>
              )}
              <div>
                <span className="text-cyan-300">Formation:</span>
                <div className="mt-2 text-cyan-400">{selectedSystem.formation}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 