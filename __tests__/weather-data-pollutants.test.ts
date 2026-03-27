/**
 * Unit tests for WeatherData pollutants field
 */

import type { WeatherData } from '@/lib/types';

describe('WeatherData pollutants', () => {
  it('should accept optional pollutants field', () => {
    const data: Partial<WeatherData> = {
      aqi: 42,
      aqiCategory: 'Good',
      pollutants: {
        pm2_5: 10.2,
        pm10: 18.5,
        ozone: 68.5,
        nitrogen_dioxide: 12.1,
        sulphur_dioxide: 3.4,
        carbon_monoxide: 201.3,
      },
    };

    expect(data.pollutants).toBeDefined();
    expect(data.pollutants?.pm2_5).toBe(10.2);
  });
});
