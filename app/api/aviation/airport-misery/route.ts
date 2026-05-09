/**
 * 16-Bit Weather Platform - Airport Misery Board API Route
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Aggregates METAR observations + SIGMET/AIRMET advisories across the top US
 * hub airports, scores each one with the unified misery model, and returns a
 * sortable board for the aviation page.
 */

import { NextResponse } from 'next/server';
import {
  MAJOR_US_AIRPORTS,
  type MajorAirport,
} from '@/lib/data/major-us-airports';
import {
  scoreAirportMisery,
  type AirportMiseryInput,
  type MiseryScore,
} from '@/lib/services/misery-score-service';
import type { MetarObservation, MetarResponse } from '@/app/api/aviation/metar/route';

export interface AirportMiseryRow {
  airport: MajorAirport;
  score: MiseryScore;
  metar?: MetarObservation;
  isStale?: boolean;
}

interface AirportMiseryResponse {
  airports: AirportMiseryRow[];
  fetchedAt: string;
}

interface AlertLike {
  hazard?: string;
  region?: string;
  rawText?: string;
  text?: string;
  type?: string;
}

const REQUEST_TIMEOUT_MS = 8000;

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Compute ceiling (in feet AGL) from METAR cloud layers.
 * Ceiling = base of the lowest BKN or OVC layer.
 */
function computeCeilingFt(
  clouds: MetarObservation['clouds'] | undefined,
): number | undefined {
  if (!clouds || clouds.length === 0) return undefined;
  let ceiling: number | undefined;
  for (const layer of clouds) {
    if (
      (layer.cover === 'BKN' || layer.cover === 'OVC') &&
      typeof layer.base === 'number'
    ) {
      if (ceiling === undefined || layer.base < ceiling) {
        ceiling = layer.base;
      }
    }
  }
  return ceiling;
}

/**
 * Determine whether an active SIGMET/AIRMET applies to a given airport.
 * Heuristic: text mentions the airport's ICAO, IATA, or state code.
 */
function alertAppliesToAirport(alert: AlertLike, airport: MajorAirport): boolean {
  const haystack = `${alert.region ?? ''} ${alert.text ?? ''} ${alert.rawText ?? ''}`.toUpperCase();
  if (!haystack.trim()) return false;

  if (haystack.includes(airport.icao) || haystack.includes(airport.iata)) return true;
  return haystack.includes(airport.state);
}

interface HazardFlags {
  thunderstormsNearby: boolean;
  turbulenceNearby: boolean;
  icingNearby: boolean;
}

function hazardFlagsFor(airport: MajorAirport, alerts: AlertLike[]): HazardFlags {
  const flags: HazardFlags = {
    thunderstormsNearby: false,
    turbulenceNearby: false,
    icingNearby: false,
  };

  for (const alert of alerts) {
    if (!alertAppliesToAirport(alert, airport)) continue;
    const hazard = (alert.hazard ?? '').toLowerCase();
    if (
      hazard.includes('convect') ||
      hazard.includes('thunderstorm') ||
      hazard.includes('ts')
    ) {
      flags.thunderstormsNearby = true;
    }
    if (hazard.includes('turb')) {
      flags.turbulenceNearby = true;
    }
    if (hazard.includes('ice') || hazard.includes('icing')) {
      flags.icingNearby = true;
    }
  }

  return flags;
}

function placeholderRow(airport: MajorAirport): AirportMiseryRow {
  return {
    airport,
    score: scoreAirportMisery({}),
    isStale: true,
  };
}

async function fetchMetarForAirport(
  airport: MajorAirport,
  baseUrl: string,
): Promise<MetarObservation | undefined> {
  try {
    const res = await fetchWithTimeout(
      `${baseUrl}/api/aviation/metar?station=${airport.icao}`,
      REQUEST_TIMEOUT_MS,
    );
    if (!res.ok) return undefined;
    const data: MetarResponse = await res.json();
    return data.observation;
  } catch (error) {
    console.error('[airport-misery]', `metar fetch failed for ${airport.icao}`, error);
    return undefined;
  }
}

async function fetchAlerts(baseUrl: string): Promise<AlertLike[]> {
  try {
    const res = await fetchWithTimeout(
      `${baseUrl}/api/aviation/alerts`,
      REQUEST_TIMEOUT_MS,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { alerts?: AlertLike[] };
    return Array.isArray(data.alerts) ? data.alerts : [];
  } catch (error) {
    console.error('[airport-misery]', 'alerts fetch failed', error);
    return [];
  }
}

export async function GET() {
  try {
    const baseUrl = getBaseUrl();

    const alerts = await fetchAlerts(baseUrl);

    const rows: AirportMiseryRow[] = await Promise.all(
      MAJOR_US_AIRPORTS.map(async (airport): Promise<AirportMiseryRow> => {
        try {
          const observation = await fetchMetarForAirport(airport, baseUrl);
          const hazards = hazardFlagsFor(airport, alerts);

          if (!observation) {
            return {
              airport,
              score: scoreAirportMisery({ ...hazards }),
              isStale: true,
            };
          }

          const input: AirportMiseryInput = {
            ceilingFt: computeCeilingFt(observation.clouds),
            visibilityMi: observation.visibility,
            windKt: observation.windSpeed,
            gustKt: observation.windGust,
            ...hazards,
          };

          return {
            airport,
            score: scoreAirportMisery(input),
            metar: observation,
            isStale: false,
          };
        } catch (error) {
          console.error('[airport-misery]', `row failed for ${airport.icao}`, error);
          return placeholderRow(airport);
        }
      }),
    );

    const payload: AirportMiseryResponse = {
      airports: rows,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[airport-misery]', error);
    return NextResponse.json(
      { error: 'Failed to build airport misery board' },
      { status: 500 },
    );
  }
}
