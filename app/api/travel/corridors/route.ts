/**
 * Travel Corridors API Route
 *
 * Fetches weather data along major US interstate corridors using Open-Meteo,
 * scores driving conditions, and returns corridor severity data.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  scoreWeatherSeverity,
  getSeverityLevel,
  getHazardDescription,
  getWorstCorridors,
  SEVERITY_COLORS,
  DEFAULT_WEATHER_CONDITIONS,
  type WeatherConditions,
  type CorridorResult,
  type CorridorSegment,
} from '@/lib/services/travel-corridor-service';
import interstateData from '@/public/data/us-interstates.json';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

interface InterstateCorridorData {
  name: string;
  waypoints: number[][];
  path: number[][];
}

async function fetchWeatherForWaypoints(
  waypoints: number[][],
  forecastDay: number
): Promise<WeatherConditions[]> {
  const lats = waypoints.map(w => w[0]).join(',');
  const lons = waypoints.map(w => w[1]).join(',');

  const url = new URL(OPEN_METEO_BASE);
  url.searchParams.set('latitude', lats);
  url.searchParams.set('longitude', lons);

  if (forecastDay === 0) {
    url.searchParams.set('current', 'precipitation,snowfall,wind_gusts_10m,visibility');
  } else {
    url.searchParams.set('hourly', 'precipitation,snowfall,wind_gusts_10m,visibility');
    url.searchParams.set('forecast_days', String(forecastDay + 1));
  }
  url.searchParams.set('timezone', 'auto');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { 'User-Agent': '16-Bit-Weather/travel-corridors' },
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo request failed: ${response.status}`);
    }

    const data = await response.json();
    const locations = Array.isArray(data) ? data : [data];

    return locations.map((loc: Record<string, unknown>) => {
      const current = loc.current as Record<string, number> | undefined;
      if (forecastDay === 0 && current) {
        return {
          precipitation: current.precipitation ?? 0,
          snowfall: current.snowfall ?? 0,
          windGusts: current.wind_gusts_10m ?? 0,
          visibility: current.visibility ?? 10000,
          freezingLevel: 3000,
        };
      }

      const hourly = loc.hourly as Record<string, number[]> | undefined;
      if (hourly) {
        const targetHour = forecastDay * 24 + 12;
        const idx = Math.min(targetHour, (hourly.precipitation?.length ?? 1) - 1);
        return {
          precipitation: hourly.precipitation?.[idx] ?? 0,
          snowfall: hourly.snowfall?.[idx] ?? 0,
          windGusts: hourly.wind_gusts_10m?.[idx] ?? 0,
          visibility: hourly.visibility?.[idx] ?? 10000,
          freezingLevel: 3000,
        };
      }

      return { ...DEFAULT_WEATHER_CONDITIONS };
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  try {
    const dayParam = request.nextUrl.searchParams.get('day') ?? '0';
    if (!/^[012]$/.test(dayParam)) {
      return NextResponse.json({ error: 'day must be 0, 1, or 2' }, { status: 400 });
    }
    const forecastDay = Number(dayParam);

    const corridors = (interstateData as { corridors: InterstateCorridorData[] }).corridors;

    // Fetch all corridors in parallel — 19 requests is well within Open-Meteo's rate limits
    const results = await Promise.all(
      corridors.map(async (corridor): Promise<CorridorResult & { path: number[][] }> => {
        try {
          const weatherData = await fetchWeatherForWaypoints(corridor.waypoints, forecastDay);

          const segments: CorridorSegment[] = corridor.waypoints.map((wp, idx) => {
            const conditions = weatherData[idx] || DEFAULT_WEATHER_CONDITIONS;
            const segScore = scoreWeatherSeverity(conditions);
            const segLevel = getSeverityLevel(segScore);
            return {
              lat: wp[0],
              lon: wp[1],
              score: segScore,
              level: segLevel,
              color: SEVERITY_COLORS[segLevel],
            };
          });

          const avgScore = segments.length > 0
            ? Math.round(segments.reduce((sum, s) => sum + s.score, 0) / segments.length)
            : 0;

          let worstIdx = 0;
          segments.forEach((s, i) => { if (s.score > segments[worstIdx].score) worstIdx = i; });
          const worstConditions = weatherData[worstIdx] || DEFAULT_WEATHER_CONDITIONS;

          const level = getSeverityLevel(avgScore);

          return {
            name: corridor.name,
            score: avgScore,
            level,
            color: SEVERITY_COLORS[level],
            hazard: getHazardDescription(worstConditions),
            segments,
            path: corridor.path,
          };
        } catch (err) {
          console.error(`[Travel Corridors] Error fetching ${corridor.name}:`, err);
          return {
            name: corridor.name,
            score: -1,
            level: 'green' as const,
            color: SEVERITY_COLORS.unknown || '#6b7280',
            hazard: 'Data unavailable',
            segments: [],
            path: corridor.path,
          };
        }
      })
    );

    const worstCorridors = getWorstCorridors(results, 5);

    return NextResponse.json({
      corridors: results,
      worstCorridors,
      forecastDay,
      fetchedAt: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[Travel Corridors API]', error);
    return NextResponse.json(
      { error: 'Failed to fetch corridor data' },
      { status: 500 }
    );
  }
}
