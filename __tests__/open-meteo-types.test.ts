/**
 * Unit tests for Open-Meteo API types
 */

import type {
  OpenMeteoForecastResponse,
  OpenMeteoUnits,
  OpenMeteoCurrent,
  OpenMeteoHourly,
  OpenMeteoDaily,
  OpenMeteoAirQualityResponse,
  OpenMeteoAirQualityCurrent,
} from '@/lib/open-meteo-types';

describe('OpenMeteoForecastResponse', () => {
  it('should accept a valid forecast response object', () => {
    const response: OpenMeteoForecastResponse = {
      latitude: 40.71,
      longitude: -74.01,
      generationtime_ms: 0.5,
      utc_offset_seconds: -18000,
      timezone: 'America/New_York',
      timezone_abbreviation: 'EST',
      elevation: 10,
    };
    expect(response.latitude).toBe(40.71);
    expect(response.longitude).toBe(-74.01);
    expect(response.timezone).toBe('America/New_York');
  });
});
