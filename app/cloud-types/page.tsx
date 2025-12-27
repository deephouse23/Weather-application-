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


import React, { useState } from "react"
import { useTheme } from "next-themes"
import PageWrapper from "@/components/page-wrapper"
import { getComponentStyles, type ThemeType } from "@/lib/theme-utils"

// Shadcn UI components
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"


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

// Cloud database
const cloudDatabase: CloudData[] = [
  // HIGH CLOUDS
  {
    id: 1,
    name: "CIRRUS",
    abbreviation: "Ci",
    category: "high",
    altitudeRange: "20,000-40,000 ft",
    temperature: "-40 to -80F",
    dropletSize: "10-100 um (ice)",
    formationTime: "30 min - 2 hrs",
    windSpeed: "100+ mph (jet streams)",
    pressureRange: "300-500 mb",
    weatherPrediction: "Fair weather, change in 8-10 hrs",
    description16bit: "Wispy ice crystals painting the digital sky",
    formation: "Ice crystals in jet stream winds",
    density: "0.01-0.1 g/m3",
    funFact: "Can form 'Virga' - precipitation that evaporates before reaching the ground.",
    etymology: "Latin for 'curl of hair' or 'fringe'",
    rarity: "common",
    emoji: "cirrus",
    appearance: "Thin, wispy, hair-like streaks"
  },
  {
    id: 2,
    name: "CIRROSTRATUS",
    abbreviation: "Cs",
    category: "high",
    altitudeRange: "20,000-40,000 ft",
    temperature: "-40 to -80F",
    dropletSize: "20-200 um (ice)",
    formationTime: "2-6 hours",
    windSpeed: "50-150 mph",
    pressureRange: "300-500 mb",
    thickness: "1,000-6,000 ft",
    weatherPrediction: "Rain or snow within 24 hours",
    description16bit: "Translucent ice veil across the pixel horizon",
    formation: "Widespread lifting ahead of weather fronts",
    density: "0.1-0.3 g/m3",
    funFact: "Responsible for 'sun dogs' and 22 degree halos.",
    etymology: "Latin: 'cirrus' (curl) + 'stratus' (layer)",
    rarity: "common",
    emoji: "cirrostratus",
    appearance: "Thin, sheet-like veil covering entire sky"
  },
  {
    id: 3,
    name: "CIRROCUMULUS",
    abbreviation: "Cc",
    category: "high",
    altitudeRange: "20,000-40,000 ft",
    temperature: "-40 to -80F",
    dropletSize: "5-50 um (ice)",
    formationTime: "1-3 hours",
    windSpeed: "40-100 mph",
    pressureRange: "300-500 mb",
    weatherPrediction: "Fair but cold; in tropics = hurricane approaching",
    description16bit: "Pixelated ice puffs in digital formation",
    formation: "Shallow convection at high altitude with wind shear",
    density: "0.01-0.05 g/m3",
    funFact: "Forms the 'Mackerel Sky'. Unlike Altocumulus, these clouds cast no shadow.",
    etymology: "Latin: 'cirrus' (curl) + 'cumulus' (heap)",
    rarity: "common",
    emoji: "cirrocumulus",
    appearance: "Small white patches in rows, 'mackerel sky'"
  },
  // MID-LEVEL CLOUDS
  {
    id: 4,
    name: "ALTOCUMULUS",
    abbreviation: "Ac",
    category: "mid",
    altitudeRange: "6,500-20,000 ft",
    temperature: "32 to -20F",
    dropletSize: "5-30 um (water + ice)",
    formationTime: "1-4 hours",
    windSpeed: "20-60 mph",
    pressureRange: "500-850 mb",
    thickness: "500-3,000 ft",
    weatherPrediction: "Possible afternoon thunderstorms",
    description16bit: "Mid-level pixel clusters in the digital atmosphere",
    formation: "Convective rolls in mid-atmosphere, orographic lifting",
    density: "0.1-0.5 g/m3",
    funFact: "If seen in the morning, thunderstorms are likely by late afternoon.",
    etymology: "Latin: 'altus' (high) + 'cumulus' (heap)",
    rarity: "common",
    emoji: "altocumulus",
    appearance: "Gray/white patches or layers, larger than cirrocumulus"
  },
  {
    id: 5,
    name: "ALTOSTRATUS",
    abbreviation: "As",
    category: "mid",
    altitudeRange: "6,500-20,000 ft",
    temperature: "32 to -20F",
    dropletSize: "5-40 um (mixed)",
    formationTime: "3-8 hours",
    windSpeed: "15-50 mph",
    pressureRange: "500-850 mb",
    thickness: "2,000-10,000 ft",
    weatherPrediction: "Continuous rain or snow approaching",
    description16bit: "Gray digital filter across the cyber sky",
    formation: "Warm air overriding cooler air masses",
    density: "0.2-0.8 g/m3",
    funFact: "Creates a 'watery sun' or 'frosted glass' look.",
    etymology: "Latin: 'altus' (high) + 'stratus' (layer)",
    rarity: "common",
    emoji: "altostratus",
    appearance: "Gray/blue sheet, sun visible but dimmed"
  },
  {
    id: 6,
    name: "NIMBOSTRATUS",
    abbreviation: "Ns",
    category: "mid",
    altitudeRange: "2,000-18,000 ft",
    temperature: "50 to -10F",
    dropletSize: "5-50 um (water)",
    formationTime: "6-12 hours",
    windSpeed: "10-40 mph",
    pressureRange: "600-950 mb",
    thickness: "3,000-15,000 ft",
    precipitation: "0.1-2 inches per hour",
    weatherPrediction: "Steady rain or snow",
    description16bit: "Heavy gray data cloud blocking all light",
    formation: "Widespread gentle lifting of moist air",
    density: "0.3-1.0 g/m3",
    funFact: "The quintessential 'rain cloud'. Dark enough to require streetlights.",
    etymology: "Latin: 'nimbus' (rain storm) + 'stratus' (layer)",
    rarity: "common",
    emoji: "nimbostratus",
    appearance: "Dark, thick, uniform gray layer"
  },
  // LOW CLOUDS
  {
    id: 7,
    name: "CUMULUS",
    abbreviation: "Cu",
    category: "low",
    altitudeRange: "1,000-6,500 ft",
    temperature: "70 to 32F",
    dropletSize: "5-25 um (water)",
    formationTime: "30 min - 2 hrs",
    windSpeed: "5-25 mph",
    pressureRange: "850-1013 mb",
    lifespan: "10-30 minutes",
    weatherPrediction: "Fair weather",
    description16bit: "Fluffy white pixels floating in digital space",
    formation: "Daytime heating causing convection",
    density: "0.3-0.8 g/m3",
    funFact: "Can grow into thunderheads (Cumulonimbus).",
    etymology: "Latin for 'heap' or 'pile'",
    rarity: "common",
    emoji: "cumulus",
    appearance: "Puffy, cotton-like, flat bases, rounded tops"
  },
  {
    id: 8,
    name: "STRATOCUMULUS",
    abbreviation: "Sc",
    category: "low",
    altitudeRange: "1,000-6,500 ft",
    temperature: "70 to 32F",
    dropletSize: "8-35 um",
    formationTime: "2-6 hours",
    windSpeed: "10-30 mph",
    pressureRange: "850-1013 mb",
    weatherPrediction: "Generally fair, light precipitation possible",
    description16bit: "Chunky pixel formations in the lower registry",
    formation: "Shallow convection mixing with stable air",
    density: "0.2-0.7 g/m3",
    funFact: "The most common cloud type on Earth.",
    etymology: "Latin: 'stratus' (layer) + 'cumulus' (heap)",
    rarity: "common",
    emoji: "stratocumulus",
    appearance: "Low, lumpy gray/white patches or layers"
  },
  {
    id: 9,
    name: "STRATUS",
    abbreviation: "St",
    category: "low",
    altitudeRange: "0-6,500 ft",
    temperature: "70 to 32F",
    dropletSize: "5-20 um (small)",
    formationTime: "2-12 hours",
    windSpeed: "5-20 mph",
    pressureRange: "900-1013 mb",
    thickness: "500-2,000 ft",
    weatherPrediction: "Drizzle or mist possible",
    description16bit: "Uniform gray screen saver across the sky",
    formation: "Fog lifting from ground or gentle cooling",
    density: "0.1-0.5 g/m3",
    funFact: "Essentially fog that isn't touching the ground.",
    etymology: "Latin for 'layer' or 'blanket'",
    rarity: "common",
    emoji: "stratus",
    appearance: "Gray layer, often covering entire sky"
  },
  // VERTICAL DEVELOPMENT
  {
    id: 10,
    name: "CUMULONIMBUS",
    abbreviation: "Cb",
    category: "vertical",
    altitudeRange: "1,000-60,000+ ft",
    temperature: "80 to -80F",
    dropletSize: "10-100+ um",
    formationTime: "30 min - 3 hrs",
    windSpeed: "Up to 180 mph updrafts",
    pressureRange: "200-1013 mb",
    energy: "Equivalent to 400,000 car engines",
    weatherPrediction: "Thunderstorms, heavy rain, hail, tornadoes",
    description16bit: "Massive storm tower reaching max altitude limit",
    formation: "Strong vertical convection",
    density: "0.5-3.0 g/m3",
    funFact: "The only cloud that can produce hail, thunder, and lightning.",
    etymology: "Latin: 'cumulus' (heap) + 'nimbus' (rain storm)",
    rarity: "uncommon",
    emoji: "cumulonimbus",
    appearance: "Towering cloud with anvil top, dark base"
  },
  // RARE CLOUDS
  {
    id: 11,
    name: "MAMMATUS",
    abbreviation: "Ma",
    category: "rare",
    altitudeRange: "6,000-25,000 ft",
    temperature: "-10 to 60F",
    dropletSize: "20-100 um",
    formationTime: "10-15 min per lobe",
    windSpeed: "15-40 mph downdrafts",
    pressureRange: "Variable",
    lifespan: "10 min per lobe, hours total",
    weatherPrediction: "Severe weather nearby",
    description16bit: "Inverted pixel pouches defying gravity",
    formation: "Cold air sinking in downdrafts",
    density: "0.3-1.5 g/m3",
    funFact: "Often appear after the worst of a thunderstorm has passed.",
    etymology: "Latin: 'mamma' (udder/breast)",
    rarity: "legendary",
    emoji: "mammatus",
    appearance: "Pouch-like bulges hanging downward"
  },
  {
    id: 12,
    name: "LENTICULAR",
    abbreviation: "Le",
    category: "rare",
    altitudeRange: "6,500-40,000 ft",
    temperature: "Variable",
    dropletSize: "5-50 um",
    formationTime: "1-3 hours",
    windSpeed: "40-100+ mph",
    pressureRange: "+/-50 mb oscillations",
    weatherPrediction: "Turbulent winds near mountains",
    description16bit: "Flying saucer sprites over mountain ranges",
    formation: "Air flowing over mountains creates standing waves",
    density: "0.2-0.8 g/m3",
    funFact: "Glider pilots love them for the 'wave lift' they provide.",
    etymology: "Latin: 'lenticularis' (lens-shaped)",
    rarity: "rare",
    emoji: "lenticular",
    appearance: "Lens or saucer-shaped, smooth"
  },
  {
    id: 13,
    name: "ASPERITAS",
    abbreviation: "Asp",
    category: "rare",
    altitudeRange: "6,000-20,000 ft",
    temperature: "Variable",
    dropletSize: "10-40 um",
    formationTime: "30 min - 2 hrs",
    windSpeed: "Complex wind shear",
    pressureRange: "Variable",
    weatherPrediction: "Usually harmless despite ominous look",
    description16bit: "Chaotic wave patterns in the sky matrix",
    formation: "Still mysterious - possibly mammatus + wind shear",
    density: "0.3-1.2 g/m3",
    funFact: "First new cloud type added to the International Cloud Atlas in 60+ years (2017).",
    etymology: "Latin: 'asperitas' (roughness)",
    rarity: "legendary",
    emoji: "asperitas",
    appearance: "Dramatic wave-like undulations on cloud bottom"
  }
]

export default function CloudTypesPage() {
  const { theme } = useTheme()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedCloudId, setExpandedCloudId] = useState<number | null>(null)
  const [achievementUnlocked, setAchievementUnlocked] = useState<string>('')

  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'card')


  // Filter clouds by category
  const filteredClouds = selectedCategory === 'all'
    ? cloudDatabase
    : cloudDatabase.filter(cloud => cloud.category === selectedCategory)

  // Achievement system
  const checkAchievements = (cloudId: number) => {
    const cloud = cloudDatabase.find(c => c.id === cloudId)
    if (!cloud) return

    if (cloud.rarity === 'legendary') {
      setAchievementUnlocked('LEGENDARY SPOTTER: Rare cloud discovered!')
      setTimeout(() => setAchievementUnlocked(''), 3000)
    } else if (cloud.category === 'rare') {
      setAchievementUnlocked('RARE HUNTER: Unusual formation identified!')
      setTimeout(() => setAchievementUnlocked(''), 3000)
    } else if (cloud.name === 'CUMULONIMBUS') {
      setAchievementUnlocked('STORM CHASER: Storm boss encountered!')
      setTimeout(() => setAchievementUnlocked(''), 3000)
    }
  }

  const handleCloudToggle = (cloudId: number) => {
    setExpandedCloudId(expandedCloudId === cloudId ? null : cloudId)
    if (expandedCloudId !== cloudId) {
      checkAchievements(cloudId)
    }
  }

  const getRarityVariant = (rarity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (rarity) {
      case 'legendary': return 'destructive'
      case 'rare': return 'secondary'
      default: return 'outline'
    }
  }

  const getCategoryStats = () => ({
    high: cloudDatabase.filter(c => c.category === 'high').length,
    mid: cloudDatabase.filter(c => c.category === 'mid').length,
    low: cloudDatabase.filter(c => c.category === 'low').length,
    vertical: cloudDatabase.filter(c => c.category === 'vertical').length,
    rare: cloudDatabase.filter(c => c.category === 'rare').length
  })

  const categoryStats = getCategoryStats()

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Achievement Notification */}
        {achievementUnlocked && (
          <Card className={`fixed top-4 right-4 z-50 border-2 ${themeClasses.borderColor} ${themeClasses.glow}`}>
            <CardContent className="p-4">
              <p className={`font-mono text-sm font-bold ${themeClasses.accentText}`}>
                {achievementUnlocked}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 font-mono uppercase tracking-wider ${themeClasses.accentText} ${themeClasses.glow}`}>
            16-BIT CLOUD ATLAS
          </h1>
          <p className={`text-lg font-mono mb-6 ${themeClasses.mutedText}`}>
            Comprehensive meteorological database - 13 cloud types loaded
          </p>

          {/* Stats Display */}
          <Card className={`inline-block border-2 ${themeClasses.borderColor}`}>
            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-4 text-xs font-mono">
                <div className="text-center">
                  <div className={themeClasses.accentText}>HIGH</div>
                  <div className={themeClasses.text}>{categoryStats.high}</div>
                </div>
                <div className="text-center">
                  <div className={themeClasses.accentText}>MID</div>
                  <div className={themeClasses.text}>{categoryStats.mid}</div>
                </div>
                <div className="text-center">
                  <div className={themeClasses.accentText}>LOW</div>
                  <div className={themeClasses.text}>{categoryStats.low}</div>
                </div>
                <div className="text-center">
                  <div className={themeClasses.accentText}>VERTICAL</div>
                  <div className={themeClasses.text}>{categoryStats.vertical}</div>
                </div>
                <div className="text-center">
                  <div className={themeClasses.accentText}>RARE</div>
                  <div className={themeClasses.text}>{categoryStats.rare}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter using Tabs */}
        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent">
            {(['all', 'high', 'mid', 'low', 'vertical', 'rare'] as const).map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className={`px-4 py-2 border-2 text-xs font-mono font-bold uppercase tracking-wider ${themeClasses.borderColor} data-[state=active]:${themeClasses.accentBg} data-[state=active]:text-black`}
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
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Cloud Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
          {filteredClouds.map((cloud) => (
            <React.Fragment key={cloud.id}>
              {/* Cloud Card */}
              <Card
                onClick={() => handleCloudToggle(cloud.id)}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${themeClasses.borderColor} ${expandedCloudId === cloud.id ? themeClasses.glow : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className={`text-3xl font-mono uppercase ${themeClasses.accentText}`}>[{cloud.abbreviation}]</div>
                    <Badge variant={getRarityVariant(cloud.rarity)} className="font-mono text-xs">
                      {cloud.category.toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className={`text-xl font-mono uppercase tracking-wider ${themeClasses.text}`}>
                    {cloud.name}
                  </CardTitle>
                  <CardDescription className={`font-mono ${themeClasses.mutedText}`}>
                    ({cloud.abbreviation}) - {cloud.rarity.toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className={themeClasses.mutedText}>Altitude:</span>
                      <span className={themeClasses.text}>{cloud.altitudeRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.mutedText}>Formation:</span>
                      <span className={themeClasses.accentText}>{cloud.formationTime}</span>
                    </div>
                  </div>

                  {/* 16-bit Description */}
                  <div className={`mt-3 p-2 border ${themeClasses.borderColor} bg-opacity-50`}>
                    <p className={`font-mono text-xs italic ${themeClasses.text}`}>
                      &ldquo;{cloud.description16bit}&rdquo;
                    </p>
                  </div>

                  {/* Expand/Collapse Indicator */}
                  <div className={`mt-3 text-xs font-mono text-center ${themeClasses.mutedText}`}>
                    {expandedCloudId === cloud.id ? '[ CLICK TO COLLAPSE ]' : '[ CLICK FOR DETAILS ]'}
                  </div>
                </CardContent>
              </Card>

              {/* Expanded Details */}
              {expandedCloudId === cloud.id && (
                <Card className={`col-span-full mt-6 border-2 ${themeClasses.borderColor} ${themeClasses.glow}`}>
                  <CardHeader>
                    <CardTitle className={`text-2xl font-mono uppercase tracking-wider text-center ${themeClasses.accentText}`}>
                      [{cloud.abbreviation}] {cloud.name} TECHNICAL ANALYSIS
                    </CardTitle>
                    <CardDescription className={`text-center font-mono ${themeClasses.mutedText}`}>
                      Full-Width Cloud Database Entry - Classification: {cloud.category.toUpperCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Technical Specifications */}
                      <div>
                        <h4 className={`text-lg font-bold mb-4 font-mono ${themeClasses.accentText} border-b-2 pb-2 ${themeClasses.borderColor}`}>
                          TECHNICAL SPECIFICATIONS
                        </h4>
                        <div className="space-y-3 text-sm font-mono">
                          <div className="flex justify-between">
                            <span className={themeClasses.mutedText}>Altitude Range:</span>
                            <span className={themeClasses.text}>{cloud.altitudeRange}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={themeClasses.mutedText}>Temperature:</span>
                            <span className={themeClasses.text}>{cloud.temperature}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={themeClasses.mutedText}>Droplet Size:</span>
                            <span className={themeClasses.text}>{cloud.dropletSize}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={themeClasses.mutedText}>Formation Time:</span>
                            <span className={themeClasses.text}>{cloud.formationTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={themeClasses.mutedText}>Wind Speed:</span>
                            <span className={themeClasses.text}>{cloud.windSpeed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={themeClasses.mutedText}>Pressure Range:</span>
                            <span className={themeClasses.text}>{cloud.pressureRange}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={themeClasses.mutedText}>Density:</span>
                            <span className={themeClasses.text}>{cloud.density}</span>
                          </div>
                          {cloud.thickness && (
                            <div className="flex justify-between">
                              <span className={themeClasses.mutedText}>Cloud Thickness:</span>
                              <span className={themeClasses.text}>{cloud.thickness}</span>
                            </div>
                          )}
                          {cloud.energy && (
                            <div className="flex justify-between">
                              <span className={themeClasses.mutedText}>Convective Energy:</span>
                              <span className={themeClasses.accentText}>{cloud.energy}</span>
                            </div>
                          )}
                          {cloud.etymology && (
                            <div className="pt-2 border-t border-dashed border-gray-500/50 mt-2">
                              <span className={themeClasses.mutedText}>Etymology: </span>
                              <span className="italic opacity-80">{cloud.etymology}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Visual & Formation Info */}
                      <div>
                        <h4 className={`text-lg font-bold mb-4 font-mono ${themeClasses.accentText} border-b-2 pb-2 ${themeClasses.borderColor}`}>
                          VISUAL & FORMATION
                        </h4>
                        <div className="space-y-4 text-sm font-mono">
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
                            <div className={`${themeClasses.text} italic p-2 border rounded ${themeClasses.borderColor}`}>
                              &quot;{cloud.description16bit}&quot;
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Weather Impact & Facts */}
                      <div>
                        <h4 className={`text-lg font-bold mb-4 font-mono ${themeClasses.accentText} border-b-2 pb-2 ${themeClasses.borderColor}`}>
                          WEATHER IMPACT & DATA
                        </h4>
                        <div className="space-y-4 text-sm font-mono">
                          <div>
                            <div className={`${themeClasses.accentText} mb-2 font-bold`}>Weather Prediction:</div>
                            <div className={`p-2 border rounded font-bold ${themeClasses.borderColor} ${themeClasses.text}`}>
                              {cloud.weatherPrediction}
                            </div>
                          </div>
                          <div>
                            <div className={`${themeClasses.accentText} mb-2 font-bold`}>Rarity Classification:</div>
                            <Badge variant={getRarityVariant(cloud.rarity)} className="font-mono">
                              {cloud.rarity.toUpperCase()} ({cloud.category.toUpperCase()} LEVEL)
                            </Badge>
                          </div>
                          <div>
                            <div className={`${themeClasses.accentText} mb-2 font-bold`}>Meteorological Fact:</div>
                            <div className={themeClasses.text}>{cloud.funFact}</div>
                          </div>
                          {cloud.precipitation && (
                            <div>
                              <div className={`${themeClasses.accentText} mb-2 font-bold`}>Precipitation Rate:</div>
                              <div className={themeClasses.text}>{cloud.precipitation}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Close Button */}
                    <div className="mt-8 text-center">
                      <Button
                        onClick={() => setExpandedCloudId(null)}
                        variant="outline"
                        className={`font-mono font-bold uppercase tracking-wider border-2 ${themeClasses.borderColor}`}
                      >
                        CLOSE TECHNICAL ANALYSIS
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Educational Section */}
        <Card className={`mt-16 max-w-6xl mx-auto border-4 ${themeClasses.borderColor}`}>
          <CardHeader>
            <CardTitle className={`text-2xl font-mono uppercase tracking-wider text-center ${themeClasses.accentText}`}>
              CLOUD FORMATION DATABASE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm font-mono">
              <div>
                <h4 className={`${themeClasses.accentText} mb-3 font-bold`}>ALTITUDE CLASSIFICATIONS:</h4>
                <ul className={`${themeClasses.text} space-y-2`}>
                  <li>- HIGH: 20,000+ ft (Ice crystals)</li>
                  <li>- MID: 6,500-20,000 ft (Water + ice)</li>
                  <li>- LOW: 0-6,500 ft (Water droplets)</li>
                  <li>- VERTICAL: Multi-level towers</li>
                  <li>- RARE: Special conditions only</li>
                </ul>
              </div>
              <div>
                <h4 className={`${themeClasses.accentText} mb-3 font-bold`}>WEATHER INDICATORS:</h4>
                <ul className={`${themeClasses.text} space-y-2`}>
                  <li>- Cirrus: Change in 8-10 hours</li>
                  <li>- Cumulonimbus: Storm systems</li>
                  <li>- Nimbostratus: Steady rain</li>
                  <li>- Mammatus: Severe weather</li>
                  <li>- Lenticular: Mountain turbulence</li>
                </ul>
              </div>
              <div>
                <h4 className={`${themeClasses.accentText} mb-3 font-bold`}>FORMATION PHYSICS:</h4>
                <ul className={`${themeClasses.text} space-y-2`}>
                  <li>- Droplet size: 5-200 micrometers</li>
                  <li>- Temperature drop: 2C per 1000 ft</li>
                  <li>- Nuclei needed: 100-1000/cm3</li>
                  <li>- Humidity: Must reach 100%</li>
                  <li>- Wind shear creates patterns</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievement System */}
        <Card className={`mt-8 max-w-4xl mx-auto border-2 ${themeClasses.borderColor}`}>
          <CardHeader>
            <CardTitle className={`text-lg font-mono uppercase text-center ${themeClasses.accentText}`}>
              CLOUD SPOTTER ACHIEVEMENTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className={themeClasses.text}>Cloud Spotter: Identify 5 basic types</div>
              <div className={themeClasses.text}>Storm Chaser: Witness cumulonimbus</div>
              <div className={themeClasses.text}>Rare Hunter: Spot unusual formations</div>
              <div className={themeClasses.text}>High Altitude: Observe cirrus family</div>
              <div className={themeClasses.text}>Weather Prophet: Predict from clouds</div>
              <div className={themeClasses.text}>Completionist: All 13 types documented</div>
            </div>
            <div className={`mt-4 text-center text-xs ${themeClasses.mutedText}`}>
              Click on clouds to unlock achievements!
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}