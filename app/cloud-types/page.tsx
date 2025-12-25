"use client"

/**
 * 16-Bit Weather Platform - BETA v0.3.2
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


import React, { useState } from "react"
import { useTheme } from "next-themes"
import PageWrapper from "@/components/page-wrapper"
import { ThemeType, getComponentStyles } from "@/lib/theme-utils"

// Theme types to match main app
type CloudData = {
  id: number;
  name: string;
  abbreviation: string;
  category: 'high' | 'mid' | 'low' | 'vertical' | 'rare';
  altitudeRange: string;
  temperature: string;
  dropletSize: string;
  formationTime: string;
  windSpeed: string;
  pressureRange: string;
  weatherPrediction: string;
  description16bit: string;
  formation: string;
  density: string;
  funFact: string;
  etymology: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  emoji: string;
  appearance: string;
  thickness?: string;
  precipitation?: string;
  energy?: string;
  lifespan?: string;
};

// ... inside CloudTypesPage ...

// Comprehensive cloud database
const cloudDatabase: CloudData[] = [
  // HIGH CLOUDS
  {
    id: 1,
    name: "CIRRUS",
    abbreviation: "Ci",
    category: "high",
    altitudeRange: "20,000-40,000 ft",
    temperature: "-40°F to -80°F",
    dropletSize: "10-100 μm (ice)",
    formationTime: "30 min - 2 hrs",
    windSpeed: "100+ mph (jet streams)",
    pressureRange: "300-500 mb",
    weatherPrediction: "Fair weather, change in 8-10 hrs",
    description16bit: "Wispy ice crystals painting the digital sky",
    formation: "Ice crystals in jet stream winds",
    density: "0.01-0.1 g/m³",
    funFact: "Can form 'Virga' - precipitation that evaporates before reaching the ground. Often indicates a change in weather.",
    etymology: "Latin for 'curl of hair' or 'fringe'",
    rarity: "common",
    emoji: "🌤️",
    appearance: "Thin, wispy, hair-like streaks"
  },
  {
    id: 2,
    name: "CIRROSTRATUS",
    abbreviation: "Cs",
    category: "high",
    altitudeRange: "20,000-40,000 ft",
    temperature: "-40°F to -80°F",
    dropletSize: "20-200 μm (ice)",
    formationTime: "2-6 hours",
    windSpeed: "50-150 mph",
    pressureRange: "300-500 mb",
    thickness: "1,000-6,000 ft",
    weatherPrediction: "Rain or snow within 24 hours",
    description16bit: "Translucent ice veil across the pixel horizon",
    formation: "Widespread lifting ahead of weather fronts",
    density: "0.1-0.3 g/m³",
    funFact: "Responsible for 'sun dogs' and 22° halos. The only cloud type that creates a halo around the sun/moon.",
    etymology: "Latin: 'cirrus' (curl) + 'stratus' (layer)",
    rarity: "common",
    emoji: "☁️",
    appearance: "Thin, sheet-like veil covering entire sky"
  },
  {
    id: 3,
    name: "CIRROCUMULUS",
    abbreviation: "Cc",
    category: "high",
    altitudeRange: "20,000-40,000 ft",
    temperature: "-40°F to -80°F",
    dropletSize: "5-50 μm (ice)",
    formationTime: "1-3 hours",
    windSpeed: "40-100 mph",
    pressureRange: "300-500 mb",
    weatherPrediction: "Fair but cold; in tropics = hurricane approaching",
    description16bit: "Pixelated ice puffs in digital formation",
    formation: "Shallow convection at high altitude with wind shear",
    density: "0.01-0.05 g/m³",
    funFact: "Forms the 'Mackerel Sky'. Unlike Altocumulus, these clouds cast no shadow on the ground.",
    etymology: "Latin: 'cirrus' (curl) + 'cumulus' (heap)",
    rarity: "common",
    emoji: "🌥️",
    appearance: "Small white patches in rows, 'mackerel sky'"
  },
  // MID-LEVEL CLOUDS
  {
    id: 4,
    name: "ALTOCUMULUS",
    abbreviation: "Ac",
    category: "mid",
    altitudeRange: "6,500-20,000 ft",
    temperature: "32°F to -20°F",
    dropletSize: "5-30 μm (water + ice)",
    formationTime: "1-4 hours",
    windSpeed: "20-60 mph",
    pressureRange: "500-850 mb",
    thickness: "500-3,000 ft",
    weatherPrediction: "Possible afternoon thunderstorms",
    description16bit: "Mid-level pixel clusters in the digital atmosphere",
    formation: "Convective rolls in mid-atmosphere, orographic lifting",
    density: "0.1-0.5 g/m³",
    funFact: "If seen in the morning, thunderstorms are likely by late afternoon. Often confused with Cirrocumulus but creates shadows.",
    etymology: "Latin: 'altus' (high) + 'cumulus' (heap)",
    rarity: "common",
    emoji: "⛅",
    appearance: "Gray/white patches or layers, larger than cirrocumulus"
  },
  {
    id: 5,
    name: "ALTOSTRATUS",
    abbreviation: "As",
    category: "mid",
    altitudeRange: "6,500-20,000 ft",
    temperature: "32°F to -20°F",
    dropletSize: "5-40 μm (mixed)",
    formationTime: "3-8 hours",
    windSpeed: "15-50 mph",
    pressureRange: "500-850 mb",
    thickness: "2,000-10,000 ft",
    weatherPrediction: "Continuous rain or snow approaching",
    description16bit: "Gray digital filter across the cyber sky",
    formation: "Warm air overriding cooler air masses",
    density: "0.2-0.8 g/m³",
    funFact: "Creates a 'watery sun' or 'frosted glass' look. Unlike Nimbostratus, it usually doesn't produce heavy rain.",
    etymology: "Latin: 'altus' (high) + 'stratus' (layer)",
    rarity: "common",
    emoji: "🌫️",
    appearance: "Gray/blue sheet, sun visible but dimmed"
  },
  {
    id: 6,
    name: "NIMBOSTRATUS",
    abbreviation: "Ns",
    category: "mid",
    altitudeRange: "2,000-18,000 ft",
    temperature: "50°F to -10°F",
    dropletSize: "5-50 μm (water)",
    formationTime: "6-12 hours",
    windSpeed: "10-40 mph",
    pressureRange: "600-950 mb",
    thickness: "3,000-15,000 ft",
    precipitation: "0.1-2 inches per hour",
    weatherPrediction: "Steady rain or snow",
    description16bit: "Heavy gray data cloud blocking all light",
    formation: "Widespread gentle lifting of moist air",
    density: "0.3-1.0 g/m³",
    funFact: "The quintessential 'rain cloud'. Dark enough to require streetlights during the day.",
    etymology: "Latin: 'nimbus' (rain storm) + 'stratus' (layer)",
    rarity: "common",
    emoji: "🌧️",
    appearance: "Dark, thick, uniform gray layer"
  },
  // LOW CLOUDS
  {
    id: 7,
    name: "CUMULUS",
    abbreviation: "Cu",
    category: "low",
    altitudeRange: "1,000-6,500 ft",
    temperature: "70°F to 32°F",
    dropletSize: "5-25 μm (water)",
    formationTime: "30 min - 2 hrs",
    windSpeed: "5-25 mph",
    pressureRange: "850-1013 mb",
    lifespan: "10-30 minutes",
    weatherPrediction: "Fair weather",
    description16bit: "Fluffy white pixels floating in digital space",
    formation: "Daytime heating causing convection",
    density: "0.3-0.8 g/m³",
    funFact: "Can grow into thunderheads (Cumulonimbus). The flat base indicates the condensation level.",
    etymology: "Latin for 'heap' or 'pile'",
    rarity: "common",
    emoji: "☁️",
    appearance: "Puffy, cotton-like, flat bases, rounded tops"
  },
  {
    id: 8,
    name: "STRATOCUMULUS",
    abbreviation: "Sc",
    category: "low",
    altitudeRange: "1,000-6,500 ft",
    temperature: "70°F to 32°F",
    dropletSize: "8-35 μm",
    formationTime: "2-6 hours",
    windSpeed: "10-30 mph",
    pressureRange: "850-1013 mb",
    weatherPrediction: "Generally fair, light precipitation possible",
    description16bit: "Chunky pixel formations in the lower registry",
    formation: "Shallow convection mixing with stable air",
    density: "0.2-0.7 g/m³",
    funFact: "The most common cloud type on Earth. Often looks like a honeycomb or rolls.",
    etymology: "Latin: 'stratus' (layer) + 'cumulus' (heap)",
    rarity: "common",
    emoji: "🌫️",
    appearance: "Low, lumpy gray/white patches or layers"
  },
  {
    id: 9,
    name: "STRATUS",
    abbreviation: "St",
    category: "low",
    altitudeRange: "0-6,500 ft",
    temperature: "70°F to 32°F",
    dropletSize: "5-20 μm (small)",
    formationTime: "2-12 hours",
    windSpeed: "5-20 mph",
    pressureRange: "900-1013 mb",
    thickness: "500-2,000 ft",
    weatherPrediction: "Drizzle or mist possible",
    description16bit: "Uniform gray screen saver across the sky",
    formation: "Fog lifting from ground or gentle cooling",
    density: "0.1-0.5 g/m³",
    funFact: "Essentially fog that isn't touching the ground. Can reduce visibility to zero on mountains.",
    etymology: "Latin for 'layer' or 'blanket'",
    rarity: "common",
    emoji: "🌫️",
    appearance: "Gray layer, often covering entire sky"
  },
  // VERTICAL DEVELOPMENT
  {
    id: 10,
    name: "CUMULONIMBUS",
    abbreviation: "Cb",
    category: "vertical",
    altitudeRange: "1,000-60,000+ ft",
    temperature: "80°F to -80°F",
    dropletSize: "10-100+ μm",
    formationTime: "30 min - 3 hrs",
    windSpeed: "Up to 180 mph updrafts",
    pressureRange: "200-1013 mb",
    energy: "Equivalent to 400,000 car engines",
    weatherPrediction: "Thunderstorms, heavy rain, hail, tornadoes",
    description16bit: "Massive storm tower reaching max altitude limit",
    formation: "Strong vertical convection",
    density: "0.5-3.0 g/m³",
    funFact: "The only cloud that can produce hail, thunder, and lightning. Tops can flatten into an 'anvil'.",
    etymology: "Latin: 'cumulus' (heap) + 'nimbus' (rain storm)",
    rarity: "uncommon",
    emoji: "⛈️",
    appearance: "Towering cloud with anvil top, dark base"
  },
  // RARE CLOUDS
  {
    id: 11,
    name: "MAMMATUS",
    abbreviation: "Ma",
    category: "rare",
    altitudeRange: "6,000-25,000 ft",
    temperature: "-10°F to 60°F",
    dropletSize: "20-100 μm",
    formationTime: "10-15 min per lobe",
    windSpeed: "15-40 mph downdrafts",
    pressureRange: "Variable",
    lifespan: "10 min per lobe, hours total",
    weatherPrediction: "Severe weather nearby",
    description16bit: "Inverted pixel pouches defying gravity",
    formation: "Cold air sinking in downdrafts",
    density: "0.3-1.5 g/m³",
    funFact: "Often appear after the worst of a thunderstorm has passed. Indicative of extreme turbulence.",
    etymology: "Latin: 'mamma' (udder/breast)",
    rarity: "legendary",
    emoji: "🫧",
    appearance: "Pouch-like bulges hanging downward"
  },
  {
    id: 12,
    name: "LENTICULAR",
    abbreviation: "Le",
    category: "rare",
    altitudeRange: "6,500-40,000 ft",
    temperature: "Variable",
    dropletSize: "5-50 μm",
    formationTime: "1-3 hours",
    windSpeed: "40-100+ mph",
    pressureRange: "±50 mb oscillations",
    weatherPrediction: "Turbulent winds near mountains",
    description16bit: "Flying saucer sprites over mountain ranges",
    formation: "Air flowing over mountains creates standing waves",
    density: "0.2-0.8 g/m³",
    funFact: "Formed by standing waves. Glider pilots love them for the 'wave lift' they provide.",
    etymology: "Latin: 'lenticularis' (lens-shaped)",
    rarity: "rare",
    emoji: "🛸",
    appearance: "Lens or saucer-shaped, smooth"
  },
  {
    id: 13,
    name: "ASPERITAS",
    abbreviation: "As",
    category: "rare",
    altitudeRange: "6,000-20,000 ft",
    temperature: "Variable",
    dropletSize: "10-40 μm",
    formationTime: "30 min - 2 hrs",
    windSpeed: "Complex wind shear",
    pressureRange: "Variable",
    weatherPrediction: "Usually harmless despite ominous look",
    description16bit: "Chaotic wave patterns in the sky matrix",
    formation: "Still mysterious - possibly mammatus + wind shear",
    density: "0.3-1.2 g/m³",
    funFact: "First new cloud type added to the International Cloud Atlas in over 60 years (2017).",
    etymology: "Latin: 'asperitas' (roughness)",
    rarity: "legendary",
    emoji: "🌊",
    appearance: "Dramatic wave-like undulations on cloud bottom"
  }
]

export default function CloudTypesPage() {
  const { theme } = useTheme()
  const currentTheme = (theme || 'dark') as ThemeType
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedCloudId, setExpandedCloudId] = useState<number | null>(null)
  const [achievementUnlocked, setAchievementUnlocked] = useState<string>('')

  const themeClasses = getComponentStyles(currentTheme, 'weather')


  // Filter clouds by category
  const filteredClouds = selectedCategory === 'all'
    ? cloudDatabase
    : cloudDatabase.filter(cloud => cloud.category === selectedCategory)

  // Achievement system
  const checkAchievements = (cloudId: number) => {
    const cloud = cloudDatabase.find(c => c.id === cloudId)
    if (!cloud) return

    if (cloud.rarity === 'legendary') {
      setAchievementUnlocked('🏆 LEGENDARY SPOTTER: Rare cloud discovered!')
      setTimeout(() => setAchievementUnlocked(''), 3000)
    } else if (cloud.category === 'rare') {
      setAchievementUnlocked('🎯 RARE HUNTER: Unusual formation identified!')
      setTimeout(() => setAchievementUnlocked(''), 3000)
    } else if (cloud.name === 'CUMULONIMBUS') {
      setAchievementUnlocked('⛈️ STORM CHASER: Storm boss encountered!')
      setTimeout(() => setAchievementUnlocked(''), 3000)
    }
  }

  const handleCloudToggle = (cloudId: number) => {
    // Toggle expansion: if same cloud, collapse it, otherwise expand new one
    setExpandedCloudId(expandedCloudId === cloudId ? null : cloudId)

    // Trigger achievements
    if (expandedCloudId !== cloudId) {
      checkAchievements(cloudId)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return themeClasses.text
      case 'uncommon': return themeClasses.accentText
      case 'rare': return themeClasses.successText
      case 'legendary': return themeClasses.warningText
      default: return themeClasses.text
    }
  }

  const getCategoryStats = () => {
    const stats = {
      high: cloudDatabase.filter(c => c.category === 'high').length,
      mid: cloudDatabase.filter(c => c.category === 'mid').length,
      low: cloudDatabase.filter(c => c.category === 'low').length,
      vertical: cloudDatabase.filter(c => c.category === 'vertical').length,
      rare: cloudDatabase.filter(c => c.category === 'rare').length
    }
    return stats
  }

  const categoryStats = getCategoryStats()

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Achievement Notification */}
        {achievementUnlocked && (
          <div className={`fixed top-4 right-4 z-50 ${themeClasses.cardBg} p-4 border-2 ${themeClasses.borderColor} ${themeClasses.glow}`}
            style={{ boxShadow: `0 0 20px ${themeClasses.shadowColor}` }}>
            <div className={`${themeClasses.headerText} font-mono text-sm font-bold`}>
              {achievementUnlocked}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 font-mono uppercase tracking-wider ${themeClasses.headerText} ${themeClasses.glow}`}>
            16-BIT CLOUD ATLAS
          </h1>
          <p className={`text-lg ${themeClasses.secondaryText} font-mono mb-6`}>
            Comprehensive meteorological database • 13 cloud types loaded
          </p>

          {/* Stats Display */}
          <div className={`${themeClasses.cardBg} p-4 border-2 ${themeClasses.borderColor} inline-block`}
            style={{ boxShadow: `0 0 10px ${themeClasses.shadowColor}` }}>
            <div className="grid grid-cols-5 gap-4 text-xs font-mono">
              <div className="text-center">
                <div className={themeClasses.headerText}>HIGH</div>
                <div className={themeClasses.accentText}>{categoryStats.high}</div>
              </div>
              <div className="text-center">
                <div className={themeClasses.headerText}>MID</div>
                <div className={themeClasses.accentText}>{categoryStats.mid}</div>
              </div>
              <div className="text-center">
                <div className={themeClasses.headerText}>LOW</div>
                <div className={themeClasses.accentText}>{categoryStats.low}</div>
              </div>
              <div className="text-center">
                <div className={themeClasses.headerText}>VERTICAL</div>
                <div className={themeClasses.accentText}>{categoryStats.vertical}</div>
              </div>
              <div className="text-center">
                <div className={themeClasses.headerText}>RARE</div>
                <div className={themeClasses.warningText}>{categoryStats.rare}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {(['all', 'high', 'mid', 'low', 'vertical', 'rare'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200`}
              style={{
                borderColor: selectedCategory === category ? themeClasses.borderColor : themeClasses.secondaryText,
                backgroundColor: selectedCategory === category ? themeClasses.borderColor : themeClasses.cardBg,
                color: selectedCategory === category ? '#000000' : themeClasses.text,
                boxShadow: selectedCategory === category ? `0 0 10px ${themeClasses.shadowColor}` : 'none'
              }}
            >
              {category.toUpperCase()}
              {category !== 'all' && (
                <span className="ml-1 opacity-75">
                  [{category === 'high' ? categoryStats.high :
                    category === 'mid' ? categoryStats.mid :
                      category === 'low' ? categoryStats.low :
                        category === 'vertical' ? categoryStats.vertical :
                          categoryStats.rare}]
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Cloud Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
          {filteredClouds.map((cloud) => (
            <React.Fragment key={cloud.id}>
              {/* Cloud Card */}
              <div>
                <div
                  onClick={() => handleCloudToggle(cloud.id)}
                  className={`${themeClasses.cardBg} p-6 border-2 ${themeClasses.borderColor} text-center cursor-pointer transition-all duration-300 hover:scale-105`}
                  style={{
                    boxShadow: `0 0 15px ${themeClasses.shadowColor}`,
                    borderColor: expandedCloudId === cloud.id ? themeClasses.shadowColor : themeClasses.borderColor,
                    transform: expandedCloudId === cloud.id ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  {/* Cloud Icon & Category Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-5xl">{cloud.emoji}</div>
                    <div className={`text-xs font-mono px-2 py-1 border rounded`}
                      style={{
                        borderColor: getRarityColor(cloud.rarity),
                        color: getRarityColor(cloud.rarity)
                      }}>
                      {cloud.category.toUpperCase()}
                    </div>
                  </div>

                  {/* Cloud Name & Abbreviation */}
                  <h2 className={`text-xl font-bold mb-1 font-mono uppercase tracking-wider ${themeClasses.headerText}`}>
                    {cloud.name}
                  </h2>
                  <div className={`text-sm ${themeClasses.secondaryText} font-mono mb-3`}>
                    ({cloud.abbreviation}) • {cloud.rarity.toUpperCase()}
                  </div>

                  {/* Altitude & Formation Time */}
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className={themeClasses.secondaryText}>Altitude:</span>
                      <span className={themeClasses.headerText}>{cloud.altitudeRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.secondaryText}>Formation:</span>
                      <span className={themeClasses.accentText}>{cloud.formationTime}</span>
                    </div>
                  </div>

                  {/* 16-bit Description */}
                  <div className={`mt-3 p-2 border ${themeClasses.borderColor} bg-opacity-50`}
                    style={{ backgroundColor: themeClasses.shadowColor + '10' }}>
                    <p className={`${themeClasses.text} font-mono text-xs italic`}>
                      &ldquo;{cloud.description16bit}&rdquo;
                    </p>
                  </div>

                  {/* Expand/Collapse Indicator */}
                  <div className={`mt-3 ${themeClasses.secondaryText} text-xs font-mono`}>
                    {expandedCloudId === cloud.id ? '▲ CLICK TO COLLAPSE' : '▼ CLICK FOR DETAILS'}
                  </div>
                </div>
              </div>

              {/* Expanded Details - Appears DIRECTLY BELOW this specific card */}
              {expandedCloudId === cloud.id && (
                <div className="col-span-full mt-6">
                  <div
                    className={`${themeClasses.cardBg} p-8 border-2 transition-all duration-500 ease-in-out overflow-hidden w-full`}
                    style={{
                      borderColor: themeClasses.shadowColor,
                      boxShadow: `0 0 25px ${themeClasses.shadowColor}`,
                      animation: 'slideDown 0.3s ease-out'
                    }}
                  >
                    <style jsx>{`
                      @keyframes slideDown {
                        from {
                          opacity: 0;
                          max-height: 0;
                          transform: translateY(-10px);
                        }
                        to {
                          opacity: 1;
                          max-height: 1000px;
                          transform: translateY(0);
                        }
                      }
                    `}</style>

                    <div className="mb-6">
                      <h3 className={`text-3xl font-bold font-mono uppercase tracking-wider ${themeClasses.headerText} text-center mb-2`}>
                        {cloud.emoji} {cloud.name} TECHNICAL ANALYSIS
                      </h3>
                      <div className={`text-center ${themeClasses.secondaryText} font-mono text-sm`}>
                        Full-Width Cloud Database Entry • Classification: {cloud.category.toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Technical Specifications */}
                      <div>
                        <h4 className={`text-lg font-bold mb-4 font-mono ${themeClasses.headerText} border-b-2 pb-2`}
                          style={{ borderColor: themeClasses.shadowColor }}>
                          📊 TECHNICAL SPECIFICATIONS
                        </h4>
                        <div className="space-y-3 text-sm font-mono">
                          <div className="flex justify-between">
                            <span className={themeClasses.secondaryText}>Altitude Range:</span>
                            <span className={themeClasses.text}>{cloud.altitudeRange}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={themeClasses.secondaryText}>Temperature:</span>
                            <span className={themeClasses.text}>{cloud.temperature}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={themeClasses.secondaryText}>Droplet Size:</span>
                            <span className={themeClasses.text}>{cloud.dropletSize}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={themeClasses.secondaryText}>Formation Time:</span>
                            <span className={themeClasses.text}>{cloud.formationTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={themeClasses.secondaryText}>Wind Speed:</span>
                            <span className={themeClasses.text}>{cloud.windSpeed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={themeClasses.secondaryText}>Pressure Range:</span>
                            <span className={themeClasses.text}>{cloud.pressureRange}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={themeClasses.secondaryText}>Density:</span>
                            <span className={themeClasses.text}>{cloud.density}</span>
                          </div>
                          {cloud.thickness && (
                            <div className="flex justify-between">
                              <span className={themeClasses.secondaryText}>Cloud Thickness:</span>
                              <span className={themeClasses.text}>{cloud.thickness}</span>
                            </div>
                          )}
                          {cloud.energy && (
                            <div className="flex justify-between">
                              <span className={themeClasses.secondaryText}>Convective Energy:</span>
                              <span className={themeClasses.warningText}>{cloud.energy}</span>
                            </div>
                          )}
                          {cloud.etymology && (
                            <div className="pt-2 border-t border-dashed border-gray-500/50 mt-2">
                              <span className={themeClasses.secondaryText}>Etymology: </span>
                              <span className="italic opacity-80">{cloud.etymology}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className={`${themeClasses.accentText} mb-2 font-bold`}>Visual Appearance:</div>
                          <div className={themeClasses.text}>{cloud.appearance}</div>
                        </div>
                        <div>
                          <div className={`${themeClasses.accentText} mb-2 font-bold`}>Formation Process:</div>
                          <div className={themeClasses.text}>{cloud.formation}</div>
                        </div>
                        <div>
                          <div className={`${themeClasses.accentText} mb-2 font-bold`}>16-Bit Description:</div>
                          <div className={`${themeClasses.text} italic p-2 border rounded`}
                            style={{ borderColor: themeClasses.shadowColor + '50', backgroundColor: themeClasses.shadowColor + '10' }}>
                            &quot;{cloud.description16bit}&quot;
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weather Impact & Facts */}
                    <div>
                      <h4 className={`text-lg font-bold mb-4 font-mono ${themeClasses.headerText} border-b-2 pb-2`}
                        style={{ borderColor: themeClasses.shadowColor }}>
                        ⚡ WEATHER IMPACT & DATA
                      </h4>
                      <div className="space-y-4 text-sm font-mono">
                        <div>
                          <div className={`${themeClasses.accentText} mb-2 font-bold`}>Weather Prediction:</div>
                          <div className={`${themeClasses.successText} p-2 border rounded font-bold`}
                            style={{ borderColor: themeClasses.successText + '50', backgroundColor: themeClasses.successText + '10' }}>
                            {cloud.weatherPrediction}
                          </div>
                        </div>
                        <div>
                          <div className={`${themeClasses.accentText} mb-2 font-bold`}>Rarity Classification:</div>
                          <div className={`${getRarityColor(cloud.rarity)} font-bold uppercase`}>
                            {cloud.rarity} ({cloud.category.toUpperCase()} LEVEL)
                          </div>
                        </div>
                        <div>
                          <div className={`${themeClasses.accentText} mb-2 font-bold`}>Meteorological Fact:</div>
                          <div className={themeClasses.text}>{cloud.funFact}</div>
                        </div>
                        {cloud.precipitation && (
                          <div>
                            <div className={`${themeClasses.accentText} mb-2 font-bold`}>Precipitation Rate:</div>
                            <div className={themeClasses.warningText}>{cloud.precipitation}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Close Button */}
                    <div className="mt-8 text-center">
                      <button
                        onClick={() => setExpandedCloudId(null)}
                        className={`px-6 py-2 border-2 ${themeClasses.borderColor} ${themeClasses.text} font-mono text-sm font-bold uppercase tracking-wider hover:bg-opacity-80 transition-all duration-200`}
                        style={{
                          borderColor: themeClasses.shadowColor,
                          backgroundColor: themeClasses.cardBg,
                          boxShadow: `0 0 10px ${themeClasses.shadowColor}33`
                        }}
                      >
                        ✕ CLOSE TECHNICAL ANALYSIS
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Educational Section */}
        <div className="mt-16 max-w-6xl mx-auto">
          <div className={`${themeClasses.cardBg} p-8 border-4 ${themeClasses.borderColor}`}
            style={{ boxShadow: `0 0 20px ${themeClasses.shadowColor}` }}>
            <h3 className={`text-2xl font-bold mb-6 font-mono uppercase tracking-wider ${themeClasses.headerText} text-center`}>
              🎮 CLOUD FORMATION DATABASE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm font-mono">
              <div>
                <h4 className={`${themeClasses.accentText} mb-3 font-bold`}>► ALTITUDE CLASSIFICATIONS:</h4>
                <ul className={`${themeClasses.text} space-y-2`}>
                  <li>• HIGH: 20,000+ ft (Ice crystals)</li>
                  <li>• MID: 6,500-20,000 ft (Water + ice)</li>
                  <li>• LOW: 0-6,500 ft (Water droplets)</li>
                  <li>• VERTICAL: Multi-level towers</li>
                  <li>• RARE: Special conditions only</li>
                </ul>
              </div>
              <div>
                <h4 className={`${themeClasses.accentText} mb-3 font-bold`}>► WEATHER INDICATORS:</h4>
                <ul className={`${themeClasses.text} space-y-2`}>
                  <li>• Cirrus → Change in 8-10 hours</li>
                  <li>• Cumulonimbus → Storm systems</li>
                  <li>• Nimbostratus → Steady rain</li>
                  <li>• Mammatus → Severe weather</li>
                  <li>• Lenticular → Mountain turbulence</li>
                </ul>
              </div>
              <div>
                <h4 className={`${themeClasses.accentText} mb-3 font-bold`}>► FORMATION PHYSICS:</h4>
                <ul className={`${themeClasses.text} space-y-2`}>
                  <li>• Droplet size: 5-200 micrometers</li>
                  <li>• Temperature drop: 2°C per 1000 ft</li>
                  <li>• Nuclei needed: 100-1000/cm³</li>
                  <li>• Humidity: Must reach 100%</li>
                  <li>• Wind shear creates patterns</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement System */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className={`${themeClasses.cardBg} p-6 border-2 ${themeClasses.borderColor} text-center`}
            style={{ boxShadow: `0 0 15px ${themeClasses.shadowColor}` }}>
            <h4 className={`text-lg font-bold mb-4 font-mono uppercase ${themeClasses.headerText}`}>
              🏆 CLOUD SPOTTER ACHIEVEMENTS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className={themeClasses.text}>🌤️ Cloud Spotter: Identify 5 basic types</div>
              <div className={themeClasses.text}>⛈️ Storm Chaser: Witness cumulonimbus</div>
              <div className={themeClasses.text}>🎯 Rare Hunter: Spot unusual formations</div>
              <div className={themeClasses.text}>🏔️ High Altitude: Observe cirrus family</div>
              <div className={themeClasses.text}>🔮 Weather Prophet: Predict from clouds</div>
              <div className={themeClasses.text}>👑 Completionist: All 13 types documented</div>
            </div>
            <div className={`mt-4 ${themeClasses.secondaryText} text-xs`}>
              Click on clouds to unlock achievements!
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
} 