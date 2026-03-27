/**
 * Unit test for precipitation probability display in forecast cards
 */

import { render, screen } from '@testing-library/react';
import Forecast from '@/components/forecast';

describe('Forecast precipitation display', () => {
  it('should display precipitation chance when greater than 0', () => {
    const forecast = [
      {
        day: 'Monday',
        highTemp: 72,
        lowTemp: 55,
        condition: 'rainy',
        description: 'Slight rain',
        details: { precipitationChance: 80 },
      },
      {
        day: 'Tuesday',
        highTemp: 68,
        lowTemp: 50,
        condition: 'sunny',
        description: 'Clear sky',
        details: { precipitationChance: 0 },
      },
    ];

    render(<Forecast forecast={forecast} />);

    // The card with 80% precip should show the percentage
    expect(screen.getByText('80%')).toBeTruthy();
    // The card with 0% should not show precipitation
    expect(screen.queryByText('0%')).toBeNull();
  });
});
