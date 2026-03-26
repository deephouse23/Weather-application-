/**
 * Unit tests for fetchAirQualityData returning pollutant breakdown
 */

import { fetchAirQualityData } from '@/lib/weather/weather-forecast';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('fetchAirQualityData', () => {
  it('should return aqi, category, and pollutants from the API response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        aqi: 42,
        category: 'Good',
        pollutants: {
          pm2_5: 10.2,
          pm10: 18.5,
          ozone: 68.5,
          nitrogen_dioxide: 12.1,
          sulphur_dioxide: 3.4,
          carbon_monoxide: 201.3,
        },
      }),
    });

    const result = await fetchAirQualityData(40.71, -74.01);

    expect(result.aqi).toBe(42);
    expect(result.category).toBe('Good');
    expect(result.pollutants).toBeDefined();
    expect(result.pollutants?.pm2_5).toBe(10.2);
    expect(result.pollutants?.pm10).toBe(18.5);
    expect(result.pollutants?.ozone).toBe(68.5);
    expect(result.pollutants?.nitrogen_dioxide).toBe(12.1);
    expect(result.pollutants?.sulphur_dioxide).toBe(3.4);
    expect(result.pollutants?.carbon_monoxide).toBe(201.3);
  });
});
