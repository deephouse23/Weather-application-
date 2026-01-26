/**
 * 16-Bit Weather Platform - AI Context Manager
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Unified context manager for AI queries - fetches and formats
 * relevant data based on query analysis.
 */

import {
  analyzeQuery,
  extractLocation,
  extractFlightInfo,
  type ContextType,
} from './query-analyzer';

// Type definition for precipitation API response
interface PrecipitationApiResponse {
  location: string;
  coordinates: { lat: number; lon: number };
  current: {
    snowDepth: number;
    snowfall24h: number;
    snowfall48h: number;
    snowfall7d: number;
    rainfall24h: number;
    rainfall48h: number;
    rainfall7d: number;
  };
  forecast?: Array<{
    date: string;
    expectedSnow: number;
    expectedRain: number;
    probability: number;
  }>;
  source: string;
  timestamp: string;
}

// Re-export types
export { type ContextType } from './query-analyzer';
export { analyzeQuery, extractLocation, extractFlightInfo };

// Unified context interface
export interface UnifiedContext {
  weather?: WeatherContext;
  precipitation?: PrecipitationContext;
  space?: SpaceWeatherContext;
  aviation?: AviationContext;
  earthquake?: EarthquakeContext;
  volcano?: VolcanoContext;
  timestamp: Date;
}

export interface WeatherContext {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  wind: string;
  forecast?: string;
  lat?: number;
  lon?: number;
}

export interface PrecipitationContext {
  location: string;
  snowDepth: number;
  snowfall24h: number;
  snowfall48h: number;
  snowfall7d: number;
  rainfall24h: number;
  rainfall48h: number;
  rainfall7d: number;
  forecast?: Array<{
    date: string;
    expectedSnow: number;
    expectedRain: number;
  }>;
}

export interface SpaceWeatherContext {
  kpIndex: number | null;
  kpForecast?: number;
  auroraActivity: string;
  auroraViewline: {
    latitude: number;
    description: string;
  };
  solarWind?: {
    speed: number;
    density: number;
    bz: number;
  };
  scales?: {
    R: number;
    S: number;
    G: number;
  };
}

export interface AviationContext {
  alerts: AviationAlert[];
  hasActiveAlerts: boolean;
  alertCount: number;
}

export interface AviationAlert {
  id: string;
  type: 'SIGMET' | 'AIRMET';
  severity: string;
  hazard: string;
  region: string;
  validFrom: string;
  validTo: string;
  text: string;
}

export interface EarthquakeContext {
  contextBlock: string;
  hasRecentActivity: boolean;
  significantNearby: boolean;
}

export interface VolcanoContext {
  contextBlock: string;
  hasElevatedActivity: boolean;
}

// Query parameters for context fetching
export interface QueryParams {
  location?: string;
  lat?: number;
  lon?: number;
  query: string;
  isAuthenticated?: boolean;
}

/**
 * AI Context Manager class
 * Coordinates fetching of relevant data contexts based on user queries
 */
export class AIContextManager {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  /**
   * Analyze a query to determine needed context types
   */
  analyzeQuery(query: string): ContextType[] {
    return analyzeQuery(query);
  }

  /**
   * Extract location from query
   */
  extractLocation(query: string): string | null {
    return extractLocation(query);
  }

  /**
   * Fetch all relevant contexts based on query analysis
   */
  async fetchContexts(
    types: ContextType[],
    params: QueryParams
  ): Promise<UnifiedContext> {
    const context: UnifiedContext = {
      timestamp: new Date(),
    };

    // Determine coordinates if we have a location
    let coords: { lat: number; lon: number } | null = null;
    if (params.lat && params.lon) {
      coords = { lat: params.lat, lon: params.lon };
    } else if (params.location) {
      coords = await this.geocodeLocation(params.location);
    }

    // Fetch contexts in parallel where possible
    const promises: Promise<void>[] = [];

    if (types.includes('weather') && coords) {
      promises.push(
        this.fetchWeatherContext(coords.lat, coords.lon, params.location)
          .then(data => { if (data) context.weather = data; })
      );
    }

    if (types.includes('precipitation') && coords) {
      promises.push(
        this.fetchPrecipitationContext(coords.lat, coords.lon, params.location)
          .then(data => { if (data) context.precipitation = data; })
      );
    }

    if (types.includes('space')) {
      promises.push(
        this.fetchSpaceWeatherContext()
          .then(data => { if (data) context.space = data; })
      );
    }

    if (types.includes('aviation')) {
      promises.push(
        this.fetchAviationContext()
          .then(data => { if (data) context.aviation = data; })
      );
    }

    if (types.includes('earthquake') && coords) {
      promises.push(
        this.fetchEarthquakeContext(coords.lat, coords.lon)
          .then(data => { if (data) context.earthquake = data; })
      );
    }

    if (types.includes('volcano')) {
      promises.push(
        this.fetchVolcanoContext()
          .then(data => { if (data) context.volcano = data; })
      );
    }

    await Promise.all(promises);

    return context;
  }

  /**
   * Geocode a location name to coordinates
   */
  private async geocodeLocation(location: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/weather/geocoding?q=${encodeURIComponent(location)}`
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return {
          lat: data.results[0].lat,
          lon: data.results[0].lon,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch weather context
   */
  private async fetchWeatherContext(
    lat: number,
    lon: number,
    location?: string
  ): Promise<WeatherContext | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/weather/current?lat=${lat}&lon=${lon}`
      );

      if (!response.ok) return null;

      const data = await response.json();

      return {
        location: location || `${lat}, ${lon}`,
        temperature: Math.round(data.main?.temp || 0),
        feelsLike: Math.round(data.main?.feels_like || 0),
        condition: data.weather?.[0]?.description || 'unknown',
        humidity: data.main?.humidity || 0,
        wind: `${Math.round(data.wind?.speed || 0)} mph`,
        lat,
        lon,
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetch precipitation context
   */
  private async fetchPrecipitationContext(
    lat: number,
    lon: number,
    location?: string
  ): Promise<PrecipitationContext | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/weather/precipitation?lat=${lat}&lon=${lon}&city=${encodeURIComponent(location || '')}`
      );

      if (!response.ok) return null;

      const data: PrecipitationApiResponse = await response.json();

      return {
        location: data.location,
        snowDepth: data.current.snowDepth,
        snowfall24h: data.current.snowfall24h,
        snowfall48h: data.current.snowfall48h,
        snowfall7d: data.current.snowfall7d,
        rainfall24h: data.current.rainfall24h,
        rainfall48h: data.current.rainfall48h,
        rainfall7d: data.current.rainfall7d,
        forecast: data.forecast?.map(f => ({
          date: f.date,
          expectedSnow: f.expectedSnow,
          expectedRain: f.expectedRain,
        })),
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetch space weather context
   */
  private async fetchSpaceWeatherContext(): Promise<SpaceWeatherContext | null> {
    try {
      // Fetch Kp index and aurora data in parallel
      const [kpResponse, auroraResponse, solarWindResponse] = await Promise.all([
        fetch(`${this.baseUrl}/api/space-weather/kp-index`),
        fetch(`${this.baseUrl}/api/space-weather/aurora`),
        fetch(`${this.baseUrl}/api/space-weather/solar-wind`),
      ]);

      const kpData = kpResponse.ok ? await kpResponse.json() : null;
      const auroraData = auroraResponse.ok ? await auroraResponse.json() : null;
      const solarWindData = solarWindResponse.ok ? await solarWindResponse.json() : null;

      const kpIndex = kpData?.data?.current?.value || 0;

      return {
        kpIndex,
        kpForecast: kpData?.data?.forecast?.expected,
        auroraActivity: auroraData?.data?.activity || 'quiet',
        auroraViewline: {
          latitude: auroraData?.data?.viewline?.latitude || 66,
          description: auroraData?.data?.viewline?.description || 'High latitudes only',
        },
        solarWind: solarWindData?.data ? {
          speed: solarWindData.data.speed || 0,
          density: solarWindData.data.density || 0,
          bz: solarWindData.data.bz || 0,
        } : undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetch aviation context
   */
  private async fetchAviationContext(): Promise<AviationContext | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aviation/alerts`);

      if (!response.ok) return null;

      const data = await response.json();
      const alerts = data.alerts || [];

      return {
        alerts,
        hasActiveAlerts: alerts.length > 0,
        alertCount: alerts.length,
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetch earthquake context
   */
  private async fetchEarthquakeContext(
    lat: number,
    lon: number
  ): Promise<EarthquakeContext | null> {
    // This would call the USGS earthquake API
    // For now, we'll rely on the existing implementation in the chat route
    return null;
  }

  /**
   * Fetch volcano context
   */
  private async fetchVolcanoContext(): Promise<VolcanoContext | null> {
    // This would call the volcano API
    // For now, we'll rely on the existing implementation in the chat route
    return null;
  }

  /**
   * Format contexts for AI prompt injection
   */
  formatForPrompt(context: UnifiedContext): string {
    const sections: string[] = [];

    if (context.weather) {
      sections.push(this.formatWeatherSection(context.weather));
    }

    if (context.precipitation) {
      sections.push(this.formatPrecipitationSection(context.precipitation));
    }

    if (context.space) {
      sections.push(this.formatSpaceSection(context.space));
    }

    if (context.aviation) {
      sections.push(this.formatAviationSection(context.aviation));
    }

    return sections.join('\n\n');
  }

  private formatWeatherSection(weather: WeatherContext): string {
    return `
CURRENT WEATHER DATA:
====================================================
Location: ${weather.location}
Temperature: ${weather.temperature}°F (feels like ${weather.feelsLike}°F)
Conditions: ${weather.condition}
Humidity: ${weather.humidity}%
Wind: ${weather.wind}
${weather.forecast ? `Forecast: ${weather.forecast}` : ''}
====================================================`;
  }

  private formatPrecipitationSection(precip: PrecipitationContext): string {
    return `
PRECIPITATION DATA:
====================================================
Location: ${precip.location}

SNOWFALL:
  - Last 24 hours: ${precip.snowfall24h}"
  - Last 48 hours: ${precip.snowfall48h}"
  - Last 7 days: ${precip.snowfall7d}"
  - Current depth (est): ${precip.snowDepth}"

RAINFALL:
  - Last 24 hours: ${precip.rainfall24h}"
  - Last 48 hours: ${precip.rainfall48h}"
  - Last 7 days: ${precip.rainfall7d}"

${precip.forecast ? `FORECAST:\n${precip.forecast.map(f =>
  `  ${f.date}: Snow ${f.expectedSnow}", Rain ${f.expectedRain}"`
).join('\n')}` : ''}
====================================================`;
  }

  private formatSpaceSection(space: SpaceWeatherContext): string {
    let section = `
SPACE WEATHER DATA:
====================================================
Kp Index: ${space.kpIndex}${space.kpForecast ? ` (forecast: ${space.kpForecast})` : ''}
Aurora Activity: ${space.auroraActivity}
Aurora Visibility: ${space.auroraViewline.description}`;

    if (space.solarWind) {
      section += `

SOLAR WIND:
  - Speed: ${space.solarWind.speed} km/s
  - Density: ${space.solarWind.density} p/cm³
  - Bz: ${space.solarWind.bz} nT ${space.solarWind.bz < 0 ? '(favorable for aurora)' : ''}`;
    }

    section += '\n====================================================';
    return section;
  }

  private formatAviationSection(aviation: AviationContext): string {
    if (!aviation.hasActiveAlerts) {
      return `
AVIATION ALERTS:
====================================================
No active SIGMETs or AIRMETs at this time.
====================================================`;
    }

    const sigmets = aviation.alerts.filter(a => a.type === 'SIGMET');
    const airmets = aviation.alerts.filter(a => a.type === 'AIRMET');

    let section = `
AVIATION ALERTS (${aviation.alertCount} active):
====================================================`;

    if (sigmets.length > 0) {
      section += '\n\nSIGMETs (Significant Hazards):';
      for (const alert of sigmets.slice(0, 5)) {
        section += `\n  - ${alert.hazard.toUpperCase()} | ${alert.region} | ${alert.severity.toUpperCase()}
    Valid: ${alert.validFrom} to ${alert.validTo}`;
      }
    }

    if (airmets.length > 0) {
      section += '\n\nAIRMETs (Advisories):';
      for (const alert of airmets.slice(0, 5)) {
        section += `\n  - ${alert.hazard.toUpperCase()} | ${alert.region} | ${alert.severity.toUpperCase()}
    Valid: ${alert.validFrom} to ${alert.validTo}`;
      }
    }

    section += '\n====================================================';
    return section;
  }
}

// Export singleton instance
export const contextManager = new AIContextManager();
