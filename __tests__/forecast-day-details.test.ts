/**
 * Unit test verifying ForecastDay supports optional details with precipitationChance
 */

import type { ForecastDay } from '@/lib/types';

describe('ForecastDay type', () => {
  it('should allow details with precipitationChance', () => {
    const day: ForecastDay = {
      day: 'Monday',
      highTemp: 72,
      lowTemp: 55,
      condition: 'rainy',
      description: 'Slight rain',
      details: {
        precipitationChance: 80,
      },
    };

    expect(day.details?.precipitationChance).toBe(80);
  });
});
