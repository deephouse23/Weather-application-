"use client"

import { useState } from 'react'
import NavBar from '@/components/nav-bar'

interface CloudType {
  id: string
  name: string
  latinName: string
  description: string
  characteristics: string[]
  weather: string[]
  altitude: string
  color: string
}

const cloudTypes: CloudType[] = [
  {
    id: 'cirrus',
    name: 'Cirrus',
    latinName: 'Cirrus (curl of hair)',
    description: 'High, wispy clouds made of ice crystals that appear as thin, white streaks.',
    characteristics: [
      'Feathery or hair-like appearance',
      'White or light gray color',
      'High altitude (16,500-45,000 ft)',
      'Composed of ice crystals'
    ],
    weather: [
      'Fair weather indicator',
      'May precede storms',
      'Clear skies usually follow'
    ],
    altitude: 'High (16,500-45,000 ft)',
    color: 'text-blue-300'
  },
  {
    id: 'cumulus',
    name: 'Cumulus',
    latinName: 'Cumulus (heap)',
    description: 'Puffy, cotton-like clouds with flat bases that develop vertically.',
    characteristics: [
      'Puffy, cotton-ball appearance',
      'Flat, dark bases',
      'Bright white tops',
      'Develop vertically'
    ],
    weather: [
      'Fair weather clouds',
      'Can develop into storms',
      'Good visibility'
    ],
    altitude: 'Low to Middle (1,000-6,500 ft)',
    color: 'text-white'
  },
  {
    id: 'stratus',
    name: 'Stratus',
    latinName: 'Stratus (layer)',
    description: 'Low, gray clouds that form in layers and often bring light precipitation.',
    characteristics: [
      'Uniform gray appearance',
      'Covers large areas',
      'Low altitude',
      'Layered structure'
    ],
    weather: [
      'Light rain or drizzle',
      'Overcast conditions',
      'Poor visibility'
    ],
    altitude: 'Low (0-6,500 ft)',
    color: 'text-gray-300'
  },
  {
    id: 'nimbus',
    name: 'Nimbus',
    latinName: 'Nimbus (rain)',
    description: 'Dark, rain-bearing clouds that produce precipitation.',
    characteristics: [
      'Dark gray or black color',
      'Thick, dense appearance',
      'Produces precipitation',
      'Low visibility'
    ],
    weather: [
      'Rain, snow, or sleet',
      'Stormy conditions',
      'Strong winds possible'
    ],
    altitude: 'Low to Middle (0-6,500 ft)',
    color: 'text-gray-600'
  },
  {
    id: 'altocumulus',
    name: 'Altocumulus',
    latinName: 'Altocumulus (high heap)',
    description: 'Middle-level clouds that appear as white or gray patches in rows.',
    characteristics: [
      'White or gray patches',
      'Arranged in rows',
      'Middle altitude',
      'Layered appearance'
    ],
    weather: [
      'Fair weather indicator',
      'May precede storms',
      'Moderate visibility'
    ],
    altitude: 'Middle (6,500-20,000 ft)',
    color: 'text-gray-400'
  },
  {
    id: 'cirrocumulus',
    name: 'Cirrocumulus',
    latinName: 'Cirrocumulus (high heap)',
    description: 'High, small, white clouds that appear in patches or rows.',
    characteristics: [
      'Small, white patches',
      'High altitude',
      'Ice crystal composition',
      'Mackerel sky pattern'
    ],
    weather: [
      'Fair weather',
      'May indicate approaching storms',
      'Excellent visibility'
    ],
    altitude: 'High (16,500-45,000 ft)',
    color: 'text-blue-200'
  }
]

export default function CloudTypesPage() {
  const [selectedCloud, setSelectedCloud] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const filteredClouds = filter === 'all' 
    ? cloudTypes 
    : cloudTypes.filter(cloud => {
        if (filter === 'high') return cloud.altitude.includes('High')
        if (filter === 'middle') return cloud.altitude.includes('Middle')
        if (filter === 'low') return cloud.altitude.includes('Low')
        return true
      })

  return (
    <div className="min-h-screen bg-black text-cyan-400">
      <NavBar />
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 font-mono border-b-2 border-cyan-500 pb-4">
              CLOUD TYPES
            </h1>
            <p className="text-lg text-cyan-300 max-w-3xl mx-auto">
              Discover the different types of clouds and what they tell us about weather conditions.
              From fluffy cumulus to wispy cirrus, each cloud type has its own story.
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2 bg-gray-900 p-2 rounded-lg border border-cyan-500">
              {[
                { key: 'all', label: 'All Clouds' },
                { key: 'high', label: 'High Altitude' },
                { key: 'middle', label: 'Middle Altitude' },
                { key: 'low', label: 'Low Altitude' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-4 py-2 rounded font-mono text-sm transition-all duration-200 ${
                    filter === filterOption.key
                      ? 'bg-cyan-500 text-black'
                      : 'text-cyan-400 hover:text-cyan-300 hover:bg-gray-800'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cloud Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredClouds.map((cloud) => (
              <div
                key={cloud.id}
                className={`bg-gray-900 border-2 border-cyan-500 p-6 rounded-lg cursor-pointer transition-all duration-300 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20 ${
                  selectedCloud === cloud.id ? 'border-cyan-300 shadow-lg shadow-cyan-500/20' : ''
                }`}
                onClick={() => setSelectedCloud(selectedCloud === cloud.id ? null : cloud.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`text-xl font-bold font-mono ${cloud.color}`}>
                    {cloud.name}
                  </h3>
                  <span className="text-xs text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded">
                    {cloud.altitude.split(' ')[0]}
                  </span>
                </div>
                <p className="text-xs text-cyan-500 mb-2 font-mono">
                  {cloud.latinName}
                </p>
                <p className="text-sm text-cyan-300 mb-4">
                  {cloud.description}
                </p>
                <div className="text-xs text-cyan-500">
                  Click for details →
                </div>
              </div>
            ))}
          </div>

          {/* Detailed View */}
          {selectedCloud && (
            <div className="bg-gray-900 border-2 border-cyan-500 p-8 rounded-lg mb-8">
              {(() => {
                const cloud = cloudTypes.find(c => c.id === selectedCloud)
                if (!cloud) return null
                
                return (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className={`text-3xl font-bold font-mono ${cloud.color}`}>
                          {cloud.name}
                        </h2>
                        <p className="text-sm text-cyan-500 font-mono mt-1">
                          {cloud.latinName}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedCloud(null)}
                        className="text-cyan-400 hover:text-cyan-300 font-mono text-sm border border-cyan-500 px-4 py-2 rounded hover:bg-cyan-500 hover:text-black transition-all duration-200"
                      >
                        CLOSE
                      </button>
                    </div>
                    
                    <p className="text-lg text-cyan-300 mb-6">
                      {cloud.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Characteristics */}
                      <div>
                        <h3 className="text-xl font-bold mb-4 font-mono text-cyan-400 border-b border-cyan-500 pb-2">
                          Characteristics
                        </h3>
                        <ul className="space-y-2">
                          {cloud.characteristics.map((char, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-cyan-500 mr-2">▶</span>
                              <span className="text-cyan-300 text-sm">{char}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Weather */}
                      <div>
                        <h3 className="text-xl font-bold mb-4 font-mono text-cyan-400 border-b border-cyan-500 pb-2">
                          Weather Conditions
                        </h3>
                        <ul className="space-y-2">
                          {cloud.weather.map((condition, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-cyan-500 mr-2">●</span>
                              <span className="text-cyan-300 text-sm">{condition}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Altitude */}
                      <div>
                        <h3 className="text-xl font-bold mb-4 font-mono text-cyan-400 border-b border-cyan-500 pb-2">
                          Altitude Range
                        </h3>
                        <div className="bg-gray-800 p-4 rounded border border-cyan-500">
                          <p className="text-cyan-300 font-mono text-center">
                            {cloud.altitude}
                          </p>
                        </div>
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
              Cloud Classification System
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-cyan-300">
              <div>
                <h4 className="font-bold mb-2 text-cyan-400">Latin Names</h4>
                <p>
                  Cloud types are named using Latin words that describe their appearance and behavior.
                  Understanding these names helps meteorologists communicate about weather patterns worldwide.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-cyan-400">Altitude Categories</h4>
                <p>
                  Clouds are classified by altitude: High (cirrus family), Middle (alto family), 
                  and Low (stratus family). Each altitude range has distinct characteristics and weather implications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 