/**
 * Misery Score Service
 *
 * Unified "will this trip suck?" scoring used by both aviation (airport delay risk)
 * and travel (driving conditions). Reuses the existing SeverityLevel / 0–100 scale
 * from travel-corridor-service so badges and colors stay consistent across the app.
 */

import {
  getSeverityLevel,
  SEVERITY_COLORS,
  type SeverityLevel,
} from './travel-corridor-service';

export type MiseryContext = 'airport' | 'road-segment' | 'route' | 'flight';

export type MiseryDriverCategory =
  | 'precip'
  | 'wind'
  | 'visibility'
  | 'turbulence'
  | 'storm'
  | 'temp';

export interface MiseryDriver {
  label: string;
  weight: number;
  category: MiseryDriverCategory;
}

export interface MiseryScore {
  score: number;
  level: SeverityLevel;
  color: string;
  label: string;
  drivers: MiseryDriver[];
  context: MiseryContext;
}

export const MISERY_LEVEL_LABELS: Record<SeverityLevel, string> = {
  green: 'SMOOTH',
  yellow: 'BUMPY',
  orange: 'ROUGH',
  red: 'BRUTAL',
};

export const MISERY_LEVEL_DESCRIPTIONS: Record<SeverityLevel, string> = {
  green: 'No weather impact expected',
  yellow: 'Minor delays or discomfort possible',
  orange: 'Significant delays or hazardous conditions likely',
  red: 'Severe disruption — consider alternatives',
};

export interface AirportMiseryInput {
  ceilingFt?: number;
  visibilityMi?: number;
  windKt?: number;
  gustKt?: number;
  precipitationMmHr?: number;
  snowfallMmHr?: number;
  thunderstormsNearby?: boolean;
  turbulenceNearby?: boolean;
  icingNearby?: boolean;
}

export interface RoadMiseryInput {
  precipitationMmHr?: number;
  snowfallMmHr?: number;
  windGustsKmh?: number;
  visibilityM?: number;
  freezingRain?: boolean;
}

const clampScore = (n: number): number =>
  Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 0;

/**
 * Score an airport's weather-driven delay risk on the unified 0–100 scale.
 * Driver weights are normalized so the most-impactful single condition wins
 * the "headline" driver in the badge.
 */
export function scoreAirportMisery(input: AirportMiseryInput): MiseryScore {
  const drivers: MiseryDriver[] = [];
  let score = 0;

  const ceiling = input.ceilingFt;
  if (ceiling !== undefined && Number.isFinite(ceiling)) {
    if (ceiling < 200) {
      score += 35;
      drivers.push({ label: `Ceiling ${ceiling} ft (LIFR)`, weight: 35, category: 'visibility' });
    } else if (ceiling < 500) {
      score += 25;
      drivers.push({ label: `Low ceiling ${ceiling} ft (IFR)`, weight: 25, category: 'visibility' });
    } else if (ceiling < 1000) {
      score += 12;
      drivers.push({ label: `Ceiling ${ceiling} ft (MVFR)`, weight: 12, category: 'visibility' });
    }
  }

  const vis = input.visibilityMi;
  if (vis !== undefined && Number.isFinite(vis)) {
    if (vis < 1) {
      score += 30;
      drivers.push({ label: `Visibility ${vis.toFixed(1)} mi`, weight: 30, category: 'visibility' });
    } else if (vis < 3) {
      score += 18;
      drivers.push({ label: `Visibility ${vis.toFixed(1)} mi`, weight: 18, category: 'visibility' });
    } else if (vis < 5) {
      score += 8;
      drivers.push({ label: `Reduced vis ${vis.toFixed(1)} mi`, weight: 8, category: 'visibility' });
    }
  }

  const gust = input.gustKt ?? input.windKt ?? 0;
  if (gust >= 50) {
    score += 30;
    drivers.push({ label: `Gusts ${Math.round(gust)} kt`, weight: 30, category: 'wind' });
  } else if (gust >= 35) {
    score += 18;
    drivers.push({ label: `Strong gusts ${Math.round(gust)} kt`, weight: 18, category: 'wind' });
  } else if (gust >= 25) {
    score += 8;
    drivers.push({ label: `Wind ${Math.round(gust)} kt`, weight: 8, category: 'wind' });
  }

  const snow = input.snowfallMmHr ?? 0;
  if (snow >= 5) {
    score += 25;
    drivers.push({ label: 'Heavy snow', weight: 25, category: 'precip' });
  } else if (snow > 0) {
    score += 12;
    drivers.push({ label: 'Snow', weight: 12, category: 'precip' });
  }

  const precip = input.precipitationMmHr ?? 0;
  if (snow === 0 && precip >= 10) {
    score += 15;
    drivers.push({ label: 'Heavy rain', weight: 15, category: 'precip' });
  } else if (snow === 0 && precip >= 2) {
    score += 6;
    drivers.push({ label: 'Rain', weight: 6, category: 'precip' });
  }

  if (input.thunderstormsNearby) {
    score += 25;
    drivers.push({ label: 'Convection in TMA', weight: 25, category: 'storm' });
  }
  if (input.turbulenceNearby) {
    score += 12;
    drivers.push({ label: 'Turbulence advisory', weight: 12, category: 'turbulence' });
  }
  if (input.icingNearby) {
    score += 12;
    drivers.push({ label: 'Icing advisory', weight: 12, category: 'precip' });
  }

  const finalScore = clampScore(score);
  const level = getSeverityLevel(finalScore);

  drivers.sort((a, b) => b.weight - a.weight);

  return {
    score: finalScore,
    level,
    color: SEVERITY_COLORS[level],
    label: MISERY_LEVEL_LABELS[level],
    drivers: drivers.slice(0, 3),
    context: 'airport',
  };
}

/**
 * Score a road segment using the same model travel-corridor-service uses,
 * but produce drivers + label so it renders identically to airport misery.
 */
export function scoreRoadMisery(input: RoadMiseryInput): MiseryScore {
  const drivers: MiseryDriver[] = [];
  let score = 0;

  const snow = input.snowfallMmHr ?? 0;
  if (snow > 1) {
    score += 30;
    drivers.push({ label: 'Heavy snow', weight: 30, category: 'precip' });
  } else if (snow > 0) {
    score += 15;
    drivers.push({ label: 'Snow', weight: 15, category: 'precip' });
  }

  const precip = input.precipitationMmHr ?? 0;
  if (snow === 0 && precip > 5) {
    score += 18;
    drivers.push({ label: 'Heavy rain', weight: 18, category: 'precip' });
  } else if (snow === 0 && precip > 0.5) {
    score += 8;
    drivers.push({ label: 'Rain', weight: 8, category: 'precip' });
  }

  const visM = input.visibilityM ?? 10000;
  if (visM < 1000) {
    score += 25;
    drivers.push({ label: 'Dense fog', weight: 25, category: 'visibility' });
  } else if (visM < 3000) {
    score += 12;
    drivers.push({ label: 'Low visibility', weight: 12, category: 'visibility' });
  }

  const gusts = input.windGustsKmh ?? 0;
  if (gusts > 80) {
    score += 20;
    drivers.push({ label: 'Dangerous winds', weight: 20, category: 'wind' });
  } else if (gusts > 50) {
    score += 10;
    drivers.push({ label: 'High winds', weight: 10, category: 'wind' });
  }

  if (input.freezingRain) {
    score += 25;
    drivers.push({ label: 'Freezing rain', weight: 25, category: 'precip' });
  }

  const finalScore = clampScore(score);
  const level = getSeverityLevel(finalScore);

  drivers.sort((a, b) => b.weight - a.weight);

  return {
    score: finalScore,
    level,
    color: SEVERITY_COLORS[level],
    label: MISERY_LEVEL_LABELS[level],
    drivers: drivers.slice(0, 3),
    context: 'road-segment',
  };
}

/**
 * Combine multiple segment scores into a single trip score.
 * Trip score = max(worst, weighted avg) so a single brutal segment dominates.
 */
export function combineMiseryScores(
  scores: MiseryScore[],
  context: MiseryContext = 'route',
): MiseryScore {
  if (scores.length === 0) {
    return {
      score: 0,
      level: 'green',
      color: SEVERITY_COLORS.green,
      label: MISERY_LEVEL_LABELS.green,
      drivers: [],
      context,
    };
  }

  const worst = scores.reduce((acc, s) => (s.score > acc.score ? s : acc), scores[0]);
  const avg = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
  const finalScore = clampScore(Math.max(worst.score - 5, avg));
  const level = getSeverityLevel(finalScore);

  const driverMap = new Map<string, MiseryDriver>();
  for (const s of scores) {
    for (const d of s.drivers) {
      const existing = driverMap.get(d.label);
      if (!existing || d.weight > existing.weight) {
        driverMap.set(d.label, d);
      }
    }
  }
  const drivers = [...driverMap.values()].sort((a, b) => b.weight - a.weight).slice(0, 3);

  return {
    score: finalScore,
    level,
    color: SEVERITY_COLORS[level],
    label: MISERY_LEVEL_LABELS[level],
    drivers,
    context,
  };
}
