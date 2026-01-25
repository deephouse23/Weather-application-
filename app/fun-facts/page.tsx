"use client"

/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */


import { useState } from "react"
import { useTheme } from "next-themes"
import PageWrapper from "@/components/page-wrapper"
import { ChevronDown, ChevronUp } from "lucide-react"
import { ThemeType, getComponentStyles } from "@/lib/theme-utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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
  scientificMechanism?: string;
  historicalOccurrence?: string;
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
    bitFact: 'Like a floating power-up that defies physics!',
    scientificMechanism: "Likely caused by vaporized soil silicates undergoing oxidation, or microwave cavity resonance of trapped plasma.",
    historicalOccurrence: "Tsar Nicholas II reported witnessing a fiery ball during a church service in the 19th century."
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
    bitFact: 'Nature\'s neon signs lighting up the storm!',
    scientificMechanism: "Point discharge of atmospheric electricity that creates a luminous plasma around sharp objects when the electric field exceeds 30 kV/cm.",
    historicalOccurrence: "Recorded by Julius Caesar and Christopher Columbus during their voyages."
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
    bitFact: 'Ocean boss battles that spawn randomly!',
    scientificMechanism: "Constructive interference (waves adding up) or non-linear effects (waves stealing energy from neighbors) focused by currents.",
    historicalOccurrence: "The Draupner wave (1995) was the first scientifically measured rogue wave, hitting an oil platform with 25.6m height."
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
    bitFact: 'Fire-type tornado attacks with critical damage!',
    scientificMechanism: "Intense heat generates strong updrafts, while surface winds provide rotation, stretching the vortex vertically and intensifying spin.",
    historicalOccurrence: "Great Kanto Earthquake (1923) spawned a 300ft fire whirl that killed 38,000 people in minutes."
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
    bitFact: 'Nature\'s freeze spell that transforms the world!',
    scientificMechanism: "Supercooled water droplets (liquid below 0°C) fall through a shallow freezing layer near the ground, freezing instantly upon contact.",
    historicalOccurrence: "Great Ice Storm of 1998 in Canada/US caused over $5 billion in damage and left millions without power."
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
    bitFact: 'Invisible wind attacks with instant KO potential!',
    scientificMechanism: "Evaporative cooling in a thunderstorm causes air to become denser and crash to the ground, spreading out radially upon impact.",
    historicalOccurrence: "Delta Flight 191 (1985) crashed due to a microburst, leading to modern wind shear detection systems."
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
    bitFact: 'Space lightning that shoots into the cosmos!',
    scientificMechanism: "Quasi-electrostatic fields generated by massive positive cloud-to-ground lightning strikes that ionize the upper atmosphere.",
    historicalOccurrence: "Accidentally discovered by researchers at the University of Minnesota in 1989 while testing low-light cameras."
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
    bitFact: 'Cosmic doughnuts of pure energy!',
    scientificMechanism: "Electromagnetic pulse (EMP) from lightning hitting the ionosphere, causing nitrogen molecules to glow.",
    historicalOccurrence: "First predicted theoretically, then confirmed by space shuttle cameras in the 1990s."
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
    bitFact: 'Cloud highways stretching across continents!',
    scientificMechanism: "Solitary waves (solitons) traveling along a stable inversion layer, often formed by sea breeze collisions.",
    historicalOccurrence: "Regularly appear in the Gulf of Carpentaria, Australia in September/October."
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
    bitFact: 'Beautiful but deadly rainbow effect clouds!',
    scientificMechanism: "Ice crystals form in the stratosphere at extreme cold, providing surfaces for chemical reactions that release ozone-destroying chlorine.",
    historicalOccurrence: "Critical factor in the formation of the Antarctic Ozone Hole discovered in the 1980s."
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
    bitFact: 'Water-type whirlwind attacks that can travel!',
    scientificMechanism: "Fair-weather spouts form from the surface up due to wind shear and high humidity; tornadic spouts descend from thunderstorms.",
    historicalOccurrence: "The Great Malta Tornado of 1551 (started as a waterspout) destroyed the Grand Harbour shipping fleet."
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
    bitFact: 'Desert tornadoes spawning from heat mirages!',
    scientificMechanism: "Hot air near the surface rises rapidly through cooler air above, creating a vertical vortex that stretches and spins faster.",
    historicalOccurrence: "Mars rovers frequently capture image of massive dust devils towering kilometers high on the Red Planet."
  }
];

export default function FunFactsPage() {
  const { theme } = useTheme()
  const currentTheme = (theme || 'dark') as ThemeType
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  const themeClasses = getComponentStyles(currentTheme, 'weather')

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
      case 'Ultra Rare': return themeClasses.warningText
      case 'Very Rare': return themeClasses.successText
      case 'Rare': return themeClasses.accentText
      case 'Uncommon': return themeClasses.secondaryText
      default: return themeClasses.text
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
              <Card
                key={phenomenon.id}
                className={`container-primary transition-all duration-300 cursor-pointer h-fit`}
                onClick={() => toggleCard(phenomenon.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-3xl">{phenomenon.emoji}</div>
                    <div
                      className="text-xs font-mono font-bold px-2 py-1 rounded"
                      style={{
                        color: getRarityColor(phenomenon.rarity),
                        backgroundColor: getRarityColor(phenomenon.rarity) + '20'
                      }}
                    >
                      {phenomenon.rarity.toUpperCase()}
                    </div>
                  </div>

                  <CardTitle className={`font-mono font-bold text-lg uppercase tracking-wider ${themeClasses.headerText}`}>
                    {phenomenon.name}
                  </CardTitle>

                  <div className="flex items-center justify-between">
                    <CardDescription className={`text-sm font-mono ${themeClasses.secondaryText}`}>
                      {phenomenon.category}
                    </CardDescription>
                    {isExpanded ?
                      <ChevronUp className="w-4 h-4 text-current" /> :
                      <ChevronDown className="w-4 h-4 text-current" />
                    }
                  </div>
                </CardHeader>

                {/* Card Body */}
                <CardContent>
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

                      {/* Scientific Mechanism */}
                      {phenomenon.scientificMechanism && (
                        <div className="mt-4">
                          <h4 className={`font-mono font-bold text-sm uppercase mb-2 ${themeClasses.headerText}`}>
                            The Science Behind It:
                          </h4>
                          <p className={`${themeClasses.text} font-mono text-xs leading-relaxed`}>
                            {phenomenon.scientificMechanism}
                          </p>
                        </div>
                      )}

                      {/* Historical Occurrence */}
                      {phenomenon.historicalOccurrence && (
                        <div className="mt-4">
                          <h4 className={`font-mono font-bold text-sm uppercase mb-2 ${themeClasses.headerText}`}>
                            Famous Encounter:
                          </h4>
                          <div className={`${themeClasses.warningText} font-mono text-xs border-l-4 border-current pl-3`}>
                            {phenomenon.historicalOccurrence}
                          </div>
                        </div>
                      )}

                      {/* 16-Bit Take */}
                      <div className="card-inner p-3 mt-4 rounded"
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
                </CardContent>
              </Card>
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