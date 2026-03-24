/**
 * 16-Bit Weather Platform - NWS Alerts Service
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 */

export interface AlertCounts {
  total: number
  severity: { extreme: number; severe: number; moderate: number; minor: number }
  urgency: { immediate: number; expected: number; future: number }
}

export interface WISScore {
  score: number
  level: 'green' | 'yellow' | 'orange' | 'red'
  label: string
  activeWarnings: number
  activeWatches: number
  activeAdvisories: number
  totalAlerts: number
}

export interface NWSAlert {
  id: string
  headline: string
  event: string
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme'
  urgency: string
  expires: string
  areaDesc: string
}

export async function fetchActiveAlerts(): Promise<NWSAlert[]> {
  try {
    const response = await fetch('https://api.weather.gov/alerts/active?status=actual&message_type=alert', {
      headers: { 'User-Agent': '16BitWeather/1.0', 'Accept': 'application/geo+json' },
    })
    if (!response.ok) return []
    const data = await response.json()
    return (data.features ?? []).map((f: { properties: Record<string, string> }) => ({
      id: f.properties.id ?? '',
      headline: f.properties.headline ?? '',
      event: f.properties.event ?? '',
      severity: (['Minor', 'Moderate', 'Severe', 'Extreme'] as const).includes(f.properties.severity as any) ? f.properties.severity as NWSAlert['severity'] : 'Minor',
      urgency: f.properties.urgency ?? '',
      expires: f.properties.expires ?? '',
      areaDesc: f.properties.areaDesc ?? '',
    }))
  } catch {
    return []
  }
}

export async function fetchAlertCounts(): Promise<AlertCounts> {
  try {
    const alerts = await fetchActiveAlerts()
    return countsFromAlerts(alerts)
  } catch {
    return { total: 0, severity: { extreme: 0, severe: 0, moderate: 0, minor: 0 }, urgency: { immediate: 0, expected: 0, future: 0 } }
  }
}

export async function getWISScore(): Promise<WISScore> {
  const counts = await fetchAlertCounts()
  return calculateWIS(counts)
}

export function countsFromAlerts(alerts: NWSAlert[]): AlertCounts {
  const counts: AlertCounts = {
    total: alerts.length,
    severity: { extreme: 0, severe: 0, moderate: 0, minor: 0 },
    urgency: { immediate: 0, expected: 0, future: 0 },
  }
  for (const alert of alerts) {
    const sev = alert.severity?.toLowerCase() as 'extreme' | 'severe' | 'moderate' | 'minor'
    if (sev in counts.severity) counts.severity[sev]++
    const urg = alert.urgency?.toLowerCase() as 'immediate' | 'expected' | 'future'
    if (urg in counts.urgency) counts.urgency[urg]++
  }
  return counts
}

export function calculateWIS(counts: AlertCounts): WISScore {
  const { severity } = counts
  const rawScore =
    (severity.extreme * 12) + (severity.severe * 9) +
    (severity.moderate * 4) + (severity.minor * 1)
  const score = Math.min(100, Math.round((rawScore / 600) * 100))

  let level: WISScore['level']
  let label: string
  if (score >= 75) { level = 'red'; label = 'EXTREME' }
  else if (score >= 50) { level = 'orange'; label = 'HIGH' }
  else if (score >= 25) { level = 'yellow'; label = 'MODERATE' }
  else { level = 'green'; label = 'LOW' }

  return {
    score, level, label,
    activeWarnings: severity.extreme + severity.severe,
    activeWatches: severity.moderate,
    activeAdvisories: severity.minor,
    totalAlerts: counts.total,
  }
}
