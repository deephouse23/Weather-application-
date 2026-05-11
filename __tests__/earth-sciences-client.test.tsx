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
    latitude: 0,
    longitude: 0,
    tsunami: false,
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

    const tbody = await screen.findByTestId('earthquakes-tbody');
    expect(within(tbody).getByText('10km NE of Testville')).toBeInTheDocument();
    expect(within(tbody).getByText('20km SW of Mockington')).toBeInTheDocument();
    expect(within(tbody).getByText('M5.2')).toBeInTheDocument();
    expect(within(tbody).getByText('M3.4')).toBeInTheDocument();
  });

  it('filters the visible list when a higher magnitude tab is selected', async () => {
    const quakes: ClientEarthquake[] = [
      quake({ id: 'big', magnitude: 6.3, location: 'Big One', depth: 33, url: 'https://example.org/big' }),
      quake({ id: 'med', magnitude: 4.8, location: 'Medium One', depth: 20, url: 'https://example.org/med' }),
      quake({ id: 'small', magnitude: 2.9, location: 'Tiny One', depth: 5, url: 'https://example.org/small' }),
    ];
    mockFetchWith({ earthquakes: quakes, count: quakes.length, minMagnitude: 2.5, days: 7 });

    render(<EarthSciencesClient />);
    const tbody = await screen.findByTestId('earthquakes-tbody');

    // All three visible on the default M2.5+ tab
    expect(within(tbody).getByText('Big One')).toBeInTheDocument();
    expect(within(tbody).getByText('Medium One')).toBeInTheDocument();
    expect(within(tbody).getByText('Tiny One')).toBeInTheDocument();

    const m6Tab = screen.getByRole('radio', { name: /M6\+/i });
    await act(async () => {
      m6Tab.click();
    });

    // Only the magnitude-6+ row should survive the client-side filter.
    // Re-query the tbody — it gets replaced by a skeleton during the filter
    // refetch, so the pre-click reference would be detached.
    const filteredBody = await screen.findByTestId('earthquakes-tbody');
    expect(within(filteredBody).getByText('Big One')).toBeInTheDocument();
    expect(within(filteredBody).queryByText('Medium One')).not.toBeInTheDocument();
    expect(within(filteredBody).queryByText('Tiny One')).not.toBeInTheDocument();
  });

  it('renders the empty state when the service returns no earthquakes', async () => {
    mockFetchWith({ earthquakes: [], count: 0, minMagnitude: 2.5, days: 7 });

    render(<EarthSciencesClient />);

    await waitFor(() =>
      expect(screen.getByTestId('earthquakes-empty')).toBeInTheDocument(),
    );
    expect(screen.getByText('NO RECENT QUAKES')).toBeInTheDocument();
  });

  it('shows the hero card when the top visible quake is M4.5+', async () => {
    const quakes: ClientEarthquake[] = [
      quake({ id: 'big', magnitude: 6.1, location: 'Big One' }),
      quake({ id: 'small', magnitude: 3.0, location: 'Tiny One' }),
    ];
    mockFetchWith({ earthquakes: quakes, count: quakes.length, minMagnitude: 2.5, days: 7 });

    render(<EarthSciencesClient />);
    await waitFor(() => expect(screen.getByTestId('quake-hero-card')).toBeInTheDocument());

    const hero = screen.getByTestId('quake-hero-card');
    expect(within(hero).getByText('Big One')).toBeInTheDocument();
    expect(within(hero).getByText('6.1')).toBeInTheDocument();
  });

  it('hides the hero card when no visible quake reaches M4.5', async () => {
    const quakes: ClientEarthquake[] = [
      quake({ id: 'a', magnitude: 3.2, location: 'Small A' }),
      quake({ id: 'b', magnitude: 2.8, location: 'Small B' }),
    ];
    mockFetchWith({ earthquakes: quakes, count: quakes.length, minMagnitude: 2.5, days: 7 });

    render(<EarthSciencesClient />);
    await waitFor(() => expect(screen.getByText('Small A')).toBeInTheDocument());

    expect(screen.queryByTestId('quake-hero-card')).not.toBeInTheDocument();
  });

  it('surfaces the TSUNAMI badge on the hero when the quake triggered one', async () => {
    const quakes: ClientEarthquake[] = [
      quake({ id: 'tsunami-quake', magnitude: 7.2, location: 'Off coast', tsunami: true }),
    ];
    mockFetchWith({ earthquakes: quakes, count: 1, minMagnitude: 2.5, days: 7 });

    render(<EarthSciencesClient />);
    await waitFor(() => expect(screen.getByTestId('quake-hero-card')).toBeInTheDocument());

    expect(screen.getByTestId('quake-hero-tsunami')).toBeInTheDocument();
  });

  it('renders the world map with a dot per visible quake', async () => {
    const quakes: ClientEarthquake[] = [
      quake({ id: 'a', magnitude: 5.1, latitude: 35, longitude: -120 }),
      quake({ id: 'b', magnitude: 3.4, latitude: -10, longitude: 145 }),
    ];
    mockFetchWith({ earthquakes: quakes, count: 2, minMagnitude: 2.5, days: 7 });

    render(<EarthSciencesClient />);
    await waitFor(() => expect(screen.getByTestId('quake-world-map')).toBeInTheDocument());

    const map = screen.getByTestId('quake-world-map');
    // One <circle> per quake (plus a halo on the largest) — assert at least 2 circles exist.
    expect(map.querySelectorAll('circle').length).toBeGreaterThanOrEqual(2);
  });

  it('opens an info popover when an M4.5+ dot on the map is clicked', async () => {
    const quakes: ClientEarthquake[] = [
      quake({ id: 'big', magnitude: 5.1, location: 'Big One', latitude: 35, longitude: -120 }),
      quake({ id: 'small', magnitude: 3.0, location: 'Small One', latitude: -10, longitude: 145 }),
    ];
    mockFetchWith({ earthquakes: quakes, count: 2, minMagnitude: 2.5, days: 7 });

    render(<EarthSciencesClient />);
    await waitFor(() => expect(screen.getByTestId('quake-world-map')).toBeInTheDocument());

    // Only the M5.1 dot should be interactive; M3.0 should not.
    const interactive = screen.getAllByTestId('quake-dot-interactive');
    expect(interactive).toHaveLength(1);
    expect(interactive[0].getAttribute('data-quake-id')).toBe('big');

    expect(screen.queryByTestId('quake-popover')).not.toBeInTheDocument();

    await act(async () => {
      interactive[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const popover = screen.getByTestId('quake-popover');
    expect(within(popover).getByText('Big One')).toBeInTheDocument();
    expect(within(popover).getByText('M5.1')).toBeInTheDocument();
  });

  it('closes the popover on Escape', async () => {
    const quakes: ClientEarthquake[] = [
      quake({ id: 'big', magnitude: 5.5, location: 'Clickable', latitude: 35, longitude: -120 }),
    ];
    mockFetchWith({ earthquakes: quakes, count: 1, minMagnitude: 2.5, days: 7 });

    render(<EarthSciencesClient />);
    const dot = await screen.findByTestId('quake-dot-interactive');
    await act(async () => {
      dot.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(screen.getByTestId('quake-popover')).toBeInTheDocument();

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(screen.queryByTestId('quake-popover')).not.toBeInTheDocument();
  });
});
