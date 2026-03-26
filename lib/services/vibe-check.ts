/**
 * 16-Bit Weather Platform - Vibe Check Service
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Comfort scoring algorithm: "What's the vibe today?"
 * Categories: Rough → Meh → Decent → Vibin → Immaculate
 */

export interface VibeInput {
  tempF: number
  humidity: number
  windMph: number
  precipChance: number
  uvIndex: number
  cloudCover: number
}

export interface VibeResult {
  score: number
  category: string
  breakdown: {
    temperature: number
    humidity: number
    wind: number
    precipitation: number
    uv: number
    clouds: number
  }
}

const CATEGORIES = [
  { min: 80, label: 'Immaculate' },
  { min: 60, label: 'Vibin' },
  { min: 40, label: 'Decent' },
  { min: 20, label: 'Meh' },
  { min: 0, label: 'Rough' },
] as const

export function getVibeCategory(score: number): string {
  for (const cat of CATEGORIES) {
    if (score >= cat.min) return cat.label
  }
  return 'Rough'
}

export function calculateVibeScore(input: VibeInput): VibeResult {
  // Temperature (40%): peaks at 72°F, parabolic dropoff
  const tempDiff = Math.abs(input.tempF - 72)
  const temperature = Math.max(0, 100 - (tempDiff * tempDiff) / 12.5)

  // Humidity (25%): peaks at 45%, drops outside 30-60%
  const humDiff = input.humidity < 30
    ? (30 - input.humidity) * 3.33
    : input.humidity > 60
      ? (input.humidity - 60) * 2.5
      : 0
  const humidity = Math.max(0, 100 - humDiff)

  // Wind (15%): peaks at 5mph, drops above 15mph
  const windPenalty = input.windMph <= 5
    ? 0
    : (input.windMph - 5) * 5
  const wind = Math.max(0, 100 - windPenalty)

  // Precipitation (10%): linear 100→0 as chance increases
  const precipitation = Math.max(0, 100 - input.precipChance)

  // UV (5%): peaks at UV 3, drops above 7
  const uvPenalty = input.uvIndex <= 3
    ? 0
    : (input.uvIndex - 3) * 12.5
  const uv = Math.max(0, 100 - uvPenalty)

  // Cloud cover (5%): peaks at 20%, drops at extremes
  const cloudDiff = Math.abs(input.cloudCover - 20)
  const clouds = Math.max(0, 100 - cloudDiff * 1.25)

  const score = Math.round(
    temperature * 0.40 +
    humidity * 0.25 +
    wind * 0.15 +
    precipitation * 0.10 +
    uv * 0.05 +
    clouds * 0.05
  )

  const clampedScore = Math.min(100, Math.max(0, score))

  return {
    score: clampedScore,
    category: getVibeCategory(clampedScore),
    breakdown: {
      temperature: Math.round(temperature),
      humidity: Math.round(humidity),
      wind: Math.round(wind),
      precipitation: Math.round(precipitation),
      uv: Math.round(uv),
      clouds: Math.round(clouds),
    },
  }
}
