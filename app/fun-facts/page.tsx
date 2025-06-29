"use client"

import { useState, useEffect } from "react"
import NavBar from '@/components/nav-bar'

// Theme types to match main app
type WeatherPhenomena = {
  id: string;
  name: string;
  category: string;
  rarity: string;
  description: string;
  facts: string[];
  emoji: string;
  bitFact: string;
};

// Weather phenomena database
const weatherPhenomena: WeatherPhenomena[] = [
  {
    id: 'ball-lightning',
    name: 'Ball Lightning',
    category: 'Electrical',
    rarity: 'Ultra Rare',
    description: 'Mysterious spherical lightning that floats through the air',
    facts: [
      'Appears as glowing orbs 1-100cm in diameter',
      'Can pass through solid objects like windows',
      'Lasts 1-5 seconds with crackling sounds',
      'Only 5% of people ever witness this phenomenon'
    ],
    emoji: '⚡',
    bitFact: 'Like a floating power-up that defies physics!'
  },
  {
    id: 'st-elmos-fire',
    name: "St. Elmo's Fire",
    category: 'Electrical',
    rarity: 'Rare',
    description: 'Blue or violet glow appearing on pointed objects during storms',
    facts: [
      'Creates corona discharge on ship masts and aircraft',
      'Temperature can reach 1000°C but produces no heat',
      'Named after patron saint of sailors',
      'Appears as dancing flames but is pure electricity'
    ],
    emoji: '🔥',
    bitFact: 'Nature\'s neon signs lighting up the storm!'
  },
  {
    id: 'rogue-waves',
    name: 'Rogue Waves',
    category: 'Ocean',
    rarity: 'Rare',
    description: 'Massive waves that appear from nowhere in calm seas',
    facts: [
      'Can reach heights of 100+ feet (30+ meters)',
      'Strike without warning in otherwise normal conditions',
      'Responsible for sinking large ships instantly',
      'Occur due to wave interference patterns'
    ],
    emoji: '🌊',
    bitFact: 'Ocean boss battles that spawn randomly!'
  },
  {
    id: 'fire-whirls',
    name: 'Fire Whirls',
    category: 'Fire Weather',
    rarity: 'Uncommon',
    description: 'Tornadoes made of fire that can reach 2000°F',
    facts: [
      'Can reach heights of 100+ feet with 100+ mph winds',
      'Temperature cores exceed 2000°F (1093°C)',
      'Can last for hours and move across landscapes',
      'Create their own weather patterns'
    ],
    emoji: '🌪',
    bitFact: 'Fire-type tornado attacks with critical damage!'
  },
  {
    id: 'ice-storms',
    name: 'Ice Storms',
    category: 'Winter Weather',
    rarity: 'Uncommon',
    description: 'Freezing rain that encases everything in crystal ice',
    facts: [
      'Can add 500+ pounds of ice per power line span',
      'Trees become crystal sculptures weighing tons',
      'Creates the sound of breaking glass everywhere',
      'Can shut down entire cities for weeks'
    ],
    emoji: '❄️',
    bitFact: 'Nature\'s freeze spell that transforms the world!'
  },
  {
    id: 'microbursts',
    name: 'Microbursts',
    category: 'Wind',
    rarity: 'Uncommon',
    description: 'Invisible downdrafts that can destroy aircraft',
    facts: [
      'Wind speeds can exceed 150 mph in seconds',
      'Create divergent wind patterns spreading outward',
      'Responsible for multiple aviation disasters',
      'Can flip semi-trucks and level buildings'
    ],
    emoji: '💨',
    bitFact: 'Invisible wind attacks with instant KO potential!'
  },
  {
    id: 'sprites',
    name: 'Sprites',
    category: 'Upper Atmosphere',
    rarity: 'Rare',
    description: 'Red lightning that shoots upward into space',
    facts: [
      'Occur 50-90km above thunderstorms',
      'Last only 1-5 milliseconds',
      'Can extend 50km vertically',
      'Only discovered in 1989 due to their brief nature'
    ],
    emoji: '🌌',
    bitFact: 'Space lightning that shoots into the cosmos!'
  },
  {
    id: 'elves',
    name: 'ELVES',
    category: 'Upper Atmosphere',
    rarity: 'Very Rare',
    description: 'Expanding rings of light in the ionosphere',
    facts: [
      'ELVES = Emissions of Light and VLF perturbations',
      'Expand to 300km diameter in milliseconds',
      'Occur 85-95km above Earth',
      'Appear as doughnut-shaped flashes'
    ],
    emoji: '💫',
    bitFact: 'Cosmic doughnuts of pure energy!'
  },
  {
    id: 'morning-glory',
    name: 'Morning Glory Clouds',
    category: 'Cloud Formation',
    rarity: 'Ultra Rare',
    description: 'Giant rolling cloud tubes up to 1000km long',
    facts: [
      'Can reach lengths of 1000+ kilometers',
      'Roll forward like massive atmospheric waves',
      'Predictable only in Northern Australia',
      'Glider pilots surf them like ocean waves'
    ],
    emoji: '☁️',
    bitFact: 'Cloud highways stretching across continents!'
  },
  {
    id: 'polar-stratospheric',
    name: 'Polar Stratospheric Clouds',
    category: 'High Altitude',
    rarity: 'Rare',
    description: 'Rainbow clouds that destroy ozone',
    facts: [
      'Form only at -78°C (-108°F) or colder',
      'Create brilliant iridescent colors',
      'Destroy ozone molecules on their surfaces',
      'Only visible during polar winter twilight'
    ],
    emoji: '🌈',
    bitFact: 'Beautiful but deadly rainbow effect clouds!'
  },
  {
    id: 'waterspouts',
    name: 'Waterspouts',
    category: 'Marine Weather',
    rarity: 'Uncommon',
    description: 'Tornadoes over water that can travel onto land',
    facts: [
      'Can form in fair weather without thunderstorms',
      'Winds can exceed 100 mph at the surface',
      'Can pick up marine life and drop it miles inland',
      'Florida Keys see 400+ waterspouts annually'
    ],
    emoji: '🌊',
    bitFact: 'Water-type whirlwind attacks that can travel!'
  },
  {
    id: 'dust-devils',
    name: 'Dust Devils',
    category: 'Desert Weather',
    rarity: 'Common',
    description: 'Mini-tornadoes formed by surface heating',
    facts: [
      'Can reach heights of 1000+ feet',
      'Wind speeds typically 45-60 mph',
      'Form on clear, hot days without storms',
      'Can move at 20+ mph across terrain'
    ],
    emoji: '🌪',
    bitFact: 'Desert tornadoes spawning from heat mirages!'
  }
];

export default function FunFactsPage() {
  const [isClient, setIsClient] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // Client-side mount effect
  useEffect(() => {
    setIsClient(true)
  }, [])

  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-green-400'
      case 'Uncommon': return 'text-blue-400'
      case 'Rare': return 'text-purple-400'
      case 'Very Rare': return 'text-orange-400'
      case 'Ultra Rare': return 'text-red-400'
      default: return 'text-cyan-400'
    }
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400">
      <NavBar />
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-mono uppercase tracking-wider text-cyan-400">
              WEATHER PHENOMENA
            </h1>
            <p className="text-lg text-cyan-600 font-mono mb-6">
              🌪️ Discover the rarest and most incredible weather events on Earth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {weatherPhenomena.map((phenomenon) => (
              <div
                key={phenomenon.id}
                className="bg-black border-2 border-cyan-500 transition-all duration-300 hover:border-cyan-300 cursor-pointer"
                style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.1)' }}
                onClick={() => toggleCard(phenomenon.id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{phenomenon.emoji}</div>
                    <div className="text-cyan-400">
                      {expandedCards.has(phenomenon.id) ? '▼' : '▶'}
                    </div>
                  </div>
                  
                  <h3 className="font-mono font-bold text-lg uppercase tracking-wider mb-2 text-cyan-400">
                    {phenomenon.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-cyan-500 text-black px-2 py-1 font-mono">
                      {phenomenon.category}
                    </span>
                    <span className={`text-xs font-mono ${getRarityColor(phenomenon.rarity)}`}>
                      {phenomenon.rarity}
                    </span>
                  </div>
                  
                  <p className="text-cyan-600 font-mono text-sm mb-3">
                    {phenomenon.description}
                  </p>
                  
                  {expandedCards.has(phenomenon.id) && (
                    <div className="mt-4 space-y-3">
                      <div className="border-t border-cyan-500 pt-3">
                        <h4 className="font-mono font-bold text-sm uppercase tracking-wider mb-2 text-cyan-400">
                          FACTS
                        </h4>
                        <ul className="space-y-1">
                          {phenomenon.facts.map((fact, index) => (
                            <li key={index} className="text-cyan-600 font-mono text-xs">
                              • {fact}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-cyan-500/10 border border-cyan-500 p-3">
                        <p className="text-cyan-400 font-mono text-xs">
                          <span className="font-bold">16-BIT FACT:</span> {phenomenon.bitFact}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="bg-black border-2 border-cyan-500 p-6 max-w-2xl mx-auto"
                 style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)' }}>
              <h3 className="font-mono font-bold text-lg uppercase tracking-wider mb-4 text-cyan-400">
                🌍 WEATHER PHENOMENA DATABASE
              </h3>
              <div className="text-cyan-600 font-mono text-sm space-y-2">
                <p>✨ 12 incredible weather phenomena from around the world</p>
                <p>🎮 Each phenomenon includes 16-bit gaming references</p>
                <p>📊 Rarity levels from Common to Ultra Rare</p>
                <p>🔬 Scientific facts with retro gaming flair</p>
                <p>🌪️ Interactive cards with expandable details</p>
                <p>🎯 Click any card to reveal more information</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 