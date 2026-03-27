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

/**
 * Score weather severity on a 0-100 scale.
 * 0 = clear, 25 = caution, 50 = hazardous, 75+ = dangerous
 */
export function scoreWeatherSeverity(conditions: WeatherConditions): number {
  let score = 0;

  // Precipitation (rain): 0-25 points
  if (conditions.precipitation > 0) {
    score += Math.min(25, conditions.precipitation * 5);
  }

  // Snowfall: 0-30 points (more dangerous than rain)
  if (conditions.snowfall > 0) {
    score += Math.min(30, conditions.snowfall * 15);
  }

  // Wind gusts: 0-20 points (starts impacting at 40 km/h)
  if (conditions.windGusts > 40) {
    score += Math.min(20, (conditions.windGusts - 40) * 0.5);
  }

  // Visibility: 0-25 points (under 5000m is concerning)
  if (conditions.visibility < 5000) {
    score += Math.min(25, ((5000 - conditions.visibility) / 5000) * 25);
  }

  return Math.min(100, Math.round(score));
}

export type SeverityLevel = 'green' | 'yellow' | 'orange' | 'red';

export function getSeverityLevel(score: number): SeverityLevel {
  if (score >= 75) return 'red';
  if (score >= 50) return 'orange';
  if (score >= 25) return 'yellow';
  return 'green';
}

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  red: '#ef4444',
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
  return [...corridors]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
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
