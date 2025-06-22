"use client"

import React, { useState, useEffect } from "react"
import PageWrapper from "@/components/page-wrapper"
import { ThemeType, themeUtils, APP_CONSTANTS } from "@/lib/utils"

// Theme types to match main app
type WeatherSystemData = {
  id: number;
  name: string;
  classification: string;
  category: 'pressure' | 'frontal' | 'large-scale' | 'specialized';
  pressureRange?: string;
  windSpeed: string;
  formationProcess: string;
  temperatureRange?: string;
  rotation?: string;
  associatedWeather: string;
  seasonalOccurrence?: string;
  geographicRegions: string;
  weatherImpact: string;
  description16bit: string;
  emoji: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'boss-level' | 'elite-tier';
  // Additional optional properties
  slope?: string;
  precipitationType?: string;
  diameter?: string;
  altitude?: string;
  waterTransport?: string;
  duration?: string;
  types?: string;
};

export default function WeatherSystemsPage() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(APP_CONSTANTS.THEMES.DARK)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pressure' | 'frontal' | 'large-scale' | 'specialized'>('all')
  const [expandedSystemId, setExpandedSystemId] = useState<number | null>(null)
  const [achievementUnlocked, setAchievementUnlocked] = useState<string>('')

  // Weather Systems Database - Comprehensive 16 systems
  const weatherSystemsDatabase: WeatherSystemData[] = [
    // PRESSURE SYSTEMS
    {
      id: 1,
      name: "CYCLONES",
      classification: "LOW PRESSURE",
      category: "pressure",
      pressureRange: "950-1010 mb",
      windSpeed: "30-80 mph",
      formationProcess: "Warm air rises, creating low pressure at surface. Air converges and rotates counterclockwise (Northern Hemisphere)",
      temperatureRange: "Variable, typically 40-70°F",
      rotation: "Counterclockwise (Northern Hemisphere), Clockwise (Southern Hemisphere)",
      associatedWeather: "Cloudy skies, precipitation, strong winds, storms",
      seasonalOccurrence: "Year-round, more intense in winter",
      geographicRegions: "Mid-latitudes, especially over oceans and continental boundaries",
      weatherImpact: "Brings unsettled weather, rain, snow, and storms to affected regions",
      description16bit: "Spinning vortex of chaos - where low pressure creates nature's washing machine",
      emoji: "🌀",
      rarity: "common"
    },
    {
      id: 2,
      name: "ANTICYCLONES",
      classification: "HIGH PRESSURE",
      category: "pressure",
      pressureRange: "1020-1050 mb",
      windSpeed: "5-25 mph",
      formationProcess: "Cold air descends, creating high pressure at surface. Air diverges and rotates clockwise (Northern Hemisphere)",
      temperatureRange: "Variable, clear skies allow temperature extremes",
      rotation: "Clockwise (Northern Hemisphere), Counterclockwise (Southern Hemisphere)",
      associatedWeather: "Clear skies, calm winds, stable conditions",
      seasonalOccurrence: "Year-round, winter anticyclones can bring extreme cold",
      geographicRegions: "Continental interiors, subtropical regions around 30° latitude",
      weatherImpact: "Brings fair weather, but can cause droughts or temperature extremes",
      description16bit: "High pressure dome of stability - nature's weather shield deflecting storms",
      emoji: "☀️",
      rarity: "common"
    },
    {
      id: 3,
      name: "DEPRESSIONS",
      classification: "MATURE LOW PRESSURE",
      category: "pressure",
      pressureRange: "970-1000 mb",
      windSpeed: "25-60 mph",
      formationProcess: "Fully developed cyclonic system with well-defined warm and cold fronts",
      temperatureRange: "Wide variation across frontal boundaries",
      rotation: "Counterclockwise circulation with frontal boundaries",
      associatedWeather: "Sequential weather changes as fronts pass: warm sector rain, cold front storms",
      seasonalOccurrence: "Most common autumn through spring",
      geographicRegions: "North Atlantic, North Pacific, Southern Ocean storm tracks",
      weatherImpact: "Brings organized weather sequences over 2-3 days as system passes",
      description16bit: "Mature storm system - organized chaos with predictable weather sequences",
      emoji: "🌧️",
      rarity: "uncommon"
    },
    {
      id: 4,
      name: "BLOCKING HIGHS",
      classification: "PERSISTENT HIGH PRESSURE",
      category: "pressure",
      pressureRange: "1025-1055 mb",
      windSpeed: "5-20 mph (light winds)",
      formationProcess: "Anticyclone becomes stationary, blocking normal weather pattern flow",
      temperatureRange: "Can create extreme heat or cold depending on season",
      rotation: "Slow clockwise circulation that diverts weather systems",
      associatedWeather: "Extended periods of similar weather - heat waves, cold snaps, or droughts",
      seasonalOccurrence: "Can occur any season, often persist for weeks",
      geographicRegions: "Can form anywhere but common over continents in summer",
      weatherImpact: "Disrupts normal weather patterns, causes extended extreme conditions",
      description16bit: "Weather roadblock - stationary high pressure fortress deflecting all storms",
      emoji: "🛡️",
      rarity: "elite-tier"
    },

    // FRONTAL SYSTEMS
    {
      id: 5,
      name: "WARM FRONTS",
      classification: "ADVANCING WARM AIR",
      category: "frontal",
      windSpeed: "10-30 mph",
      formationProcess: "Warm air mass gradually overrides cooler air ahead",
      temperatureRange: "Gradual warming as front passes",
      slope: "Gentle (1:200 ratio), extends 500-1000 km ahead",
      associatedWeather: "Light to moderate, widespread, long duration (6-24 hours)",
      precipitationType: "Light to moderate, widespread, long duration",
      geographicRegions: "Mid-latitude regions with contrasting air masses",
      weatherImpact: "Gradual weather deterioration over large area",
      description16bit: "Gentle giant - warm air slowly conquering cold territory with steady rain",
      emoji: "🌤️",
      rarity: "common"
    },
    {
      id: 6,
      name: "COLD FRONTS",
      classification: "ADVANCING COLD AIR",
      category: "frontal",
      windSpeed: "25-60 mph, gusty",
      formationProcess: "Dense cold air rapidly undercuts and lifts warm air",
      temperatureRange: "Sharp temperature drop (10-20°F in hours)",
      slope: "Steep (1:50 ratio), narrow band 50-200 km wide",
      associatedWeather: "Heavy, intense, short duration (1-4 hours)",
      precipitationType: "Heavy, intense, short duration",
      geographicRegions: "Mid-latitude regions, especially Great Plains",
      weatherImpact: "Violent but brief weather followed by clearing and cooling",
      description16bit: "Cold blade - dense air wedge slicing through warmth with thunderous fury",
      emoji: "⚡",
      rarity: "common"
    },
    {
      id: 7,
      name: "OCCLUDED FRONTS",
      classification: "COMPLEX FRONTAL MERGER",
      category: "frontal",
      windSpeed: "20-50 mph",
      formationProcess: "Fast-moving cold front catches up to warm front, lifting warm air completely off surface",
      temperatureRange: "Variable, depends on type of occlusion",
      types: "Cold occlusion (colder air behind) or warm occlusion (less cold air behind)",
      associatedWeather: "Mixed types, can be heavy and prolonged",
      geographicRegions: "Mature storm systems in mid-latitudes",
      weatherImpact: "Complex weather with multiple precipitation types",
      description16bit: "Weather sandwich - cold front devours warm front creating layered chaos",
      emoji: "🥪",
      rarity: "uncommon"
    },
    {
      id: 8,
      name: "STATIONARY FRONTS",
      classification: "NON-MOVING BOUNDARY",
      category: "frontal",
      windSpeed: "Variable, often light",
      formationProcess: "Two air masses meet but neither advances significantly",
      temperatureRange: "Minimal, boundary remains in same location",
      associatedWeather: "Light, intermittent, can persist for days",
      duration: "Can remain stationary for days or weeks",
      geographicRegions: "Anywhere air masses of different temperatures meet",
      weatherImpact: "Extended periods of similar weather on each side of boundary",
      description16bit: "Atmospheric standoff - two air masses locked in eternal stalemate",
      emoji: "⚖️",
      rarity: "uncommon"
    },

    // LARGE-SCALE SYSTEMS
    {
      id: 9,
      name: "ATMOSPHERIC RIVERS",
      classification: "MOISTURE TRANSPORT SYSTEM",
      category: "large-scale",
      windSpeed: "50-150 mph at jet level",
      formationProcess: "Jet stream guides narrow bands of moisture from tropics",
      diameter: "400-600 km wide, 1,000-4,000 km long",
      waterTransport: "Equivalent to 15-30 Mississippi Rivers",
      duration: "Individual events last 1-3 days",
      associatedWeather: "Can provide 30-50% of annual precipitation in single events",
      geographicRegions: "West coasts of continents, especially California, Pacific Northwest",
      weatherImpact: "Can provide 30-50% of annual precipitation in single events",
      description16bit: "Sky river express - atmospheric highway delivering tropical moisture bombs",
      emoji: "🌊",
      rarity: "boss-level"
    },
    {
      id: 10,
      name: "JET STREAMS",
      classification: "HIGH-ALTITUDE WIND SYSTEM",
      category: "large-scale",
      altitude: "30,000-50,000 feet (9-15 km)",
      windSpeed: "80-275 mph",
      formationProcess: "Temperature differences between air masses create pressure gradients",
      diameter: "100-400 km wide, 3-7 km thick",
      types: "Polar Jet (stronger), Subtropical Jet (weaker)",
      seasonalOccurrence: "Shift north in summer, south in winter",
      associatedWeather: "Steer surface weather systems, create turbulence for aircraft",
      geographicRegions: "Global, separate streams for each hemisphere",
      weatherImpact: "Steer surface weather systems, create turbulence for aircraft",
      description16bit: "Atmospheric autobahn - high-speed wind rivers steering Earth's weather",
      emoji: "✈️",
      rarity: "elite-tier"
    },
    {
      id: 11,
      name: "MONSOONS",
      classification: "SEASONAL WIND REVERSAL",
      category: "large-scale",
      windSpeed: "10-40 mph surface winds",
      formationProcess: "Seasonal heating/cooling differences between land and ocean",
      types: "Summer monsoon (wet), Winter monsoon (dry)",
      duration: "3-6 month seasons",
      associatedWeather: "Can deliver 80% of annual rainfall in affected regions",
      geographicRegions: "Tropical and subtropical regions, especially Asia",
      weatherImpact: "Defines wet and dry seasons for billions of people",
      description16bit: "Seasonal wind revolution - continental-scale weather system flip every six months",
      emoji: "🏔️",
      rarity: "elite-tier"
    },
    {
      id: 12,
      name: "POLAR VORTEX",
      classification: "CIRCUMPOLAR CIRCULATION",
      category: "large-scale",
      altitude: "10-50 km high in stratosphere",
      windSpeed: "60-200 mph",
      temperatureRange: "-70 to -100°F at center",
      formationProcess: "Strong temperature gradient around polar regions",
      seasonalOccurrence: "Stronger in winter, weaker in summer",
      associatedWeather: "Contains frigid air, but when disrupted causes extreme cold outbreaks",
      geographicRegions: "Arctic and Antarctic regions, occasional mid-latitude intrusions",
      weatherImpact: "Contains frigid air, but when disrupted causes extreme cold outbreaks",
      description16bit: "Arctic fortress - spinning wall of frigid air guarding polar regions",
      emoji: "🧊",
      rarity: "boss-level"
    },

    // SPECIALIZED SYSTEMS
    {
      id: 13,
      name: "MID-LATITUDE CYCLONES",
      classification: "EXTRA-TROPICAL STORM",
      category: "specialized",
      diameter: "1,500-5,000 km",
      pressureRange: "950-1000 mb at center",
      windSpeed: "30-80 mph",
      formationProcess: "Temperature contrasts along polar front",
      duration: "3-7 days from formation to decay",
      seasonalOccurrence: "Autumn through spring",
      associatedWeather: "Brings most weather changes to mid-latitudes",
      geographicRegions: "30-60° latitude storm tracks",
      weatherImpact: "Brings most weather changes to mid-latitudes",
      description16bit: "Mid-latitude monster - massive spinning storm bringing weather variety to temperate zones",
      emoji: "🌪️",
      rarity: "elite-tier"
    },
    {
      id: 14,
      name: "TROPICAL CYCLONES",
      classification: "TROPICAL STORM SYSTEM",
      category: "specialized",
      diameter: "200-1,000 km",
      pressureRange: "900-980 mb (intense storms)",
      windSpeed: "74+ mph (hurricane threshold)",
      formationProcess: "Warm ocean water (26.5°C+) provides energy",
      seasonalOccurrence: "Late summer/early fall",
      associatedWeather: "Catastrophic winds, storm surge, flooding",
      geographicRegions: "Tropical oceans between 5-30° latitude",
      weatherImpact: "Catastrophic winds, storm surge, flooding",
      description16bit: "Tropical destroyer - ocean-powered spiral of catastrophic winds and water",
      emoji: "🌀",
      rarity: "boss-level"
    },
    {
      id: 15,
      name: "SQUALL LINES",
      classification: "LINEAR THUNDERSTORM COMPLEX",
      category: "specialized",
      diameter: "100-1,000 km long, 20-50 km wide",
      duration: "6-12 hours",
      windSpeed: "60-100+ mph gusts",
      formationProcess: "Cold front or convergence line triggers line of thunderstorms",
      associatedWeather: "Heavy rain, hail, tornadoes, damaging winds",
      geographicRegions: "Great Plains, southeastern US, other continental areas",
      weatherImpact: "Produces most damaging straight-line winds",
      description16bit: "Storm formation flight - squadron of thunderstorms marching in military precision",
      emoji: "⛈️",
      rarity: "rare"
    },
    {
      id: 16,
      name: "MESOSCALE CONVECTIVE COMPLEXES",
      classification: "LARGE THUNDERSTORM CLUSTER",
      category: "specialized",
      diameter: "100-1,000 km",
      duration: "6-20 hours",
      formationProcess: "Multiple thunderstorms merge into organized system",
      windSpeed: "Variable, 50-100+ mph in embedded storms",
      seasonalOccurrence: "Late spring through early fall",
      associatedWeather: "Heavy rainfall, flash flooding, hail, occasional tornadoes",
      geographicRegions: "Great Plains, Midwest US, similar continental regions",
      weatherImpact: "Major source of warm-season precipitation and flooding",
      description16bit: "Thunderstorm metropolis - sprawling city of storms dominating the night sky",
      emoji: "🏙️",
      rarity: "rare"
    }
  ];

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

  // Filter systems by category
  const filteredSystems = selectedCategory === 'all' 
    ? weatherSystemsDatabase 
    : weatherSystemsDatabase.filter(system => system.category === selectedCategory)

  // Achievement system
  const checkAchievements = (systemId: number) => {
    const system = weatherSystemsDatabase.find(s => s.id === systemId)
    if (!system) return

    let achievement = ''
    
    if (system.rarity === 'boss-level') {
      achievement = '🏆 BOSS LEVEL UNLOCKED! You discovered a legendary weather system!'
    } else if (system.rarity === 'elite-tier') {
      achievement = '⭐ ELITE TIER! You found a high-level atmospheric phenomenon!'
    } else if (system.category === 'large-scale') {
      achievement = '🌍 PLANETARY SCALE! You explored a global weather system!'
    }

    if (achievement) {
      setAchievementUnlocked(achievement)
      setTimeout(() => setAchievementUnlocked(''), 3000)
    }
  }

  const handleSystemToggle = (systemId: number) => {
    if (expandedSystemId === systemId) {
      setExpandedSystemId(null)
    } else {
      setExpandedSystemId(systemId)
      checkAchievements(systemId)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'boss-level': return themeClasses.warningText
      case 'elite-tier': return themeClasses.successText
      case 'rare': return themeClasses.accentText
      case 'uncommon': return themeClasses.headerText
      default: return themeClasses.text
    }
  }

  const getCategoryStats = () => {
    const stats = {
      pressure: weatherSystemsDatabase.filter(s => s.category === 'pressure').length,
      frontal: weatherSystemsDatabase.filter(s => s.category === 'frontal').length,
      'large-scale': weatherSystemsDatabase.filter(s => s.category === 'large-scale').length,
      specialized: weatherSystemsDatabase.filter(s => s.category === 'specialized').length
    }
    return stats
  }

  const categoryStats = getCategoryStats()

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 font-mono uppercase tracking-wider ${themeClasses.headerText} ${themeClasses.glow}`}>
            16-BIT WEATHER SYSTEMS
          </h1>
          <p className={`text-lg ${themeClasses.secondaryText} font-mono mb-6`}>
            Interactive 16-bit atmospheric phenomena database • {weatherSystemsDatabase.length} systems documented
          </p>
        </div>

        {/* Achievement Display */}
        {achievementUnlocked && (
          <div className={`fixed top-4 right-4 z-50 ${themeClasses.cardBg} p-4 border-2 ${themeClasses.borderColor} max-w-sm animate-pulse`}
               style={{ boxShadow: `0 0 20px ${themeClasses.shadowColor}` }}>
            <div className={`${themeClasses.successText} font-mono text-sm font-bold`}>
              {achievementUnlocked}
            </div>
          </div>
        )}

        {/* Category Filter Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {(['all', 'pressure', 'frontal', 'large-scale', 'specialized'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 border-2 font-mono text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                  selectedCategory === category
                    ? `${themeClasses.borderColor} ${themeClasses.cardBg} ${themeClasses.headerText}`
                    : `border-gray-500 bg-transparent ${themeClasses.secondaryText} hover:${themeClasses.borderColor} hover:${themeClasses.text}`
                }`}
                style={selectedCategory === category ? { 
                  borderColor: themeClasses.shadowColor,
                  boxShadow: `0 0 10px ${themeClasses.shadowColor}33`
                } : {}}
              >
                {category === 'all' ? 'ALL SYSTEMS' : category.toUpperCase().replace('-', ' ')}
                {category !== 'all' && ` (${categoryStats[category]})`}
              </button>
            ))}
          </div>
        </div>

        {/* Weather Systems Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSystems.map((system) => (
              <React.Fragment key={system.id}>
                {/* System Card */}
                <div 
                  onClick={() => handleSystemToggle(system.id)}
                  className={`${themeClasses.cardBg} p-6 border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    expandedSystemId === system.id ? themeClasses.borderColor : 'border-gray-600'
                  }`}
                  style={{ 
                    borderColor: expandedSystemId === system.id ? themeClasses.shadowColor : '#666',
                    boxShadow: expandedSystemId === system.id 
                      ? `0 0 20px ${themeClasses.shadowColor}` 
                      : '0 4px 6px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{system.emoji}</div>
                    <h3 className={`text-lg font-bold font-mono uppercase tracking-wider ${themeClasses.headerText} mb-1`}>
                      {system.name}
                    </h3>
                    <div className={`text-xs font-mono ${themeClasses.secondaryText} mb-2`}>
                      {system.classification}
                    </div>
                    <div className={`text-xs font-mono font-bold uppercase ${getRarityColor(system.rarity)}`}>
                      {system.rarity.replace('-', ' ')}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className={themeClasses.secondaryText}>Wind Speed:</span>
                      <span className={themeClasses.text}>{system.windSpeed}</span>
                    </div>
                    {system.pressureRange && (
                      <div className="flex justify-between">
                        <span className={themeClasses.secondaryText}>Pressure:</span>
                        <span className={themeClasses.text}>{system.pressureRange}</span>
                      </div>
                    )}
                    <div>
                      <div className={`${themeClasses.accentText} mb-1 font-bold text-xs`}>Formation:</div>
                      <div className={`${themeClasses.text} text-xs leading-relaxed`}>
                        {system.formationProcess.slice(0, 80)}...
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <span className={`text-xs font-mono ${themeClasses.secondaryText}`}>
                      {expandedSystemId === system.id ? '▼ CLICK TO CLOSE' : '▶ CLICK FOR FULL ANALYSIS'}
                    </span>
                  </div>
                </div>

                {/* Expanded Details - Appears DIRECTLY BELOW this specific card */}
                {expandedSystemId === system.id && (
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
                          {system.emoji} {system.name} TECHNICAL ANALYSIS
                        </h3>
                        <div className={`text-center ${themeClasses.secondaryText} font-mono text-sm`}>
                          Full-Width Weather System Database Entry • Classification: {system.classification}
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
                              <span className={themeClasses.secondaryText}>Wind Speed:</span>
                              <span className={themeClasses.text}>{system.windSpeed}</span>
                            </div>
                            {system.pressureRange && (
                              <div className="flex justify-between">
                                <span className={themeClasses.secondaryText}>Pressure Range:</span>
                                <span className={themeClasses.text}>{system.pressureRange}</span>
                              </div>
                            )}
                            {system.temperatureRange && (
                              <div className="flex justify-between">
                                <span className={themeClasses.secondaryText}>Temperature:</span>
                                <span className={themeClasses.text}>{system.temperatureRange}</span>
                              </div>
                            )}
                            {system.diameter && (
                              <div className="flex justify-between">
                                <span className={themeClasses.secondaryText}>Size:</span>
                                <span className={themeClasses.text}>{system.diameter}</span>
                              </div>
                            )}
                            {system.altitude && (
                              <div className="flex justify-between">
                                <span className={themeClasses.secondaryText}>Altitude:</span>
                                <span className={themeClasses.text}>{system.altitude}</span>
                              </div>
                            )}
                            {system.duration && (
                              <div className="flex justify-between">
                                <span className={themeClasses.secondaryText}>Duration:</span>
                                <span className={themeClasses.text}>{system.duration}</span>
                              </div>
                            )}
                            {system.waterTransport && (
                              <div className="flex justify-between">
                                <span className={themeClasses.secondaryText}>Water Transport:</span>
                                <span className={themeClasses.warningText}>{system.waterTransport}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Formation & Process */}
                        <div>
                          <h4 className={`text-lg font-bold mb-4 font-mono ${themeClasses.headerText} border-b-2 pb-2`}
                              style={{ borderColor: themeClasses.shadowColor }}>
                            ⚡ FORMATION & PROCESS
                          </h4>
                          <div className="space-y-4 text-sm font-mono">
                            <div>
                              <div className={`${themeClasses.accentText} mb-2 font-bold`}>Formation Process:</div>
                              <div className={themeClasses.text}>{system.formationProcess}</div>
                            </div>
                            {system.rotation && (
                              <div>
                                <div className={`${themeClasses.accentText} mb-2 font-bold`}>Rotation Pattern:</div>
                                <div className={themeClasses.text}>{system.rotation}</div>
                              </div>
                            )}
                            {system.types && (
                              <div>
                                <div className={`${themeClasses.accentText} mb-2 font-bold`}>System Types:</div>
                                <div className={themeClasses.text}>{system.types}</div>
                              </div>
                            )}
                            <div>
                              <div className={`${themeClasses.accentText} mb-2 font-bold`}>16-Bit Description:</div>
                              <div className={`${themeClasses.text} italic p-2 border rounded`}
                                   style={{ borderColor: themeClasses.shadowColor + '50', backgroundColor: themeClasses.shadowColor + '10' }}>
                                "{system.description16bit}"
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Weather Impact & Geography */}
                        <div>
                          <h4 className={`text-lg font-bold mb-4 font-mono ${themeClasses.headerText} border-b-2 pb-2`}
                              style={{ borderColor: themeClasses.shadowColor }}>
                            🌍 WEATHER IMPACT & GEOGRAPHY
                          </h4>
                          <div className="space-y-4 text-sm font-mono">
                            <div>
                              <div className={`${themeClasses.accentText} mb-2 font-bold`}>Associated Weather:</div>
                              <div className={`${themeClasses.successText} p-2 border rounded font-bold`}
                                   style={{ borderColor: themeClasses.successText + '50', backgroundColor: themeClasses.successText + '10' }}>
                                {system.associatedWeather}
                              </div>
                            </div>
                            <div>
                              <div className={`${themeClasses.accentText} mb-2 font-bold`}>Geographic Regions:</div>
                              <div className={themeClasses.text}>{system.geographicRegions}</div>
                            </div>
                            <div>
                              <div className={`${themeClasses.accentText} mb-2 font-bold`}>Weather Impact:</div>
                              <div className={themeClasses.text}>{system.weatherImpact}</div>
                            </div>
                            {system.seasonalOccurrence && (
                              <div>
                                <div className={`${themeClasses.accentText} mb-2 font-bold`}>Seasonal Pattern:</div>
                                <div className={themeClasses.text}>{system.seasonalOccurrence}</div>
                              </div>
                            )}
                            <div>
                              <div className={`${themeClasses.accentText} mb-2 font-bold`}>Threat Level:</div>
                              <div className={`${getRarityColor(system.rarity)} font-bold uppercase`}>
                                {system.rarity.replace('-', ' ')} • {system.category.toUpperCase().replace('-', ' ')} CATEGORY
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Close Button */}
                      <div className="mt-8 text-center">
                        <button
                          onClick={() => setExpandedSystemId(null)}
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
        </div>

        {/* Educational Section */}
        <div className="mt-16 max-w-6xl mx-auto">
          <div className={`${themeClasses.cardBg} p-8 border-4 ${themeClasses.borderColor}`}
               style={{ boxShadow: `0 0 20px ${themeClasses.shadowColor}` }}>
            <h3 className={`text-2xl font-bold mb-6 font-mono uppercase tracking-wider ${themeClasses.headerText} text-center`}>
              🎮 WEATHER SYSTEMS CLASSIFICATION DATABASE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm font-mono">
              <div>
                <h4 className={`${themeClasses.accentText} mb-3 font-bold`}>► PRESSURE SYSTEMS:</h4>
                <ul className={`${themeClasses.text} space-y-2`}>
                  <li>• Cyclones: 950-1010 mb</li>
                  <li>• Anticyclones: 1020-1050 mb</li>
                  <li>• Depressions: Mature lows</li>
                  <li>• Blocking Highs: Stationary</li>
                </ul>
              </div>
              <div>
                <h4 className={`${themeClasses.accentText} mb-3 font-bold`}>► FRONTAL SYSTEMS:</h4>
                <ul className={`${themeClasses.text} space-y-2`}>
                  <li>• Warm: Gradual advance</li>
                  <li>• Cold: Rapid undercut</li>
                  <li>• Occluded: Front merger</li>
                  <li>• Stationary: Boundary hold</li>
                </ul>
              </div>
              <div>
                <h4 className={`${themeClasses.accentText} mb-3 font-bold`}>► LARGE-SCALE:</h4>
                <ul className={`${themeClasses.text} space-y-2`}>
                  <li>• Atmospheric Rivers: Moisture transport</li>
                  <li>• Jet Streams: High-altitude winds</li>
                  <li>• Monsoons: Seasonal reversal</li>
                  <li>• Polar Vortex: Arctic circulation</li>
                </ul>
              </div>
              <div>
                <h4 className={`${themeClasses.accentText} mb-3 font-bold`}>► SPECIALIZED:</h4>
                <ul className={`${themeClasses.text} space-y-2`}>
                  <li>• Mid-Latitude Cyclones: Extra-tropical</li>
                  <li>• Tropical Cyclones: Hurricane systems</li>
                  <li>• Squall Lines: Linear storms</li>
                  <li>• Mesoscale Complexes: Storm clusters</li>
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
              🏆 METEOROLOGIST ACHIEVEMENTS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className={themeClasses.text}>🌀 Storm Tracker: Identify 5 pressure systems</div>
              <div className={themeClasses.text}>❄️ Front Hunter: Master frontal boundaries</div>
              <div className={themeClasses.text}>🌍 Global Observer: Discover large-scale systems</div>
              <div className={themeClasses.text}>⚡ Elite Meteorologist: BOSS LEVEL unlocked</div>
              <div className={themeClasses.text}>🎯 System Specialist: All categories explored</div>
              <div className={themeClasses.text}>👑 Weather Master: Complete database analyzed</div>
            </div>
            <div className={`mt-4 ${themeClasses.secondaryText} text-xs`}>
              Click on weather systems to unlock achievements and explore the atmospheric physics!
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
} 