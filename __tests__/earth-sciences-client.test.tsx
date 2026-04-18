/**
 * Unit tests for the /earth-sciences client leaf.
 *
 * Mocks the server-proxied earthquake API and verifies:
 *  1. Page renders earthquakes returned by the service.
 *  2. Magnitude filter tabs filter the visible list client-side.
 *  3. Empty service response triggers the empty state.
 */

import React from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import EarthSciencesClient, {
  type ClientEarthquake,
} from '@/app/earth-sciences/earth-sciences-client';

// Shape matches EarthquakesApiResponse from the route module without importing
// server-only code into the test.
interface MockApiPayload {
  earthquakes: ClientEarthquake[];
  count: number;
  minMagnitude: number;
  days: number;
  error?: string;
}

function mockFetchWith(payload: MockApiPayload) {
  (global.fetch as unknown as jest.Mock) = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => payload,
  });
}

function quake(overrides: Partial<ClientEarthquake>): ClientEarthquake {
  return {
    id: 'q',
    magnitude: 3.0,
    location: 'Somewhere',
    time: new Date().toISOString(),
    depth: 10,
    url: 'https://example.org/q',
    ...overrides,
  };
}

describe('EarthSciencesClient', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders earthquake rows when the API returns data', async () => {
    const quakes: ClientEarthquake[] = [
      quake({ id: 'a', magnitude: 5.2, location: '10km NE of Testville', depth: 12, url: 'https://example.org/a' }),
      quake({ id: 'b', magnitude: 3.4, location: '20km SW of Mockington', depth: 5, url: 'https://example.org/b' }),
    ];
    mockFetchWith({ earthquakes: quakes, count: quakes.length, minMagnitude: 2.5, days: 7 });

    render(<EarthSciencesClient />);

    await waitFor(() => {
      expect(screen.getByText('10km NE of Testville')).toBeInTheDocument();
      expect(screen.getByText('20km SW of Mockington')).toBeInTheDocument();
    });

    expect(screen.getByText('M5.2')).toBeInTheDocument();
    expect(screen.getByText('M3.4')).toBeInTheDocument();
  });

  it('filters the visible list when a higher magnitude tab is selected', async () => {
    const quakes: ClientEarthquake[] = [
      quake({ id: 'big', magnitude: 6.3, location: 'Big One', depth: 33, url: 'https://example.org/big' }),
      quake({ id: 'med', magnitude: 4.8, location: 'Medium One', depth: 20, url: 'https://example.org/med' }),
      quake({ id: 'small', magnitude: 2.9, location: 'Tiny One', depth: 5, url: 'https://example.org/small' }),
    ];
    mockFetchWith({ earthquakes: quakes, count: quakes.length, minMagnitude: 2.5, days: 7 });

    render(<EarthSciencesClient />);
    await waitFor(() => expect(screen.getByText('Big One')).toBeInTheDocument());

    // All three visible on the default M2.5+ tab
    expect(screen.getByText('Big One')).toBeInTheDocument();
    expect(screen.getByText('Medium One')).toBeInTheDocument();
    expect(screen.getByText('Tiny One')).toBeInTheDocument();

    const m6Tab = screen.getByRole('radio', { name: /M6\+/i });
    await act(async () => {
      m6Tab.click();
    });

    // Only the magnitude-6+ row should survive the client-side filter.
    const tbody = screen.getByTestId('earthquakes-tbody');
    expect(within(tbody).getByText('Big One')).toBeInTheDocument();
    expect(within(tbody).queryByText('Medium One')).not.toBeInTheDocument();
    expect(within(tbody).queryByText('Tiny One')).not.toBeInTheDocument();
  });

  it('renders the empty state when the service returns no earthquakes', async () => {
    mockFetchWith({ earthquakes: [], count: 0, minMagnitude: 2.5, days: 7 });

    render(<EarthSciencesClient />);

    await waitFor(() =>
      expect(screen.getByTestId('earthquakes-empty')).toBeInTheDocument(),
    );
    expect(screen.getByText('NO RECENT QUAKES')).toBeInTheDocument();
  });
});
