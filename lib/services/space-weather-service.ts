/**
 * 16-Bit Weather Platform - Space Weather Service
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Fetches and formats space weather data for AI context injection
 */

export interface SpaceWeatherContext {
  contextBlock: string;
  kpIndex: number;
  auroraActivity: string;
}

interface KpData {
  current: number | null;
  forecast?: number;
  maxForecast?: number;
}

interface AuroraData {
  activity: 'quiet' | 'unsettled' | 'active' | 'minor_storm' | 'major_storm';
  viewline: {
    latitude: number;
    description: string;
  };
}

interface SolarWindData {
  speed: number;
  density: number;
  bz: number;
}

/**
 * Fetch Kp index data from internal API
 */
async function fetchKpIndex(baseUrl: string): Promise<KpData> {
  try {
    const response = await fetch(`${baseUrl}/api/space-weather/kp-index`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      return { current: null };
    }

    const data = await response.json();
    const currentValue = data.data?.current?.value;
    return {
      current: typeof currentValue === 'number' ? currentValue : null,
      forecast: data.data?.forecast?.expected,
      maxForecast: data.data?.forecast?.maxExpected
    };
  } catch {
    return { current: null };
  }
}

/**
 * Fetch aurora forecast data from internal API
 */
async function fetchAuroraData(baseUrl: string): Promise<AuroraData> {
  try {
    const response = await fetch(`${baseUrl}/api/space-weather/aurora`, {
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      return {
        activity: 'quiet',
        viewline: { latitude: 66, description: 'Far north latitudes only' }
      };
    }

    const data = await response.json();
    return {
      activity: data.data?.activity || 'quiet',
      viewline: data.data?.viewline || { latitude: 66, description: 'Far north latitudes only' }
    };
  } catch {
    return {
      activity: 'quiet',
      viewline: { latitude: 66, description: 'Far north latitudes only' }
    };
  }
}

/**
 * Fetch solar wind data from internal API
 */
async function fetchSolarWind(baseUrl: string): Promise<SolarWindData | null> {
  try {
    const response = await fetch(`${baseUrl}/api/space-weather/solar-wind`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const current = data.data?.current;
    if (!current) return null;

    return {
      speed: current.speed || 0,
      density: current.density || 0,
      bz: current.bz || 0
    };
  } catch {
    return null;
  }
}

/**
 * Get activity description from Kp index
 */
function getActivityDescription(kp: number): string {
  if (kp >= 7) return 'major geomagnetic storm';
  if (kp >= 5) return 'minor geomagnetic storm';
  if (kp >= 4) return 'active conditions';
  if (kp >= 3) return 'unsettled conditions';
  return 'quiet conditions';
}

/**
 * Get aurora visibility description based on Kp
 */
function getAuroraVisibility(kp: number): string {
  if (kp >= 9) return 'Rare event! Aurora visible as far south as 40°N (central California, Spain)';
  if (kp >= 8) return 'Aurora visible to 42°N (northern California, Rome)';
  if (kp >= 7) return 'Aurora visible to 45°N (Oregon, France)';
  if (kp >= 6) return 'Aurora visible to 48°N (Washington state, Paris)';
  if (kp >= 5) return 'Aurora visible to 50°N (Seattle, London, Prague)';
  if (kp >= 4) return 'Aurora visible to 55°N (northern England, northern US states)';
  if (kp >= 3) return 'Aurora visible to 58°N (southern Scandinavia, northern US border)';
  if (kp >= 2) return 'Aurora visible to 62°N (central Scandinavia, central Alaska)';
  return 'Aurora limited to far north latitudes (66°N+)';
}

/**
 * Build space weather context block for AI system prompt
 */
function buildSpaceWeatherContextBlock(
  kp: KpData,
  aurora: AuroraData,
  solarWind: SolarWindData | null
): SpaceWeatherContext {
  const activityDesc = getActivityDescription(kp.current);
  const visibilityDesc = getAuroraVisibility(kp.current);

  let contextBlock = `
REAL-TIME SPACE WEATHER DATA (NOAA Space Weather Prediction Center):
====================================================
GEOMAGNETIC CONDITIONS:
  Current Kp Index: ${kp.current} (${activityDesc})
  ${kp.forecast !== undefined ? `Forecast Kp (24h): ${kp.forecast}` : ''}
  ${kp.maxForecast !== undefined ? `Max Expected Kp: ${kp.maxForecast}` : ''}

AURORA VISIBILITY:
  Activity Level: ${aurora.activity.toUpperCase()}
  ${visibilityDesc}
  Current Viewline: ${aurora.viewline.latitude}°N
`;

  if (solarWind) {
    // Determine if conditions favor aurora
    const bzFavorable = solarWind.bz < 0;
    const speedLevel = solarWind.speed >= 600 ? 'elevated' : solarWind.speed >= 400 ? 'moderate' : 'low';

    contextBlock += `
SOLAR WIND (Real-time from DSCOVR):
  Speed: ${solarWind.speed} km/s (${speedLevel})
  Density: ${solarWind.density} particles/cm³
  Bz Component: ${solarWind.bz} nT ${bzFavorable ? '(FAVORABLE for aurora!)' : '(northward - less favorable)'}
`;
  }

  contextBlock += `====================================================
`;

  return {
    contextBlock,
    kpIndex: kp.current,
    auroraActivity: aurora.activity
  };
}

/**
 * Get the base URL for internal API calls.
 * Handles both local development and Vercel deployments.
 */
function getBaseUrl(): string | null {
  // Explicit base URL takes priority
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // Vercel deployment URL (production/preview)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development fallback (only in development)
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  return null;
}

/**
 * Fetch all space weather data and build context for AI
 */
export async function getSpaceWeatherContext(): Promise<SpaceWeatherContext | null> {
  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    console.error('[Space Weather Service] No base URL configured. Set NEXT_PUBLIC_BASE_URL or VERCEL_URL.');
    return null;
  }

  try {
    // Fetch all data in parallel
    const [kpData, auroraData, solarWindData] = await Promise.all([
      fetchKpIndex(baseUrl),
      fetchAuroraData(baseUrl),
      fetchSolarWind(baseUrl)
    ]);

    // Only return context if we have valid Kp data
    if (kpData.current === 0 && !solarWindData) {
      return null;
    }

    return buildSpaceWeatherContextBlock(kpData, auroraData, solarWindData);
  } catch (error) {
    console.error('[Space Weather Service] Error:', error);
    return null;
  }
}

/**
 * Check if a message contains space weather related queries
 */
export function isSpaceWeatherQuery(message: string): boolean {
  const patterns = [
    /aurora/i,
    /northern\s*lights/i,
    /southern\s*lights/i,
    /solar\s*(flare|wind|storm|activity|cycle)/i,
    /geomagnetic/i,
    /kp\s*index/i,
    /sun\s*spot/i,
    /sunspot/i,
    /cme\b/i,
    /coronal\s*mass/i,
    /space\s*weather/i,
    /x-ray\s*flux/i,
    /radio\s*blackout/i,
    /radiation\s*storm/i,
    /carrington/i,
    /magnetic\s*storm/i,
    /\bg[1-5]\b/i, // G-scale
    /\br[1-5]\b/i, // R-scale
    /\bs[1-5]\b/i, // S-scale
  ];

  return patterns.some(p => p.test(message));
}
