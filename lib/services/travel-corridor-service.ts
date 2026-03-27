/**
 * Travel Corridor Service
 *
 * Scores weather conditions along US interstate corridors using Open-Meteo data.
 */

export interface WeatherConditions {
  precipitation: number;  // mm/h
  snowfall: number;       // cm/h
  windGusts: number;      // km/h
  visibility: number;     // meters
  freezingLevel: number;  // meters above ground
}

/** Sanitize a numeric value, defaulting non-finite to a fallback. */
function sanitize(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : fallback;
}

/**
 * Score weather severity on a 0-100 scale.
 * 0 = clear, 25 = caution, 50 = hazardous, 75+ = dangerous
 */
export function scoreWeatherSeverity(conditions: WeatherConditions): number {
  const precipitation = sanitize(conditions.precipitation, 0);
  const snowfall = sanitize(conditions.snowfall, 0);
  const windGusts = sanitize(conditions.windGusts, 0);
  const visibility = Number.isFinite(conditions.visibility) ? Math.max(0, conditions.visibility) : 10000;

  let score = 0;

  // Precipitation (rain): 0-25 points
  if (precipitation > 0) {
    score += Math.min(25, precipitation * 5);
  }

  // Snowfall: 0-30 points (more dangerous than rain)
  if (snowfall > 0) {
    score += Math.min(30, snowfall * 15);
  }

  // Wind gusts: 0-20 points (starts impacting at 40 km/h)
  if (windGusts > 40) {
    score += Math.min(20, (windGusts - 40) * 0.5);
  }

  // Visibility: 0-25 points (under 5000m is concerning)
  if (visibility < 5000) {
    score += Math.min(25, ((5000 - visibility) / 5000) * 25);
  }

  return Number.isFinite(score) ? Math.min(100, Math.round(score)) : 0;
}

export type SeverityLevel = 'green' | 'yellow' | 'orange' | 'red';

export function getSeverityLevel(score: number): SeverityLevel {
  if (score >= 75) return 'red';
  if (score >= 50) return 'orange';
  if (score >= 25) return 'yellow';
  return 'green';
}

export const SEVERITY_COLORS: Record<string, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  red: '#ef4444',
  unknown: '#6b7280',
};

export interface CorridorSegment {
  lat: number;
  lon: number;
  score: number;
  level: SeverityLevel;
  color: string;
}

export interface CorridorResult {
  name: string;
  score: number;
  level: SeverityLevel;
  color: string;
  hazard: string;
  segments: CorridorSegment[];
}

export function getWorstCorridors(corridors: CorridorResult[], limit: number): CorridorResult[] {
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  return [...corridors]
    .filter(c => c.hazard !== 'Data unavailable')
    .sort((a, b) => b.score - a.score)
    .slice(0, safeLimit);
}

export function getHazardDescription(conditions: WeatherConditions): string {
  if (conditions.snowfall > 1) return 'Heavy snow';
  if (conditions.snowfall > 0) return 'Snow';
  if (conditions.visibility < 1000) return 'Dense fog';
  if (conditions.visibility < 3000) return 'Low visibility';
  if (conditions.precipitation > 5) return 'Heavy rain';
  if (conditions.precipitation > 0.5) return 'Rain';
  if (conditions.windGusts > 80) return 'Dangerous winds';
  if (conditions.windGusts > 50) return 'High winds';
  return 'Clear';
}
