"use client"

import { useState, useEffect } from "react"
import PageWrapper from "@/components/page-wrapper"
import { ChevronDown, ChevronUp } from "lucide-react"
import { ThemeType, themeUtils, APP_CONSTANTS } from "@/lib/utils"

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
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(APP_CONSTANTS.THEMES.DARK)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // Load and sync theme using centralized utilities
  useEffect(() => {
    const storedTheme = themeUtils.getStoredTheme()
    setCurrentTheme(storedTheme)
    
    // Listen for theme changes
    const handleStorageChange = () => {
      const newTheme = themeUtils.getStoredTheme()
      setCurrentTheme(newTheme)
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Poll for theme changes
    const interval = setInterval(() => {
      const newTheme = themeUtils.getStoredTheme()
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme)
      }
    }, 100)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [currentTheme])

  const themeClasses = themeUtils.getThemeClasses(currentTheme)

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
      case 'Ultra Rare': return currentTheme === 'miami' ? '#ff007f' : currentTheme === 'tron' ? '#00FFFF' : '#00d4ff'
      case 'Very Rare': return currentTheme === 'miami' ? '#ff1493' : currentTheme === 'tron' ? '#00CCCC' : '#00b4d4'
      case 'Rare': return currentTheme === 'miami' ? '#ff69b4' : currentTheme === 'tron' ? '#0099AA' : '#0094b4'
      case 'Uncommon': return currentTheme === 'miami' ? '#ffb3da' : currentTheme === 'tron' ? '#006677' : '#007494'
      default: return currentTheme === 'miami' ? '#d0d0d0' : currentTheme === 'tron' ? '#004455' : '#005474'
    }
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 font-mono uppercase tracking-wider ${themeClasses.headerText} ${themeClasses.glow}`}>
            16-BIT TAKES
          </h1>
          <p className={`text-lg ${themeClasses.secondaryText} font-mono mb-6`}>
            Weather phenomena explained with 16-bit gaming references
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {weatherPhenomena.map((phenomenon) => {
            const isExpanded = expandedCards.has(phenomenon.id)
            return (
              <div 
                key={phenomenon.id}
                className={`${themeClasses.cardBg} border-4 ${themeClasses.borderColor} transition-all duration-300 ${themeClasses.hoverBg} cursor-pointer h-fit`}
                style={{ boxShadow: `0 0 15px ${themeClasses.shadowColor}33` }}
                onClick={() => toggleCard(phenomenon.id)}
              >
                {/* Card Header */}
                <div className="p-4 border-b-2 border-current">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-3xl">{phenomenon.emoji}</div>
                    <div 
                      className="text-xs font-mono font-bold px-2 py-1 border-2 rounded"
                      style={{ 
                        borderColor: getRarityColor(phenomenon.rarity),
                        color: getRarityColor(phenomenon.rarity),
                        backgroundColor: getRarityColor(phenomenon.rarity) + '20'
                      }}
                    >
                      {phenomenon.rarity.toUpperCase()}
                    </div>
                  </div>
                  
                  <h3 className={`font-mono font-bold text-lg uppercase tracking-wider mb-2 ${themeClasses.headerText}`}>
                    {phenomenon.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-mono ${themeClasses.secondaryText}`}>
                      {phenomenon.category}
                    </span>
                    {isExpanded ? 
                      <ChevronUp className="w-4 h-4 text-current" /> : 
                      <ChevronDown className="w-4 h-4 text-current" />
                    }
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <p className={`${themeClasses.text} font-mono text-sm mb-4`}>
                    {phenomenon.description}
                  </p>

                  {isExpanded && (
                    <div className="space-y-4">
                      {/* Scientific Facts */}
                      <div>
                        <h4 className={`font-mono font-bold text-sm uppercase mb-2 ${themeClasses.headerText}`}>
                          Scientific Facts:
                        </h4>
                        <ul className="space-y-1">
                          {phenomenon.facts.map((fact, index) => (
                            <li key={index} className={`${themeClasses.text} font-mono text-xs flex items-start`}>
                              <span className={`${themeClasses.headerText} mr-2`}>▸</span>
                              {fact}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 16-Bit Take */}
                      <div className={`border-2 ${themeClasses.borderColor} p-3 mt-4`}
                           style={{ backgroundColor: getRarityColor(phenomenon.rarity) + '10' }}>
                        <h4 className={`font-mono font-bold text-sm uppercase mb-2 ${themeClasses.headerText}`}>
                          16-Bit Take:
                        </h4>
                        <p className={`${themeClasses.text} font-mono text-xs italic`}>
                          {phenomenon.bitFact}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <p className={`${themeClasses.secondaryText} font-mono text-sm`}>
            Click any phenomenon card to expand and learn more!
          </p>
        </div>
      </div>
    </PageWrapper>
  )
} 