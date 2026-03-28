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
  cloudType: 'genus' | 'species' | 'variety' | 'feature' | 'special';
  parentGenus: string | null;
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
    cloudType: "genus",
    parentGenus: null,
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
    cloudType: "genus",
    parentGenus: null,
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
    cloudType: "genus",
    parentGenus: null,
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
    cloudType: "genus",
    parentGenus: null,
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
    cloudType: "genus",
    parentGenus: null,
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
    cloudType: "genus",
    parentGenus: null,
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
    cloudType: "genus",
    parentGenus: null,
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
    cloudType: "genus",
    parentGenus: null,
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
    cloudType: "genus",
    parentGenus: null,
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
    cloudType: "genus",
    parentGenus: null,
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
  // RARE CLOUDS (GENUS)
  {
    id: 11,
    name: "MAMMATUS",
    abbreviation: "Ma",
    category: "rare",
    cloudType: "genus",
    parentGenus: null,
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
    cloudType: "genus",
    parentGenus: null,
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
    cloudType: "genus",
    parentGenus: null,
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
  },
  // CLOUD SPECIES
  {
    id: 14,
    name: "CASTELLANUS",
    abbreviation: "cas",
    category: "mid",
    cloudType: "species",
    parentGenus: "Altocumulus / Cirrocumulus",
    altitudeRange: "6,500-40,000 ft",
    temperature: "-40 to 32F",
    dropletSize: "5-40 um (mixed)",
    formationTime: "30 min - 2 hrs",
    windSpeed: "15-60 mph",
    pressureRange: "300-850 mb",
    weatherPrediction: "Mid-level instability; thunderstorms possible within 6 hrs",
    description16bit: "Castle turrets rising from a pixel cloud deck",
    formation: "Convective instability at cloud-top level causes turrets to sprout upward from a common base, indicating mid-level moisture and instability",
    density: "0.1-0.6 g/m3",
    funFact: "Altocumulus castellanus in the morning is one of the strongest visual predictors of afternoon severe thunderstorms.",
    etymology: "Latin: 'castellanus' (pertaining to a castle), for the tower-like protrusions",
    rarity: "uncommon",
    emoji: "castellanus",
    appearance: "Tower-shaped turrets rising from a cloud base, resembling castle battlements"
  },
  {
    id: 15,
    name: "FLOCCUS",
    abbreviation: "flo",
    category: "mid",
    cloudType: "species",
    parentGenus: "Altocumulus / Cirrocumulus / Cirrus",
    altitudeRange: "6,500-40,000 ft",
    temperature: "-40 to 20F",
    dropletSize: "5-50 um (mixed)",
    formationTime: "30 min - 2 hrs",
    windSpeed: "20-80 mph",
    pressureRange: "300-850 mb",
    weatherPrediction: "Mid-level instability; watch for convective development",
    description16bit: "Ragged pixel tufts trailing ghostly virga lines",
    formation: "Convective cells at mid or high levels produce small ragged tufts of cloud; as ice crystals fall from these tufts, trailing virga forms beneath",
    density: "0.05-0.3 g/m3",
    funFact: "Floccus elements often look like tiny jellyfish floating in the sky, each with a rounded top and trailing tentacles of virga.",
    etymology: "Latin: 'floccus' (tuft of wool), describing the ragged, tufted appearance",
    rarity: "uncommon",
    emoji: "floccus",
    appearance: "Ragged tufts with rounded tops and trailing wisps of virga beneath"
  },
  {
    id: 16,
    name: "FIBRATUS",
    abbreviation: "fib",
    category: "high",
    cloudType: "species",
    parentGenus: "Cirrus / Cirrostratus",
    altitudeRange: "20,000-40,000 ft",
    temperature: "-40 to -80F",
    dropletSize: "10-100 um (ice)",
    formationTime: "1-3 hours",
    windSpeed: "60-150 mph",
    pressureRange: "300-500 mb",
    weatherPrediction: "Fair weather; frontal system may approach in 24-48 hrs",
    description16bit: "Ultra-thin hair-like filaments across the digital void",
    formation: "Ice crystals are drawn into long, nearly straight filaments by steady upper-level winds with minimal turbulence or shear",
    density: "0.01-0.05 g/m3",
    funFact: "Cirrus fibratus strands can stretch for hundreds of kilometers across the sky, making them visible from space on satellite imagery.",
    etymology: "Latin: 'fibratus' (fibrous, hair-like), describing the thread-like structure",
    rarity: "common",
    emoji: "fibratus",
    appearance: "Nearly straight or gently curved hair-like filaments, without hooks or tangles"
  },
  {
    id: 17,
    name: "SPISSATUS",
    abbreviation: "spi",
    category: "high",
    cloudType: "species",
    parentGenus: "Cirrus",
    altitudeRange: "25,000-45,000 ft",
    temperature: "-40 to -80F",
    dropletSize: "20-200 um (ice)",
    formationTime: "1-4 hours",
    windSpeed: "60-150 mph",
    pressureRange: "200-400 mb",
    thickness: "3,000-10,000 ft",
    weatherPrediction: "Strong convective activity nearby; remnant anvil from cumulonimbus",
    description16bit: "Dense opaque ice shield from a departed storm boss",
    formation: "Forms from the spreading anvil top of cumulonimbus clouds; the dense ice crystal mass persists after the parent storm dissipates, creating an opaque cirrus patch",
    density: "0.1-0.5 g/m3",
    funFact: "Spissatus is the only cirrus species dense enough to appear gray when viewed toward the sun, and can completely block direct sunlight.",
    etymology: "Latin: 'spissatus' (thickened, dense), for its unusual opacity among cirrus clouds",
    rarity: "uncommon",
    emoji: "spissatus",
    appearance: "Dense, opaque patch of cirrus, grayish when backlit, often from old anvil tops"
  },
  {
    id: 18,
    name: "HUMILIS",
    abbreviation: "hum",
    category: "low",
    cloudType: "species",
    parentGenus: "Cumulus",
    altitudeRange: "2,000-6,500 ft",
    temperature: "70 to 40F",
    dropletSize: "5-20 um (water)",
    formationTime: "15-45 min",
    windSpeed: "5-20 mph",
    pressureRange: "850-1013 mb",
    lifespan: "15-45 minutes",
    weatherPrediction: "Fair weather; stable atmosphere with limited moisture",
    description16bit: "Tiny flat pixel puffs basking in fair-weather sun",
    formation: "Weak daytime thermal convection in a stable atmosphere lifts air parcels to the condensation level; strong capping inversion prevents further vertical growth",
    density: "0.2-0.5 g/m3",
    funFact: "Cumulus humilis are the classic 'fair-weather clouds' and indicate that the atmosphere is too stable for storms. Their flat tops mark the inversion layer.",
    etymology: "Latin: 'humilis' (humble, low), describing their modest vertical extent",
    rarity: "common",
    emoji: "humilis",
    appearance: "Small, flattened cumulus wider than tall, with well-defined flat bases and gently rounded tops"
  },
  {
    id: 19,
    name: "MEDIOCRIS",
    abbreviation: "med",
    category: "low",
    cloudType: "species",
    parentGenus: "Cumulus",
    altitudeRange: "2,000-10,000 ft",
    temperature: "70 to 30F",
    dropletSize: "5-30 um (water)",
    formationTime: "30 min - 1.5 hrs",
    windSpeed: "5-25 mph",
    pressureRange: "700-1013 mb",
    lifespan: "20-60 minutes",
    weatherPrediction: "Moderate instability; possible further development into congestus",
    description16bit: "Medium pixel towers with ambitions of growing taller",
    formation: "Moderate convective thermals push cumulus growth past the humilis stage; the cloud becomes roughly as wide as it is tall, but the inversion is not yet fully breached",
    density: "0.3-0.8 g/m3",
    funFact: "Mediocris is the transitional stage that meteorologists watch closely -- if the atmosphere destabilizes further, these clouds will rapidly grow into congestus and potentially cumulonimbus.",
    etymology: "Latin: 'mediocris' (moderate, middling), for its intermediate vertical development",
    rarity: "common",
    emoji: "mediocris",
    appearance: "Moderate-sized cumulus approximately as wide as tall, with sprouting tops and well-defined edges"
  },
  {
    id: 20,
    name: "CONGESTUS",
    abbreviation: "con",
    category: "vertical",
    cloudType: "species",
    parentGenus: "Cumulus",
    altitudeRange: "2,000-25,000 ft",
    temperature: "70 to -20F",
    dropletSize: "10-50 um (water)",
    formationTime: "30 min - 2 hrs",
    windSpeed: "10-40 mph updrafts",
    pressureRange: "400-1013 mb",
    precipitation: "Brief heavy showers possible",
    weatherPrediction: "Heavy showers likely; may develop into full cumulonimbus",
    description16bit: "Towering pixel column punching through atmospheric layers",
    formation: "Strong convective updrafts push cumulus development well above the freezing level; cauliflower-like tops indicate vigorous growth but glaciation has not yet begun",
    density: "0.5-2.0 g/m3",
    funFact: "Towering cumulus (congestus) can produce heavy rain showers despite lacking the anvil and ice-crystal top of a full cumulonimbus. Pilots call these 'TCU'.",
    etymology: "Latin: 'congestus' (heaped up, accumulated), for the towering piled-up appearance",
    rarity: "uncommon",
    emoji: "congestus",
    appearance: "Tall towering cumulus, much taller than wide, with sharp cauliflower-like tops"
  },
  {
    id: 21,
    name: "CALVUS",
    abbreviation: "cal",
    category: "vertical",
    cloudType: "species",
    parentGenus: "Cumulonimbus",
    altitudeRange: "2,000-40,000 ft",
    temperature: "80 to -60F",
    dropletSize: "10-100+ um (mixed)",
    formationTime: "30 min - 2 hrs",
    windSpeed: "Up to 100 mph updrafts",
    pressureRange: "250-1013 mb",
    energy: "Equivalent to 100,000 car engines",
    precipitation: "Heavy rain, small hail possible",
    weatherPrediction: "Thunderstorms imminent; large hail and strong winds possible",
    description16bit: "Bald storm tower approaching boss-fight status",
    formation: "Cumulus congestus glaciates at its summit as updrafts push cloud tops past the freezing level; the top begins to lose its sharp cauliflower outline and appears smooth or bald, but a full fibrous anvil has not yet formed",
    density: "0.5-2.5 g/m3",
    funFact: "Calvus marks the critical transition from cumulus to cumulonimbus. The smooth, bald top means ice crystals are forming -- lightning can begin at this stage.",
    etymology: "Latin: 'calvus' (bald), for the smooth rounded top lacking a fibrous anvil",
    rarity: "uncommon",
    emoji: "calvus",
    appearance: "Massive cloud tower with a smooth, rounded, bald top losing its cauliflower texture"
  },
  {
    id: 22,
    name: "CAPILLATUS",
    abbreviation: "cap",
    category: "vertical",
    cloudType: "species",
    parentGenus: "Cumulonimbus",
    altitudeRange: "2,000-60,000+ ft",
    temperature: "80 to -80F",
    dropletSize: "10-100+ um (mixed)",
    formationTime: "1-3 hrs",
    windSpeed: "Up to 180 mph updrafts",
    pressureRange: "200-1013 mb",
    energy: "Equivalent to 400,000 car engines",
    precipitation: "Heavy rain, large hail, tornadoes possible",
    weatherPrediction: "Severe thunderstorms; tornadoes, large hail, damaging winds",
    description16bit: "Fully evolved storm boss with fibrous anvil crown",
    formation: "The cumulonimbus reaches the tropopause and spreads laterally into a massive fibrous or striated anvil; ice crystals stream downwind creating the characteristic hair-like top",
    density: "0.5-3.0 g/m3",
    funFact: "A single cumulonimbus capillatus can contain energy equivalent to 10 Hiroshima-sized atomic bombs and process 8 million tons of water per hour.",
    etymology: "Latin: 'capillatus' (having hair), for the fibrous, hair-like anvil top",
    rarity: "uncommon",
    emoji: "capillatus",
    appearance: "Towering storm cloud with a flat, fibrous, hair-like anvil spreading at the tropopause"
  },
  // CLOUD VARIETIES
  {
    id: 23,
    name: "UNDULATUS",
    abbreviation: "un",
    category: "mid",
    cloudType: "variety",
    parentGenus: "Stratocumulus / Altocumulus / Altostratus / Cirrocumulus",
    altitudeRange: "2,000-40,000 ft",
    temperature: "Variable by altitude",
    dropletSize: "5-50 um (variable)",
    formationTime: "30 min - 3 hrs",
    windSpeed: "15-60 mph",
    pressureRange: "300-1000 mb",
    weatherPrediction: "Generally stable; wind shear present but storms unlikely",
    description16bit: "Rhythmic wave patterns scrolling across the pixel sky",
    formation: "Wind shear at a cloud layer boundary creates gravity waves or Kelvin-Helmholtz instability, producing regular undulations in the cloud sheet resembling ocean swells",
    density: "0.1-0.7 g/m3",
    funFact: "Undulatus clouds are essentially atmospheric ocean waves -- the same physics that governs ocean surface waves creates these beautiful ripple patterns in cloud layers.",
    etymology: "Latin: 'undulatus' (wavy), describing the regular wave-like pattern",
    rarity: "common",
    emoji: "undulatus",
    appearance: "Cloud layers with regular wave or ripple patterns, like corrugated sheets"
  },
  {
    id: 24,
    name: "RADIATUS",
    abbreviation: "ra",
    category: "mid",
    cloudType: "variety",
    parentGenus: "Cumulus / Altocumulus / Stratocumulus / Altostratus / Cirrus",
    altitudeRange: "1,000-40,000 ft",
    temperature: "Variable by altitude",
    dropletSize: "5-100 um (variable)",
    formationTime: "1-4 hours",
    windSpeed: "15-80 mph",
    pressureRange: "300-1013 mb",
    weatherPrediction: "Organized flow pattern; weather depends on parent cloud type",
    description16bit: "Parallel pixel bands converging toward the vanishing point",
    formation: "Parallel rows or bands of cloud align with the prevailing wind direction; perspective causes them to appear to converge toward a point on the horizon, similar to railroad tracks",
    density: "0.1-0.8 g/m3",
    funFact: "Radiatus clouds create one of the most dramatic optical illusions in nature -- truly parallel cloud bands appear to radiate from a single point on the horizon due to perspective.",
    etymology: "Latin: 'radiatus' (having rays), for the apparent radial pattern converging at the horizon",
    rarity: "uncommon",
    emoji: "radiatus",
    appearance: "Parallel bands or rows of cloud appearing to converge toward one or two points on the horizon"
  },
  {
    id: 25,
    name: "LACUNOSUS",
    abbreviation: "la",
    category: "mid",
    cloudType: "variety",
    parentGenus: "Altocumulus / Cirrocumulus",
    altitudeRange: "6,500-40,000 ft",
    temperature: "-40 to 20F",
    dropletSize: "5-40 um (mixed)",
    formationTime: "30 min - 2 hrs",
    windSpeed: "20-60 mph",
    pressureRange: "300-850 mb",
    weatherPrediction: "Unstable mid-level air; typically no significant precipitation",
    description16bit: "Honeycomb mesh overlay on the cloud-layer texture map",
    formation: "Localized sinking air creates regularly spaced holes in a thin cloud layer, forming a net-like or honeycomb pattern; this is essentially the inverse of cellular convection",
    density: "0.05-0.3 g/m3",
    funFact: "Lacunosus is one of the rarest cloud varieties. The honeycomb pattern forms by the same Rayleigh-Benard convection process that creates hexagonal patterns in heated fluids.",
    etymology: "Latin: 'lacunosus' (full of hollows), describing the net-like holes in the cloud layer",
    rarity: "rare",
    emoji: "lacunosus",
    appearance: "Cloud layer perforated with regular round holes, creating a honeycomb or net-like pattern"
  },
  // SUPPLEMENTARY FEATURES
  {
    id: 26,
    name: "VIRGA",
    abbreviation: "vir",
    category: "mid",
    cloudType: "feature",
    parentGenus: "Altocumulus / Altostratus / Cirrocumulus / Cumulonimbus / Cumulus",
    altitudeRange: "3,000-30,000 ft",
    temperature: "Variable",
    dropletSize: "20-200 um (evaporating)",
    formationTime: "10-30 min",
    windSpeed: "10-60 mph",
    pressureRange: "400-900 mb",
    lifespan: "5-30 minutes",
    weatherPrediction: "Dry air below cloud base; microbursts possible from heavy virga",
    description16bit: "Ghost rain pixels evaporating before hitting the ground plane",
    formation: "Precipitation falls from a cloud base but enters a layer of dry, unsaturated air below; droplets or ice crystals evaporate or sublimate before reaching the surface, leaving visible streaks",
    density: "0.01-0.1 g/m3",
    funFact: "Heavy virga from thunderstorms can trigger dangerous microbursts -- the evaporative cooling accelerates air downward at speeds exceeding 100 mph, a major aviation hazard.",
    etymology: "Latin: 'virga' (rod, streak), describing the rod-like precipitation streaks hanging from cloud bases",
    rarity: "common",
    emoji: "virga",
    appearance: "Wispy streaks or curtains of precipitation trailing from cloud bases that fade before reaching the ground"
  },
  {
    id: 27,
    name: "ARCUS",
    abbreviation: "arc",
    category: "low",
    cloudType: "feature",
    parentGenus: "Cumulonimbus",
    altitudeRange: "500-5,000 ft",
    temperature: "50 to 80F",
    dropletSize: "10-50 um (water)",
    formationTime: "10-30 min",
    windSpeed: "30-80+ mph outflow",
    pressureRange: "980-1013 mb",
    weatherPrediction: "Severe thunderstorm gust front; damaging winds imminent",
    description16bit: "Ominous shelf-cloud boss guarding the storm's leading edge",
    formation: "Cold storm outflow (downdraft) undercuts warm, moist inflow air; the resulting sharp boundary lifts warm air rapidly, condensing it into a dramatic wedge-shaped or rolling cloud along the gust front",
    density: "0.3-1.5 g/m3",
    funFact: "Arcus clouds come in two forms: shelf clouds (attached to the parent storm) and roll clouds (detached, rotating horizontally). Roll clouds are extremely rare and spectacular.",
    etymology: "Latin: 'arcus' (arch, bow), for the arch-like shape along the storm leading edge",
    rarity: "rare",
    emoji: "arcus",
    appearance: "Low, horizontal wedge or rolling tube along the leading edge of a thunderstorm"
  },
  {
    id: 28,
    name: "TUBA",
    abbreviation: "tub",
    category: "low",
    cloudType: "feature",
    parentGenus: "Cumulonimbus / Cumulus congestus",
    altitudeRange: "500-6,000 ft",
    temperature: "50 to 80F",
    dropletSize: "10-40 um (water)",
    formationTime: "2-15 min",
    windSpeed: "40-100+ mph rotation",
    pressureRange: "950-1010 mb",
    lifespan: "1-30 minutes",
    weatherPrediction: "Tornado or waterspout possible; take shelter immediately",
    description16bit: "Spinning pixel vortex descending from the cloud base",
    formation: "Intense localized rotation beneath a cumulonimbus or strong cumulus congestus stretches a column of rotating air downward; condensation occurs as pressure drops in the vortex, making the funnel visible",
    density: "0.1-0.5 g/m3",
    funFact: "A tuba becomes a tornado only when the rotating column of air contacts the ground surface. Many funnel clouds remain aloft and dissipate harmlessly.",
    etymology: "Latin: 'tuba' (trumpet, tube), for the elongated funnel shape extending from the cloud base",
    rarity: "rare",
    emoji: "tuba",
    appearance: "Cone-shaped or tubular funnel extending downward from the cloud base, sometimes reaching the ground"
  },
  {
    id: 29,
    name: "MURUS",
    abbreviation: "mur",
    category: "low",
    cloudType: "feature",
    parentGenus: "Cumulonimbus",
    altitudeRange: "500-4,000 ft",
    temperature: "60 to 80F",
    dropletSize: "10-40 um (water)",
    formationTime: "10-30 min",
    windSpeed: "20-60 mph inflow + rotation",
    pressureRange: "970-1010 mb",
    lifespan: "10 min - 1 hour",
    weatherPrediction: "Tornado-producing supercell; extremely dangerous conditions",
    description16bit: "Lowered rotating cloud base -- the storm's targeting system",
    formation: "Persistent, strong updraft inflow into a supercell thunderstorm lowers the cloud base in a localized area; the rain-free base rotates visibly, indicating a mesocyclone below the main storm updraft",
    density: "0.3-1.0 g/m3",
    funFact: "Storm chasers specifically look for wall clouds because a persistent, rotating wall cloud is the most reliable visual indicator that a tornado may form within minutes.",
    etymology: "Latin: 'murus' (wall), for the wall-like lowering of the cloud base beneath a supercell",
    rarity: "rare",
    emoji: "murus",
    appearance: "Isolated, persistent lowering of the rain-free cloud base, often rotating visibly"
  },
  // SPECIAL / RARE CLOUDS
  {
    id: 30,
    name: "NOCTILUCENT",
    abbreviation: "NLC",
    category: "rare",
    cloudType: "special",
    parentGenus: null,
    altitudeRange: "250,000-280,000 ft (76-85 km)",
    temperature: "-180 to -220F (-120C)",
    dropletSize: "30-100 nm (nanometer ice)",
    formationTime: "Hours (mesospheric processes)",
    windSpeed: "150-300 mph (mesospheric winds)",
    pressureRange: "0.001-0.01 mb",
    weatherPrediction: "No tropospheric weather impact; indicator of mesospheric conditions",
    description16bit: "Ethereal glowing pixel grid at the edge of outer space",
    formation: "Water vapor in the mesosphere (80+ km altitude) freezes onto meteoric dust particles at temperatures below -120C; these ultra-thin ice crystal layers are only visible when illuminated by sunlight from below the horizon at twilight",
    density: "~0.00001 g/m3",
    funFact: "Noctilucent clouds are the highest clouds on Earth, forming at the edge of space. They were first observed in 1885 after the eruption of Krakatoa and are becoming more frequent, possibly due to increased atmospheric methane.",
    etymology: "Latin: 'noctis' (night) + 'lucens' (shining) -- 'night-shining clouds'",
    rarity: "legendary",
    emoji: "noctilucent",
    appearance: "Electric blue or silver-white wavy tendrils visible against the twilight sky after sunset or before sunrise"
  },
  {
    id: 31,
    name: "NACREOUS",
    abbreviation: "PSC",
    category: "rare",
    cloudType: "special",
    parentGenus: null,
    altitudeRange: "49,000-82,000 ft (15-25 km)",
    temperature: "-110 to -130F (-78C)",
    dropletSize: "1-10 um (nitric acid ice)",
    formationTime: "Hours (stratospheric cooling)",
    windSpeed: "60-180 mph (polar vortex)",
    pressureRange: "10-100 mb",
    weatherPrediction: "No direct weather impact; indicator of ozone depletion chemistry",
    description16bit: "Iridescent mother-of-pearl shimmer in the stratospheric layer",
    formation: "Extreme cold within the polar stratospheric vortex (below -78C) allows nitric acid trihydrate and water ice to crystallize into thin cloud layers; sunlight diffracts through the uniformly sized particles creating vivid iridescent colors",
    density: "~0.001 g/m3",
    funFact: "Nacreous clouds are beautiful but destructive: they provide surfaces for chemical reactions that destroy ozone. The Antarctic ozone hole is directly linked to these polar stratospheric clouds.",
    etymology: "French: 'nacre' (mother-of-pearl), for the iridescent pastel colors resembling the inside of an oyster shell",
    rarity: "legendary",
    emoji: "nacreous",
    appearance: "Vivid iridescent pastel bands of pink, green, blue, and gold in the stratosphere, visible near sunrise or sunset"
  },
  {
    id: 32,
    name: "KELVIN-HELMHOLTZ",
    abbreviation: "KH",
    category: "rare",
    cloudType: "special",
    parentGenus: null,
    altitudeRange: "6,000-30,000 ft",
    temperature: "Variable",
    dropletSize: "5-40 um (mixed)",
    formationTime: "5-15 min",
    windSpeed: "Requires 15+ mph shear difference",
    pressureRange: "400-900 mb",
    lifespan: "1-5 minutes typically",
    weatherPrediction: "Strong wind shear; moderate to severe turbulence for aviation",
    description16bit: "Ocean wave sprites breaking across the atmospheric horizon",
    formation: "Strong vertical wind shear at a density interface causes the faster-moving upper air to roll over the slower lower air, creating a series of breaking wave crests identical in physics to ocean waves curling and breaking on a shore",
    density: "0.1-0.5 g/m3",
    funFact: "Kelvin-Helmholtz waves are among the most fleeting cloud formations, typically lasting only 1-2 minutes. The same instability occurs on Jupiter, Saturn, and even in the sun's corona.",
    etymology: "Named for Lord Kelvin and Hermann von Helmholtz, who independently described the fluid dynamics of shear instability in the 1860s-1870s",
    rarity: "legendary",
    emoji: "kelvinhelmholtz",
    appearance: "Evenly spaced breaking ocean wave shapes curling over along a cloud layer, resembling waves on a beach"
  },
  {
    id: 33,
    name: "FALLSTREAK HOLE",
    abbreviation: "FSH",
    category: "mid",
    cloudType: "special",
    parentGenus: null,
    altitudeRange: "15,000-25,000 ft",
    temperature: "-4 to -22F (-20 to -30C)",
    dropletSize: "5-30 um supercooled water -> ice",
    formationTime: "15-60 min",
    windSpeed: "20-60 mph",
    pressureRange: "400-700 mb",
    weatherPrediction: "Supercooled cloud layer present; no significant weather impact",
    description16bit: "Circular void punched through the cloud layer's texture map",
    formation: "An aircraft or natural disturbance triggers ice crystal nucleation in a layer of supercooled water droplets; the newly formed ice crystals grow rapidly at the expense of surrounding droplets (Bergeron process), creating an expanding circular gap with virga falling from the center",
    density: "0.1-0.4 g/m3 (surrounding layer)",
    funFact: "Fallstreak holes were once mistaken for UFOs due to their perfectly circular shape. They are almost always triggered by aircraft passing through supercooled altocumulus layers.",
    etymology: "Descriptive English: 'fallstreak' for the precipitation streak falling through the 'hole' in the cloud layer. Also called 'hole-punch clouds' or 'cavum'",
    rarity: "rare",
    emoji: "fallstreak",
    appearance: "Large circular or elliptical hole in a thin cloud layer, often with wispy virga or ice crystals falling from the center"
  },
  {
    id: 34,
    name: "CONTRAILS",
    abbreviation: "Ct",
    category: "high",
    cloudType: "special",
    parentGenus: null,
    altitudeRange: "25,000-45,000 ft",
    temperature: "-40 to -70F",
    dropletSize: "1-30 um (ice)",
    formationTime: "Seconds (instantaneous)",
    windSpeed: "100-250 mph (jet stream)",
    pressureRange: "200-400 mb",
    lifespan: "Seconds to hours depending on humidity",
    weatherPrediction: "Persistent contrails indicate humid upper atmosphere; weather change possible",
    description16bit: "Player trail effect left by high-altitude aircraft sprites",
    formation: "Hot, humid jet exhaust mixes with cold ambient air, causing water vapor to rapidly condense and freeze on soot particles from combustion; if the ambient air is ice-supersaturated, contrails persist and spread into artificial cirrus",
    density: "0.01-0.1 g/m3",
    funFact: "Persistent contrails can spread to cover large areas of sky as artificial cirrus. Studies estimate contrail cirrus has a greater climate warming effect than all the CO2 emitted by aviation combined.",
    etymology: "Contraction of 'condensation trail', coined during World War II when bomber formations created massive contrail fields",
    rarity: "common",
    emoji: "contrails",
    appearance: "Narrow white lines trailing behind aircraft that may persist and spread or dissipate quickly"
  },
  {
    id: 35,
    name: "PYROCUMULUS",
    abbreviation: "PyrCu",
    category: "vertical",
    cloudType: "special",
    parentGenus: null,
    altitudeRange: "3,000-45,000+ ft",
    temperature: "Variable (extreme surface heat)",
    dropletSize: "10-80 um (water + ash)",
    formationTime: "30 min - 3 hrs",
    windSpeed: "30-100+ mph updrafts",
    pressureRange: "250-900 mb",
    precipitation: "Possible dry lightning, spotty rain with ash",
    weatherPrediction: "Fire-generated thunderstorms; erratic extreme fire behavior, dry lightning can start new fires",
    description16bit: "Fire-forged storm boss spawned from burning terrain pixels",
    formation: "Intense heat from large wildfires, volcanic eruptions, or industrial explosions creates powerful convective updrafts that loft moisture, ash, and debris to altitudes where condensation forms towering cumulus; if reaching the full cumulonimbus stage, it becomes a pyrocumulonimbus (pyroCb)",
    density: "0.5-3.0 g/m3 (includes ash)",
    funFact: "Pyrocumulonimbus clouds can inject smoke into the stratosphere, affecting global climate for months. The 2019-2020 Australian bushfires generated pyroCb events that rivaled moderate volcanic eruptions in stratospheric aerosol loading.",
    etymology: "Greek: 'pyro' (fire) + Latin: 'cumulus' (heap) -- 'fire heap cloud'",
    rarity: "rare",
    emoji: "pyrocumulus",
    appearance: "Towering brownish-gray or white cumulus/cumulonimbus rising from a wildfire or eruption plume, often with a dirty brownish base"
  }
]

export default function CloudTypesPage() {
  const { theme } = useTheme()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedCloudId, setExpandedCloudId] = useState<number | null>(null)
  const [achievementUnlocked, setAchievementUnlocked] = useState<string>('')

  const themeClasses = getComponentStyles((theme || 'nord') as ThemeType, 'card')

  // All filter options including cloud type classifications
  type FilterValue = 'all' | 'high' | 'mid' | 'low' | 'vertical' | 'rare' | 'genus' | 'species' | 'variety' | 'feature' | 'special'

  // Filter clouds by category or cloudType
  const filteredClouds = (() => {
    if (selectedCategory === 'all') return cloudDatabase
    // Altitude-based categories
    if (['high', 'mid', 'low', 'vertical', 'rare'].includes(selectedCategory)) {
      return cloudDatabase.filter(cloud => cloud.category === selectedCategory)
    }
    // Cloud type classifications
    return cloudDatabase.filter(cloud => cloud.cloudType === selectedCategory)
  })()

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
    } else if (cloud.cloudType === 'species') {
      setAchievementUnlocked('TAXONOMIST: Cloud species classified!')
      setTimeout(() => setAchievementUnlocked(''), 3000)
    } else if (cloud.cloudType === 'feature') {
      setAchievementUnlocked('FEATURE FINDER: Supplementary feature detected!')
      setTimeout(() => setAchievementUnlocked(''), 3000)
    } else if (cloud.cloudType === 'special') {
      setAchievementUnlocked('PHENOMENON TRACKER: Special cloud phenomenon logged!')
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

  const getTypeStats = () => ({
    genus: cloudDatabase.filter(c => c.cloudType === 'genus').length,
    species: cloudDatabase.filter(c => c.cloudType === 'species').length,
    variety: cloudDatabase.filter(c => c.cloudType === 'variety').length,
    feature: cloudDatabase.filter(c => c.cloudType === 'feature').length,
    special: cloudDatabase.filter(c => c.cloudType === 'special').length
  })

  const categoryStats = getCategoryStats()
  const typeStats = getTypeStats()

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Achievement Notification */}
        {achievementUnlocked && (
          <Card className={`fixed top-4 right-4 z-50 container-primary ${themeClasses.glow}`}>
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
            Comprehensive meteorological database - {cloudDatabase.length} cloud types loaded
          </p>

          {/* Stats Display */}
          <Card className="inline-block container-nested">
            <CardContent className="p-4">
              <div className={`text-xs font-mono mb-2 font-bold ${themeClasses.accentText}`}>BY ALTITUDE</div>
              <div className="grid grid-cols-5 gap-4 text-xs font-mono mb-4">
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
              <div className={`text-xs font-mono mb-2 font-bold ${themeClasses.accentText}`}>BY CLASSIFICATION</div>
              <div className="grid grid-cols-5 gap-4 text-xs font-mono">
                <div className="text-center">
                  <div className={themeClasses.accentText}>GENUS</div>
                  <div className={themeClasses.text}>{typeStats.genus}</div>
                </div>
                <div className="text-center">
                  <div className={themeClasses.accentText}>SPECIES</div>
                  <div className={themeClasses.text}>{typeStats.species}</div>
                </div>
                <div className="text-center">
                  <div className={themeClasses.accentText}>VARIETY</div>
                  <div className={themeClasses.text}>{typeStats.variety}</div>
                </div>
                <div className="text-center">
                  <div className={themeClasses.accentText}>FEATURE</div>
                  <div className={themeClasses.text}>{typeStats.feature}</div>
                </div>
                <div className="text-center">
                  <div className={themeClasses.accentText}>SPECIAL</div>
                  <div className={themeClasses.text}>{typeStats.special}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter using Tabs */}
        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent">
            <TabsTrigger
              value="all"
              className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider card-inner data-[state=active]:${themeClasses.accentBg} data-[state=active]:text-black`}
            >
              ALL
            </TabsTrigger>

            {/* Divider label for altitude filters */}
            <span className={`px-2 py-2 text-xs font-mono ${themeClasses.mutedText} self-center`}>|</span>

            {(['high', 'mid', 'low', 'vertical', 'rare'] as const).map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider card-inner data-[state=active]:${themeClasses.accentBg} data-[state=active]:text-black`}
              >
                {category.toUpperCase()}
                <span className="ml-1 opacity-75">
                  [{category === 'high' ? categoryStats.high :
                    category === 'mid' ? categoryStats.mid :
                      category === 'low' ? categoryStats.low :
                        category === 'vertical' ? categoryStats.vertical :
                          categoryStats.rare}]
                </span>
              </TabsTrigger>
            ))}

            {/* Divider label for classification filters */}
            <span className={`px-2 py-2 text-xs font-mono ${themeClasses.mutedText} self-center`}>|</span>

            {(['genus', 'species', 'variety', 'feature', 'special'] as const).map((cloudType) => (
              <TabsTrigger
                key={cloudType}
                value={cloudType}
                className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider card-inner data-[state=active]:${themeClasses.accentBg} data-[state=active]:text-black`}
              >
                {cloudType.toUpperCase()}
                <span className="ml-1 opacity-75">
                  [{typeStats[cloudType]}]
                </span>
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
                className={`cursor-pointer transition-all duration-300 hover:scale-105 container-primary ${expandedCloudId === cloud.id ? themeClasses.glow : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className={`text-3xl font-mono uppercase ${themeClasses.accentText}`}>[{cloud.abbreviation}]</div>
                    <div className="flex gap-1.5">
                      <Badge variant={getRarityVariant(cloud.rarity)} className="font-mono text-xs">
                        {cloud.category.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="font-mono text-xs">
                        {cloud.cloudType.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className={`text-xl font-mono uppercase tracking-wider ${themeClasses.text}`}>
                    {cloud.name}
                  </CardTitle>
                  <CardDescription className={`font-mono ${themeClasses.mutedText}`}>
                    ({cloud.abbreviation}) - {cloud.rarity.toUpperCase()}
                    {cloud.parentGenus && (
                      <span className="block mt-1 text-xs">Parent: {cloud.parentGenus}</span>
                    )}
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
                  <div className="mt-3 p-2 card-inner rounded bg-opacity-50">
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
                <Card className={`col-span-full mt-6 container-primary ${themeClasses.glow}`}>
                  <CardHeader>
                    <CardTitle className={`text-2xl font-mono uppercase tracking-wider text-center ${themeClasses.accentText}`}>
                      [{cloud.abbreviation}] {cloud.name} TECHNICAL ANALYSIS
                    </CardTitle>
                    <CardDescription className={`text-center font-mono ${themeClasses.mutedText}`}>
                      Full-Width Cloud Database Entry - Classification: {cloud.cloudType.toUpperCase()} | Altitude: {cloud.category.toUpperCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Technical Specifications */}
                      <div>
                        <h4 className={`text-lg font-bold mb-4 font-mono ${themeClasses.accentText} border-b pb-2 border-subtle`}>
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
                          {cloud.parentGenus && (
                            <div className="flex justify-between">
                              <span className={themeClasses.mutedText}>Parent Genus:</span>
                              <span className={themeClasses.accentText}>{cloud.parentGenus}</span>
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
                        <h4 className={`text-lg font-bold mb-4 font-mono ${themeClasses.accentText} border-b pb-2 border-subtle`}>
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
                        <h4 className={`text-lg font-bold mb-4 font-mono ${themeClasses.accentText} border-b pb-2 border-subtle`}>
                          WEATHER IMPACT & DATA
                        </h4>
                        <div className="space-y-4 text-sm font-mono">
                          <div>
                            <div className={`${themeClasses.accentText} mb-2 font-bold`}>Weather Prediction:</div>
                            <div className={`p-2 card-inner rounded font-bold ${themeClasses.text}`}>
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
                          {cloud.lifespan && (
                            <div>
                              <div className={`${themeClasses.accentText} mb-2 font-bold`}>Lifespan:</div>
                              <div className={themeClasses.text}>{cloud.lifespan}</div>
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
                        className="font-mono font-bold uppercase tracking-wider"
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
        <Card className="mt-16 max-w-6xl mx-auto container-primary">
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
                <h4 className={`${themeClasses.accentText} mb-3 font-bold`}>CLOUD TAXONOMY:</h4>
                <ul className={`${themeClasses.text} space-y-2`}>
                  <li>- GENUS: 10 basic cloud types (WMO)</li>
                  <li>- SPECIES: Shape/structure variants</li>
                  <li>- VARIETY: Pattern/transparency modifiers</li>
                  <li>- FEATURE: Supplementary formations</li>
                  <li>- SPECIAL: Rare atmospheric phenomena</li>
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
        <Card className="mt-8 max-w-4xl mx-auto container-nested">
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
              <div className={themeClasses.text}>Taxonomist: Classify a cloud species</div>
              <div className={themeClasses.text}>Feature Finder: Detect a supplementary feature</div>
              <div className={themeClasses.text}>Phenomenon Tracker: Log a special cloud</div>
              <div className={themeClasses.text}>Completionist: All {cloudDatabase.length} types documented</div>
              <div className={themeClasses.text}>Legendary Spotter: Discover a legendary cloud</div>
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
