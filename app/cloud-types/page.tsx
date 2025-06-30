"use client"

import { useState } from 'react'
import NavBar from '@/components/nav-bar'

interface CloudType {
  id: string
  name: string
  latin: string
  meaning: string
  altitude: string
  description: string
  emoji: string
  characteristics: string[]
}

const cloudTypes: CloudType[] = [
  {
    id: 'cirrus',
    name: 'CIRRUS',
    latin: 'Cirrus',
    meaning: '"curl of hair"',
    altitude: 'High altitude',
    description: 'High, wispy clouds made of ice crystals',
    emoji: '🌤️',
    characteristics: [
      'Thin, wispy appearance',
      'Made of ice crystals',
      'Found at 20,000+ feet',
      'Often indicate fair weather',
      'Can form beautiful patterns'
    ]
  },
  {
    id: 'cumulus',
    name: 'CUMULUS',
    latin: 'Cumulus',
    meaning: '"heap"',
    altitude: 'Low altitude',
    description: 'Puffy, cotton-like clouds with flat bases',
    emoji: '☁️',
    characteristics: [
      'Puffy, cotton-like appearance',
      'Flat, dark bases',
      'Found below 6,500 feet',
      'Indicate fair weather',
      'Can grow into thunderstorms'
    ]
  },
  {
    id: 'stratus',
    name: 'STRATUS',
    latin: 'Stratus',
    meaning: '"layer"',
    altitude: 'Low altitude',
    description: 'Low, gray clouds that form in layers',
    emoji: '🌫️',
    characteristics: [
      'Low, gray appearance',
      'Form in uniform layers',
      'Found below 6,500 feet',
      'Often bring light rain',
      'Can create overcast conditions'
    ]
  },
  {
    id: 'nimbus',
    name: 'NIMBUS',
    latin: 'Nimbus',
    meaning: '"rain"',
    altitude: 'Low altitude',
    description: 'Dark, rain-bearing clouds',
    emoji: '🌧️',
    characteristics: [
      'Dark, rain-bearing appearance',
      'Often combined with other types',
      'Found at various altitudes',
      'Bring precipitation',
      'Can indicate storms'
    ]
  },
  {
    id: 'altocumulus',
    name: 'ALTOCUMULUS',
    latin: 'Alto + Cumulus',
    meaning: '"high heap"',
    altitude: 'Middle altitude',
    description: 'Middle-level clouds in white/gray patches',
    emoji: '⛅',
    characteristics: [
      'White or gray patches',
      'Found at 6,500-20,000 feet',
      'Often appear in groups',
      'Can indicate weather changes',
      'Common on partly cloudy days'
    ]
  },
  {
    id: 'cirrocumulus',
    name: 'CIRROCUMULUS',
    latin: 'Cirro + Cumulus',
    meaning: '"high heap"',
    altitude: 'High altitude',
    description: 'High, small white clouds in patches',
    emoji: '🌤️',
    characteristics: [
      'Small, white patches',
      'Found at 20,000+ feet',
      'Made of ice crystals',
      'Often called "mackerel sky"',
      'Indicate fair weather'
    ]
  }
]

export default function CloudTypesPage() {
  const [selectedCloud, setSelectedCloud] = useState<CloudType | null>(null)

  return (
    <div className="min-h-screen bg-black text-cyan-400">
      <NavBar />
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-mono uppercase tracking-wider">
              16-BIT CLOUD TYPES
            </h1>
            <p className="text-lg text-cyan-600 font-mono mb-6">
              Classic cloud classification system • 6 fundamental types
            </p>
          </div>

          {/* Cloud Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {cloudTypes.map(cloud => (
              <div
                key={cloud.id}
                onClick={() => setSelectedCloud(cloud)}
                className="border-2 border-cyan-400 p-6 cursor-pointer hover:bg-cyan-400 hover:text-black transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{cloud.emoji}</div>
                  <h3 className="text-lg font-mono font-bold mb-2">{cloud.name}</h3>
                  <div className="text-sm font-mono mb-2 text-cyan-300">
                    {cloud.latin} • {cloud.meaning}
                  </div>
                  <div className="text-xs font-mono mb-2">
                    {cloud.altitude}
                  </div>
                  <div className="text-xs font-mono mb-4">
                    {cloud.description}
                  </div>
                  <div className="text-xs font-mono group-hover:text-black">
                    ▶ CLICK FOR DETAILS
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cloud Classification System */}
          <div className="border-2 border-cyan-400 p-6 mb-8">
            <h2 className="text-2xl font-mono font-bold mb-6 text-center">
              ☁️ CLOUD CLASSIFICATION SYSTEM
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-mono font-bold mb-4 text-cyan-300">► HIGH CLOUDS (20,000+ ft):</h3>
                <ul className="text-sm font-mono space-y-2">
                  <li>• Cirrus: Wispy ice crystals</li>
                  <li>• Cirrocumulus: Small white patches</li>
                  <li>• Cirrostratus: Thin, transparent layers</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold mb-4 text-cyan-300">► MIDDLE CLOUDS (6,500-20,000 ft):</h3>
                <ul className="text-sm font-mono space-y-2">
                  <li>• Altocumulus: White/gray patches</li>
                  <li>• Altostratus: Gray, uniform layers</li>
                  <li>• Nimbostratus: Rain-producing layers</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold mb-4 text-cyan-300">► LOW CLOUDS (Below 6,500 ft):</h3>
                <ul className="text-sm font-mono space-y-2">
                  <li>• Cumulus: Puffy, cotton-like</li>
                  <li>• Stratus: Low, gray layers</li>
                  <li>• Stratocumulus: Low, lumpy layers</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Latin Origins */}
          <div className="border-2 border-cyan-400 p-6 mb-8">
            <h2 className="text-2xl font-mono font-bold mb-6 text-center">
              📚 LATIN CLOUD NOMENCLATURE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-mono font-bold mb-4 text-cyan-300">► BASE TERMS:</h3>
                <ul className="text-sm font-mono space-y-2">
                  <li>• <strong>Cirro-</strong>: High altitude (curl of hair)</li>
                  <li>• <strong>Alto-</strong>: Middle altitude (high)</li>
                  <li>• <strong>Strato-</strong>: Low altitude (layer)</li>
                  <li>• <strong>Cumulo-</strong>: Heap or pile</li>
                  <li>• <strong>Nimbo-</strong>: Rain-bearing</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold mb-4 text-cyan-300">► COMBINATIONS:</h3>
                <ul className="text-sm font-mono space-y-2">
                  <li>• <strong>Cirrocumulus</strong>: High + heap</li>
                  <li>• <strong>Altocumulus</strong>: Middle + heap</li>
                  <li>• <strong>Stratocumulus</strong>: Layer + heap</li>
                  <li>• <strong>Nimbostratus</strong>: Rain + layer</li>
                  <li>• <strong>Cumulonimbus</strong>: Heap + rain</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Weather Indicators */}
          <div className="border-2 border-cyan-400 p-6">
            <h2 className="text-2xl font-mono font-bold mb-6 text-center">
              🌤️ WEATHER INDICATORS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 border border-cyan-400/30">
                <div className="text-3xl mb-2">☀️</div>
                <div className="font-mono text-sm">FAIR WEATHER</div>
                <div className="text-xs text-cyan-600 mt-1">Cirrus, Cumulus</div>
              </div>
              <div className="text-center p-4 border border-cyan-400/30">
                <div className="text-3xl mb-2">🌧️</div>
                <div className="font-mono text-sm">RAIN LIKELY</div>
                <div className="text-xs text-cyan-600 mt-1">Nimbus, Stratus</div>
              </div>
              <div className="text-center p-4 border border-cyan-400/30">
                <div className="text-3xl mb-2">⚡</div>
                <div className="font-mono text-sm">STORM WARNING</div>
                <div className="text-xs text-cyan-600 mt-1">Cumulonimbus</div>
              </div>
              <div className="text-center p-4 border border-cyan-400/30">
                <div className="text-3xl mb-2">🌫️</div>
                <div className="font-mono text-sm">OVERCAST</div>
                <div className="text-xs text-cyan-600 mt-1">Stratus, Altostratus</div>
              </div>
              <div className="text-center p-4 border border-cyan-400/30">
                <div className="text-3xl mb-2">🌤️</div>
                <div className="font-mono text-sm">PARTLY CLOUDY</div>
                <div className="text-xs text-cyan-600 mt-1">Altocumulus</div>
              </div>
              <div className="text-center p-4 border border-cyan-400/30">
                <div className="text-3xl mb-2">🌅</div>
                <div className="font-mono text-sm">WEATHER CHANGE</div>
                <div className="text-xs text-cyan-600 mt-1">Cirrocumulus</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for detailed cloud view */}
      {selectedCloud && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border-2 border-cyan-400 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-4xl mb-2">{selectedCloud.emoji}</div>
                <h2 className="text-2xl font-mono font-bold">{selectedCloud.name}</h2>
                <div className="text-lg font-mono text-cyan-300">
                  {selectedCloud.latin} • {selectedCloud.meaning}
                </div>
              </div>
              <button
                onClick={() => setSelectedCloud(null)}
                className="text-cyan-400 hover:text-cyan-300 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-sm font-mono">
              <div>
                <span className="text-cyan-300">Altitude:</span> {selectedCloud.altitude}
              </div>
              <div>
                <span className="text-cyan-300">Description:</span>
                <div className="mt-2 text-cyan-400">{selectedCloud.description}</div>
              </div>
              <div>
                <span className="text-cyan-300">Characteristics:</span>
                <ul className="mt-2 space-y-1">
                  {selectedCloud.characteristics.map((char, index) => (
                    <li key={index} className="text-cyan-400">• {char}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 