/**
 * Tests for AI tools migrated to Open-Meteo
 */

// Mock the 'ai' module before any imports to avoid TransformStream error in jsdom
jest.mock('ai', () => ({
  tool: (config: { execute: unknown }) => config,
}));

// Mock services that tools.ts imports
jest.mock('@/lib/services/usgs-earthquake', () => ({
  fetchRecentEarthquakes: jest.fn(),
  formatEarthquakeContextBlock: jest.fn(),
}));
jest.mock('@/lib/services/aviation-service', () => ({
  getAviationContext: jest.fn().mockResolvedValue({
    hasActiveAlerts: false,
    alertCount: 0,
    contextBlock: '',
  }),
}));
jest.mock('@/lib/services/space-weather-service', () => ({
  getSpaceWeatherContext: jest.fn(),
}));
jest.mock('@/lib/services/vibe-check', () => ({
  calculateVibeScore: jest.fn().mockReturnValue({
    score: 80,
    category: 'Vibin',
    breakdown: {},
  }),
}));

// Mock Open-Meteo service
const mockFetchForecast = jest.fn();
const mockFetchAirQuality = jest.fn();
jest.mock('@/lib/open-meteo', () => ({
  fetchOpenMeteoForecast: (...args: unknown[]) => mockFetchForecast(...args),
  fetchOpenMeteoAirQuality: (...args: unknown[]) => mockFetchAirQuality(...args),
}));

// Mock geocodeLocation via global fetch (it uses OWM geocoding internally)
const mockFetch = jest.fn();
global.fetch = mockFetch;

import { weatherTools, geocodeLocation } from '@/lib/ai/tools';

beforeEach(() => {
  jest.clearAllMocks();
  // geocodeLocation checks for OWM key before making any calls
  process.env.OPENWEATHER_API_KEY = 'test-key';
  // Mock geocoding fetch to return NYC
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([{
      lat: 40.71,
      lon: -74.01,
      name: 'New York',
      state: 'New York',
    }]),
  });
});

describe('get_current_weather (Open-Meteo)', () => {
  it('should return temperature, condition, and enriched fields from Open-Meteo data', async () => {
    mockFetchForecast.mockResolvedValue({
      latitude: 40.71,
      longitude: -74.01,
      timezone: 'America/New_York',
      current: {
        time: '2026-03-25T12:00',
        interval: 900,
        temperature_2m: 55,
        relative_humidity_2m: 60,
        apparent_temperature: 52,
        is_day: 1,
        precipitation: 0.02,
        weather_code: 1,
        cloud_cover: 25,
        surface_pressure: 1013,
        wind_speed_10m: 8,
        wind_direction_10m: 220,
        wind_gusts_10m: 15,
        uv_index: 4,
        dewpoint_2m: 42,
        cape: 150,
      },
      hourly: {
        time: ['2026-03-25T12:00'],
        visibility: [16093],
        precipitation: [0],
        precipitation_probability: [10],
      },
    });

    const result = await weatherTools.get_current_weather.execute(
      { location: 'New York' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as unknown as AbortSignal }
    );

    expect(result).not.toHaveProperty('error');
    expect(result).toHaveProperty('location', 'New York, New York');
    expect(result).toHaveProperty('temperature', 55);
    expect(result).toHaveProperty('feelsLike', 52);
    expect(result).toHaveProperty('condition', 'Mainly Clear');
    expect(result).toHaveProperty('humidity', 60);
    expect(result).toHaveProperty('wind_mph', 8);
    expect(result).toHaveProperty('wind_direction', 220);
    expect(result).toHaveProperty('uv_index', 4);
    expect(result).toHaveProperty('cloud_cover', 25);
    expect(result).toHaveProperty('dewpoint_f', 42);
    expect(result).toHaveProperty('cape', 150);
  });
});

describe('get_forecast (Open-Meteo)', () => {
  it('should return daily forecast with WMO descriptions and precipitation probability', async () => {
    mockFetchForecast.mockResolvedValue({
      latitude: 40.71,
      longitude: -74.01,
      timezone: 'America/New_York',
      daily: {
        time: ['2026-03-25', '2026-03-26', '2026-03-27'],
        weather_code: [1, 61, 0],
        temperature_2m_max: [60, 55, 65],
        temperature_2m_min: [42, 40, 45],
        precipitation_sum: [0, 0.5, 0],
        precipitation_probability_max: [10, 80, 5],
      },
    });

    const result = await weatherTools.get_forecast.execute(
      { location: 'New York', days: 3 },
      { toolCallId: 'test', messages: [], abortSignal: undefined as unknown as AbortSignal }
    );

    expect(result).not.toHaveProperty('error');
    expect(result).toHaveProperty('location', 'New York, New York');
    expect(result).toHaveProperty('forecast');
    const forecast = (result as { forecast: Array<Record<string, unknown>> }).forecast;
    expect(forecast).toHaveLength(3);
    expect(forecast[0]).toHaveProperty('condition', 'Mainly Clear');
    expect(forecast[1]).toHaveProperty('condition', 'Slight Rain');
    expect(forecast[1]).toHaveProperty('pop', 80);
    expect(forecast[1]).toHaveProperty('precipitation_sum_in', 0.5);
    expect(forecast[0]).toHaveProperty('high', 60);
    expect(forecast[0]).toHaveProperty('low', 42);
  });
});

describe('get_hourly_forecast (Open-Meteo)', () => {
  it('should return hourly data with temperature, condition, and precipitation probability', async () => {
    mockFetchForecast.mockResolvedValue({
      latitude: 40.71,
      longitude: -74.01,
      timezone: 'America/New_York',
      hourly: {
        time: ['2026-03-25T12:00', '2026-03-25T13:00', '2026-03-25T14:00'],
        temperature_2m: [55, 57, 58],
        apparent_temperature: [52, 54, 55],
        weather_code: [1, 2, 61],
        precipitation_probability: [10, 30, 80],
        humidity: undefined, // not in default response
        relative_humidity_2m: [60, 58, 65],
        wind_speed_10m: [8, 10, 12],
        visibility: [16093, 16093, 8000],
        precipitation: [0, 0, 0.1],
      },
    });

    const result = await weatherTools.get_hourly_forecast.execute(
      { location: 'New York', hours: 3 },
      { toolCallId: 'test', messages: [], abortSignal: undefined as unknown as AbortSignal }
    );

    expect(result).not.toHaveProperty('error');
    expect(result).toHaveProperty('location', 'New York, New York');
    const hourly = (result as { hourly: Array<Record<string, unknown>> }).hourly;
    expect(hourly).toHaveLength(3);
    expect(hourly[0]).toHaveProperty('temp', 55);
    expect(hourly[0]).toHaveProperty('feelsLike', 52);
    expect(hourly[0]).toHaveProperty('condition', 'Mainly Clear');
    expect(hourly[0]).toHaveProperty('pop', 10);
    expect(hourly[2]).toHaveProperty('condition', 'Slight Rain');
    expect(hourly[2]).toHaveProperty('pop', 80);
    expect(hourly[0]).toHaveProperty('wind_mph', 8);
  });
});

describe('get_air_quality (Open-Meteo)', () => {
  it('should return EPA AQI scale and pollutant values from Open-Meteo', async () => {
    mockFetchAirQuality.mockResolvedValue({
      latitude: 40.71,
      longitude: -74.01,
      current: {
        time: '2026-03-25T12:00',
        interval: 3600,
        us_aqi: 42,
        pm2_5: 10.2,
        pm10: 18.5,
        ozone: 55,
        nitrogen_dioxide: 12,
        sulphur_dioxide: 3,
        carbon_monoxide: 200,
        dust: 5,
        uv_index: 4,
      },
    });

    const result = await weatherTools.get_air_quality.execute(
      { location: 'New York' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as unknown as AbortSignal }
    );

    expect(result).not.toHaveProperty('error');
    expect(result).toHaveProperty('location', 'New York, New York');
    expect(result).toHaveProperty('aqi', 42);
    expect(result).toHaveProperty('category', 'Good');
    const pollutants = (result as { pollutants: Record<string, number> }).pollutants;
    expect(pollutants.pm2_5).toBe(10.2);
    expect(pollutants.pm10).toBe(18.5);
    expect(pollutants.o3).toBe(55);
  });
});

describe('get_precipitation_timing (Open-Meteo)', () => {
  it('should return hourly precipitation probability for next several hours', async () => {
    mockFetchForecast.mockResolvedValue({
      latitude: 40.71,
      longitude: -74.01,
      timezone: 'America/New_York',
      current: {
        time: '2026-03-25T12:00',
        precipitation: 0,
        weather_code: 1,
      },
      hourly: {
        time: [
          '2026-03-25T12:00', '2026-03-25T13:00', '2026-03-25T14:00',
          '2026-03-25T15:00', '2026-03-25T16:00', '2026-03-25T17:00',
        ],
        precipitation_probability: [0, 10, 40, 80, 90, 60],
        precipitation: [0, 0, 0.01, 0.1, 0.2, 0.05],
        visibility: [16093, 16093, 10000, 8000, 6000, 12000],
      },
    });

    const result = await weatherTools.get_precipitation_timing.execute(
      { location: 'New York' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as unknown as AbortSignal }
    );

    expect(result).not.toHaveProperty('error');
    expect(result).toHaveProperty('location', 'New York, New York');
    expect(result).toHaveProperty('hours');
    const hours = (result as { hours: Array<Record<string, unknown>> }).hours;
    expect(hours.length).toBeGreaterThan(0);
    expect(hours[0]).toHaveProperty('precipitation_probability');
    expect(result).toHaveProperty('summary');
  });
});

describe('get_travel_route_weather (Open-Meteo)', () => {
  it('should return origin and destination weather from Open-Meteo', async () => {
    // Mock geocoding to return different locations based on fetch call order
    let callCount = 0;
    mockFetch.mockImplementation(() => {
      callCount++;
      // First two calls are geocoding (origin + destination)
      if (callCount <= 2) {
        const isOrigin = callCount === 1;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{
            lat: isOrigin ? 40.71 : 41.88,
            lon: isOrigin ? -74.01 : -87.63,
            name: isOrigin ? 'New York' : 'Chicago',
            state: isOrigin ? 'New York' : 'Illinois',
          }]),
        });
      }
      // Fallback
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    mockFetchForecast.mockResolvedValue({
      latitude: 40.71,
      longitude: -74.01,
      timezone: 'America/New_York',
      current: {
        time: '2026-03-25T12:00',
        temperature_2m: 55,
        apparent_temperature: 52,
        weather_code: 1,
        wind_speed_10m: 8,
        relative_humidity_2m: 60,
        cloud_cover: 25,
        precipitation: 0,
      },
      daily: {
        time: ['2026-03-25'],
        temperature_2m_max: [60],
        temperature_2m_min: [42],
        weather_code: [1],
      },
    });

    const result = await weatherTools.get_travel_route_weather.execute(
      { origin: 'New York', destination: 'Chicago' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as unknown as AbortSignal }
    );

    expect(result).toHaveProperty('origin');
    expect(result).toHaveProperty('destination');
    const origin = (result as { origin: Record<string, unknown> }).origin;
    expect(origin).toHaveProperty('location');
    expect(origin).toHaveProperty('current_temp', 55);
    expect(origin).toHaveProperty('condition', 'Mainly Clear');
  });
});

describe('get_vibe_check (Open-Meteo)', () => {
  it('should use Open-Meteo data to calculate vibe score', async () => {
    mockFetchForecast.mockResolvedValue({
      latitude: 40.71,
      longitude: -74.01,
      timezone: 'America/New_York',
      current: {
        time: '2026-03-25T12:00',
        temperature_2m: 72,
        apparent_temperature: 70,
        weather_code: 0,
        wind_speed_10m: 5,
        relative_humidity_2m: 50,
        cloud_cover: 20,
        uv_index: 3,
        precipitation: 0,
      },
      hourly: {
        time: ['2026-03-25T12:00'],
        precipitation_probability: [10],
        precipitation: [0],
        visibility: [16093],
      },
    });

    const result = await weatherTools.get_vibe_check.execute(
      { location: 'New York' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as unknown as AbortSignal }
    );

    expect(result).not.toHaveProperty('error');
    expect(result).toHaveProperty('location', 'New York, New York');
    expect(result).toHaveProperty('score', 80);
    expect(result).toHaveProperty('category', 'Vibin');
    // Verify Open-Meteo field names are used
    const conditions = (result as { conditions: Record<string, unknown> }).conditions;
    expect(conditions).toHaveProperty('temp', 72);
    expect(conditions).toHaveProperty('wind_mph', 5);
  });
});
