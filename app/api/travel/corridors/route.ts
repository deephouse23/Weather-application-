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

interface OpenMeteoMultiResponse {
  latitude: number;
  longitude: number;
  current?: {
    precipitation?: number;
    snowfall?: number;
    wind_gusts_10m?: number;
    visibility?: number;
    freezing_level_height?: number;
  };
}

async function fetchWeatherForWaypoints(
  waypoints: number[][],
  forecastDay: number
): Promise<WeatherConditions[]> {
  // Build multi-location request
  const lats = waypoints.map(w => w[0]).join(',');
  const lons = waypoints.map(w => w[1]).join(',');

  const hourlyVars = 'precipitation,snowfall,wind_gusts_10m,visibility';

  const url = new URL(OPEN_METEO_BASE);
  url.searchParams.set('latitude', lats);
  url.searchParams.set('longitude', lons);

  if (forecastDay === 0) {
    url.searchParams.set('current', 'precipitation,snowfall,wind_gusts_10m,visibility');
  } else {
    url.searchParams.set('hourly', hourlyVars);
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

    // Open-Meteo returns array for multi-location, single object for one location
    const locations: OpenMeteoMultiResponse[] = Array.isArray(data) ? data : [data];

    return locations.map((loc) => {
      if (forecastDay === 0 && loc.current) {
        return {
          precipitation: loc.current.precipitation ?? 0,
          snowfall: loc.current.snowfall ?? 0,
          windGusts: loc.current.wind_gusts_10m ?? 0,
          visibility: loc.current.visibility ?? 10000,
          freezingLevel: loc.current.freezing_level_height ?? 3000,
        };
      }

      // For future days, grab noon hour of the target day
      const hourly = (loc as unknown as Record<string, unknown>).hourly as Record<string, number[]> | undefined;
      if (hourly) {
        const targetHour = forecastDay * 24 + 12; // noon of target day
        const idx = Math.min(targetHour, (hourly.precipitation?.length ?? 1) - 1);
        return {
          precipitation: hourly.precipitation?.[idx] ?? 0,
          snowfall: hourly.snowfall?.[idx] ?? 0,
          windGusts: hourly.wind_gusts_10m?.[idx] ?? 0,
          visibility: hourly.visibility?.[idx] ?? 10000,
          freezingLevel: 3000,
        };
      }

      return { precipitation: 0, snowfall: 0, windGusts: 0, visibility: 10000, freezingLevel: 3000 };
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

    // Fetch weather for all corridors in parallel (batched to avoid rate limits)
    const BATCH_SIZE = 5;
    const results: CorridorResult[] = [];

    for (let i = 0; i < corridors.length; i += BATCH_SIZE) {
      const batch = corridors.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (corridor) => {
          try {
            const weatherData = await fetchWeatherForWaypoints(corridor.waypoints, forecastDay);

            const segments: CorridorSegment[] = corridor.waypoints.map((wp, idx) => {
              const conditions = weatherData[idx] || { precipitation: 0, snowfall: 0, windGusts: 0, visibility: 10000, freezingLevel: 3000 };
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

            // Overall corridor score = average of segment scores
            const avgScore = segments.length > 0
              ? Math.round(segments.reduce((sum, s) => sum + s.score, 0) / segments.length)
              : 0;

            const worstSegment = segments.reduce((worst, s) => s.score > worst.score ? s : worst, segments[0]);
            const worstConditions = weatherData[corridor.waypoints.indexOf(
              corridor.waypoints.find((_, idx) => segments[idx] === worstSegment) || corridor.waypoints[0]
            )] || { precipitation: 0, snowfall: 0, windGusts: 0, visibility: 10000, freezingLevel: 3000 };

            const level = getSeverityLevel(avgScore);

            return {
              name: corridor.name,
              score: avgScore,
              level,
              color: SEVERITY_COLORS[level],
              hazard: getHazardDescription(worstConditions),
              segments,
              path: corridor.path,
            } as CorridorResult & { path: number[][] };
          } catch (err) {
            console.error(`[Travel Corridors] Error fetching ${corridor.name}:`, err);
            return {
              name: corridor.name,
              score: -1,
              level: 'green' as const,  // excluded from worstCorridors by score -1
              color: SEVERITY_COLORS.unknown || '#6b7280',
              hazard: 'Data unavailable',
              segments: [],
              path: corridor.path,
            };
          }
        })
      );
      results.push(...batchResults);
    }

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
