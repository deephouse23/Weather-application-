/**
 * Tests for Open-Meteo Forecast type definitions.
 * Validates that the types match the actual Open-Meteo API response shape.
 * These types are required by lib/open-meteo.ts (build fails without them).
 */

import type {
  OpenMeteoForecastResponse,
} from '@/lib/open-meteo-types';

describe('OpenMeteoForecastResponse types', () => {
  it('should type a full forecast response with current, hourly, and daily', () => {
    const response: OpenMeteoForecastResponse = {
      latitude: 40.71,
      longitude: -74.01,
      generationtime_ms: 0.5,
      utc_offset_seconds: -18000,
      timezone: 'America/New_York',
      timezone_abbreviation: 'EST',
      elevation: 10,
      current: {
        time: '2026-03-25T14:00',
        interval: 900,
        temperature_2m: 74.0,
        relative_humidity_2m: 65,
        apparent_temperature: 72.5,
        is_day: 1,
        precipitation: 0.0,
        weather_code: 2,
        cloud_cover: 50,
        surface_pressure: 1015.2,
        wind_speed_10m: 8.5,
        wind_direction_10m: 225,
        wind_gusts_10m: 15.0,
        uv_index: 5,
      },
      hourly: {
        time: ['2026-03-25T00:00', '2026-03-25T01:00'],
        visibility: [24140, 24140],
        precipitation: [0, 0],
        precipitation_probability: [10, 5],
      },
      daily: {
        time: ['2026-03-25'],
        weather_code: [2],
        temperature_2m_max: [78],
        temperature_2m_min: [55],
        apparent_temperature_max: [76],
        apparent_temperature_min: [52],
        sunrise: ['2026-03-25T07:03'],
        sunset: ['2026-03-25T19:23'],
        daylight_duration: [44400],
        uv_index_max: [7],
        precipitation_sum: [0],
        precipitation_probability_max: [10],
        wind_speed_10m_max: [15],
        wind_gusts_10m_max: [25],
      },
    };

    expect(response.current?.temperature_2m).toBe(74.0);
    expect(response.current?.weather_code).toBe(2);
    expect(response.hourly?.visibility[0]).toBe(24140);
    expect(response.daily?.temperature_2m_max[0]).toBe(78);
    expect(response.daily?.sunrise[0]).toBe('2026-03-25T07:03');
  });
});
