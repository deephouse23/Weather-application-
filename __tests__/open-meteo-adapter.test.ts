/**
 * Unit tests for Open-Meteo adapter
 */

jest.mock('@/lib/weather/weather-forecast', () => ({
  fetchPollenData: jest.fn().mockResolvedValue({
    tree: { 'Tree': 'No Data' },
    grass: { 'Grass': 'No Data' },
    weed: { 'Weed': 'No Data' },
  }),
}));

import { buildWeatherDataFromOpenMeteo } from '@/lib/weather/open-meteo-adapter';
import type { OpenMeteoForecastResponse } from '@/lib/open-meteo-types';

const originalFetch = global.fetch;
const mockFetch = jest.fn();
global.fetch = mockFetch;

afterAll(() => {
  global.fetch = originalFetch;
});

function makeForecastResponse(): OpenMeteoForecastResponse {
  return {
    latitude: 40.71,
    longitude: -74.01,
    generationtime_ms: 0.5,
    utc_offset_seconds: -18000,
    timezone: 'America/New_York',
    timezone_abbreviation: 'EST',
    elevation: 10,
    current: {
      time: '2025-03-25T14:00',
      interval: 900,
      temperature_2m: 55.4,
      relative_humidity_2m: 62,
      apparent_temperature: 52.1,
      is_day: 1,
      precipitation: 0,
      weather_code: 2,
      cloud_cover: 50,
      surface_pressure: 1018.5,
      wind_speed_10m: 12.3,
      wind_direction_10m: 225,
      wind_gusts_10m: 18.7,
      uv_index: 4.2,
    },
    daily: {
      time: ['2025-03-25', '2025-03-26', '2025-03-27', '2025-03-28', '2025-03-29'],
      weather_code: [2, 3, 61, 0, 1],
      temperature_2m_max: [60, 58, 52, 65, 63],
      temperature_2m_min: [42, 40, 38, 44, 43],
      apparent_temperature_max: [57, 55, 48, 62, 60],
      apparent_temperature_min: [38, 36, 34, 40, 39],
      sunrise: ['2025-03-25T06:52', '2025-03-26T06:50', '2025-03-27T06:49', '2025-03-28T06:47', '2025-03-29T06:46'],
      sunset: ['2025-03-25T19:15', '2025-03-26T19:16', '2025-03-27T19:17', '2025-03-28T19:18', '2025-03-29T19:19'],
      daylight_duration: [44580, 44640, 44700, 44760, 44820],
      uv_index_max: [5, 4, 2, 6, 5],
      precipitation_sum: [0, 0, 0.5, 0, 0],
      precipitation_probability_max: [10, 20, 80, 5, 10],
      wind_speed_10m_max: [15, 18, 22, 10, 12],
      wind_gusts_10m_max: [25, 30, 35, 18, 20],
    },
    hourly: {
      time: Array.from({ length: 168 }, (_, i) => {
        const d = new Date('2025-03-25T00:00:00');
        d.setHours(d.getHours() + i);
        return d.toISOString().slice(0, 16);
      }),
      visibility: Array.from({ length: 168 }, () => 10000),
      precipitation: Array.from({ length: 168 }, () => 0),
      precipitation_probability: Array.from({ length: 168 }, () => 10),
    },
  };
}

const mockAirQualityData = {
  latitude: 40.71, longitude: -74.01, generationtime_ms: 0.3,
  utc_offset_seconds: -18000, timezone: 'America/New_York', timezone_abbreviation: 'EST',
  current: {
    time: '2025-03-25T14:00', interval: 3600, us_aqi: 42,
    pm10: 15, pm2_5: 8, carbon_monoxide: 200, nitrogen_dioxide: 12,
    sulphur_dioxide: 5, ozone: 60, dust: 3, uv_index: 4.2,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-03-25T14:00:00Z').getTime());
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/api/open-meteo/forecast')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(makeForecastResponse()) });
    }
    if (url.includes('/api/open-meteo/air-quality')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockAirQualityData) });
    }
    return Promise.resolve({ ok: false, status: 404 });
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('buildWeatherDataFromOpenMeteo', () => {
  it('should return WeatherData with correct current conditions', async () => {
    const result = await buildWeatherDataFromOpenMeteo(
      40.71, -74.01, 'New York', 'imperial', 'US'
    );

    expect(result.location).toBe('New York');
    expect(result.country).toBe('US');
    expect(result.temperature).toBe(55);
    expect(result.unit).toBe('°F');
    expect(result.condition).toBe('Clouds');
    expect(result.description).toBe('partly cloudy');
    expect(result.humidity).toBe(62);
  });

  it('should format wind data correctly', async () => {
    const result = await buildWeatherDataFromOpenMeteo(
      40.71, -74.01, 'New York', 'imperial', 'US'
    );

    expect(result.wind.speed).toBe(12.3);
    expect(result.wind.direction).toBe('SW'); // 225 degrees
    expect(result.wind.gust).toBe(18.7);
  });

  it('should format sunrise and sunset from ISO strings', async () => {
    const result = await buildWeatherDataFromOpenMeteo(
      40.71, -74.01, 'New York', 'imperial', 'US'
    );

    expect(result.sunrise).toBe('6:52 am');
    expect(result.sunset).toBe('7:15 pm');
  });

  it('should produce exactly 5 forecast days with correct temps', async () => {
    const result = await buildWeatherDataFromOpenMeteo(
      40.71, -74.01, 'New York', 'imperial', 'US'
    );

    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[0].highTemp).toBe(60);
    expect(result.forecast[0].lowTemp).toBe(42);
  });

  it('should include AQI from air quality API', async () => {
    const result = await buildWeatherDataFromOpenMeteo(
      40.71, -74.01, 'New York', 'imperial', 'US'
    );

    expect(result.aqi).toBe(42);
    expect(result.aqiCategory).toBe('Good');
  });

  it('should provide feelsLike in first hourly entry from apparent_temperature', async () => {
    const result = await buildWeatherDataFromOpenMeteo(
      40.71, -74.01, 'New York', 'imperial', 'US'
    );

    expect(result.hourlyForecast).toBeDefined();
    expect(result.hourlyForecast!.length).toBeGreaterThan(0);
    expect(result.hourlyForecast![0].feelsLike).toBe(52.1);
  });
});
