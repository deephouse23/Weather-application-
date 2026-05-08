/**
 * Unit tests for lib/services/flight-lookup-service.
 *
 * Covers: flight-number parsing, provider fallback chain (AviationStack →
 * mock), in-process schedule cache, OpenSky live-position enrichment, and
 * the public lookupFlight() outcome shape.
 */

import {
  parseFlightNumber,
  lookupFlight,
  fetchLivePosition,
  _resetCacheForTests,
  type FlightProvider,
  type FlightLookupResult,
} from '@/lib/services/flight-lookup-service';

// Avoid dotenv side effects from real env in CI.
const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  _resetCacheForTests();
  process.env = { ...ORIGINAL_ENV };
  delete process.env.AVIATIONSTACK_API_KEY;
  delete process.env.OPENSKY_USERNAME;
  delete process.env.OPENSKY_PASSWORD;
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('parseFlightNumber', () => {
  test('extracts airline + number from compact form', () => {
    expect(parseFlightNumber('AA123')).toEqual({
      airlineCode: 'AA',
      flightNum: '123',
    });
  });

  test('handles spaces and lowercase', () => {
    expect(parseFlightNumber('aa 123')).toEqual({
      airlineCode: 'AA',
      flightNum: '123',
    });
  });

  test('rejects malformed input', () => {
    expect(parseFlightNumber('NOT_A_FLIGHT')).toBeNull();
    expect(parseFlightNumber('A123')).toBeNull();
    expect(parseFlightNumber('AAA123')).toBeNull();
    expect(parseFlightNumber('AA')).toBeNull();
    expect(parseFlightNumber('AA12345')).toBeNull();
  });
});

describe('lookupFlight - input validation', () => {
  test('returns INVALID_FLIGHT_NUMBER for malformed input', async () => {
    const out = await lookupFlight('garbage');
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.error.code).toBe('INVALID_FLIGHT_NUMBER');
    }
  });

  test('returns UNKNOWN_AIRLINE when airline code is unrecognized', async () => {
    const out = await lookupFlight('ZZ123');
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.error.code).toBe('UNKNOWN_AIRLINE');
    }
  });
});

describe('lookupFlight - provider fallback chain', () => {
  test('uses first provider that returns a result', async () => {
    const realProvider: FlightProvider = {
      name: 'aviationstack',
      isAvailable: () => true,
      lookupFlight: jest.fn(async () => ({
        flightNumber: 'AA123',
        airline: { name: 'American Airlines', iata: 'AA', icao: 'AAL' },
        departure: {
          icao: 'KJFK',
          iata: 'JFK',
          name: 'JFK',
          city: 'New York',
          lat: 40.6413,
          lon: -73.7781,
        },
        arrival: {
          icao: 'KLAX',
          iata: 'LAX',
          name: 'LAX',
          city: 'Los Angeles',
          lat: 33.9425,
          lon: -118.408,
        },
        status: 'active',
        source: 'aviationstack',
        mock: false,
      })),
    };

    const fallbackProvider: FlightProvider = {
      name: 'mock',
      isAvailable: () => true,
      lookupFlight: jest.fn(),
    };

    const out = await lookupFlight('AA123', {
      providers: [realProvider, fallbackProvider],
      includeLivePosition: false,
    });

    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.result.source).toBe('aviationstack');
      expect(out.result.mock).toBe(false);
    }
    expect(realProvider.lookupFlight).toHaveBeenCalledTimes(1);
    expect(fallbackProvider.lookupFlight).not.toHaveBeenCalled();
  });

  test('falls through to next provider when first returns null', async () => {
    const empty: FlightProvider = {
      name: 'aviationstack',
      isAvailable: () => true,
      lookupFlight: jest.fn(async () => null),
    };

    const mockProv: FlightProvider = {
      name: 'mock',
      isAvailable: () => true,
      lookupFlight: jest.fn(async (): Promise<FlightLookupResult> => ({
        flightNumber: 'AA123',
        airline: { name: 'American Airlines', iata: 'AA', icao: 'AAL' },
        departure: {
          icao: 'KJFK',
          iata: 'JFK',
          name: 'JFK',
          city: 'New York',
          lat: 40.6413,
          lon: -73.7781,
        },
        arrival: {
          icao: 'KLAX',
          iata: 'LAX',
          name: 'LAX',
          city: 'Los Angeles',
          lat: 33.9425,
          lon: -118.408,
        },
        status: 'scheduled',
        source: 'mock',
        mock: true,
      })),
    };

    const out = await lookupFlight('AA123', {
      providers: [empty, mockProv],
      includeLivePosition: false,
    });

    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.result.source).toBe('mock');
      expect(out.result.mock).toBe(true);
    }
    expect(empty.lookupFlight).toHaveBeenCalled();
    expect(mockProv.lookupFlight).toHaveBeenCalled();
  });

  test('skips providers that report unavailable', async () => {
    const unavailable: FlightProvider = {
      name: 'aviationstack',
      isAvailable: () => false,
      lookupFlight: jest.fn(),
    };

    const mockProv: FlightProvider = {
      name: 'mock',
      isAvailable: () => true,
      lookupFlight: jest.fn(async (): Promise<FlightLookupResult> => ({
        flightNumber: 'AA123',
        airline: { name: 'American Airlines', iata: 'AA', icao: 'AAL' },
        departure: {
          icao: 'KJFK',
          iata: 'JFK',
          name: 'JFK',
          city: 'New York',
          lat: 40.6413,
          lon: -73.7781,
        },
        arrival: {
          icao: 'KLAX',
          iata: 'LAX',
          name: 'LAX',
          city: 'Los Angeles',
          lat: 33.9425,
          lon: -118.408,
        },
        status: 'scheduled',
        source: 'mock',
        mock: true,
      })),
    };

    await lookupFlight('AA123', {
      providers: [unavailable, mockProv],
      includeLivePosition: false,
    });

    expect(unavailable.lookupFlight).not.toHaveBeenCalled();
    expect(mockProv.lookupFlight).toHaveBeenCalled();
  });

  test('returns FLIGHT_NOT_FOUND when no provider can resolve the flight', async () => {
    const empty1: FlightProvider = {
      name: 'aviationstack',
      isAvailable: () => true,
      lookupFlight: jest.fn(async () => null),
    };
    const empty2: FlightProvider = {
      name: 'mock',
      isAvailable: () => true,
      lookupFlight: jest.fn(async () => null),
    };

    const out = await lookupFlight('AA9999', {
      providers: [empty1, empty2],
      includeLivePosition: false,
    });

    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.error.code).toBe('FLIGHT_NOT_FOUND');
    }
  });

  test('continues past provider that throws', async () => {
    const broken: FlightProvider = {
      name: 'aviationstack',
      isAvailable: () => true,
      lookupFlight: jest.fn(async () => {
        throw new Error('boom');
      }),
    };
    const mockProv: FlightProvider = {
      name: 'mock',
      isAvailable: () => true,
      lookupFlight: jest.fn(async (): Promise<FlightLookupResult> => ({
        flightNumber: 'AA123',
        airline: { name: 'American Airlines', iata: 'AA', icao: 'AAL' },
        departure: {
          icao: 'KJFK',
          iata: 'JFK',
          name: 'JFK',
          city: 'New York',
          lat: 40.6413,
          lon: -73.7781,
        },
        arrival: {
          icao: 'KLAX',
          iata: 'LAX',
          name: 'LAX',
          city: 'Los Angeles',
          lat: 33.9425,
          lon: -118.408,
        },
        status: 'scheduled',
        source: 'mock',
        mock: true,
      })),
    };

    const out = await lookupFlight('AA123', {
      providers: [broken, mockProv],
      includeLivePosition: false,
    });

    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.result.source).toBe('mock');
    }
  });
});

describe('lookupFlight - schedule cache', () => {
  test('caches a successful lookup so the second call skips providers', async () => {
    const provider: FlightProvider = {
      name: 'aviationstack',
      isAvailable: () => true,
      lookupFlight: jest.fn(async (): Promise<FlightLookupResult> => ({
        flightNumber: 'AA123',
        airline: { name: 'American Airlines', iata: 'AA', icao: 'AAL' },
        departure: {
          icao: 'KJFK',
          iata: 'JFK',
          name: 'JFK',
          city: 'New York',
          lat: 40.6413,
          lon: -73.7781,
        },
        arrival: {
          icao: 'KLAX',
          iata: 'LAX',
          name: 'LAX',
          city: 'Los Angeles',
          lat: 33.9425,
          lon: -118.408,
        },
        status: 'active',
        source: 'aviationstack',
        mock: false,
      })),
    };

    await lookupFlight('AA123', { providers: [provider], includeLivePosition: false });
    await lookupFlight('AA123', { providers: [provider], includeLivePosition: false });

    expect(provider.lookupFlight).toHaveBeenCalledTimes(1);
  });

  test('bypassCache forces a refetch', async () => {
    const provider: FlightProvider = {
      name: 'aviationstack',
      isAvailable: () => true,
      lookupFlight: jest.fn(async (): Promise<FlightLookupResult> => ({
        flightNumber: 'AA123',
        airline: { name: 'American Airlines', iata: 'AA', icao: 'AAL' },
        departure: {
          icao: 'KJFK',
          iata: 'JFK',
          name: 'JFK',
          city: 'New York',
          lat: 40.6413,
          lon: -73.7781,
        },
        arrival: {
          icao: 'KLAX',
          iata: 'LAX',
          name: 'LAX',
          city: 'Los Angeles',
          lat: 33.9425,
          lon: -118.408,
        },
        status: 'active',
        source: 'aviationstack',
        mock: false,
      })),
    };

    await lookupFlight('AA123', { providers: [provider], includeLivePosition: false });
    await lookupFlight('AA123', {
      providers: [provider],
      includeLivePosition: false,
      bypassCache: true,
    });

    expect(provider.lookupFlight).toHaveBeenCalledTimes(2);
  });
});

describe('fetchLivePosition (OpenSky)', () => {
  // jsdom's Response polyfill mishandles our payloads; use a plain mock with
  // the fields the service actually reads (ok, json()).
  function mockResponse(body: unknown, status = 200) {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    };
  }

  test('parses a matching state vector into a LivePosition', async () => {
    const fetchImpl = jest.fn(async () =>
      mockResponse({
        time: 1_700_000_000,
        states: [
          [
            'a1b2c3', // icao24
            'AAL123  ', // callsign (padded)
            'United States',
            1_700_000_000,
            1_700_000_000,
            -73.7781, // lon
            40.6413, // lat
            10000, // baro_altitude (meters)
            false, // on_ground
            250, // velocity m/s
            90, // heading
            0,
            null,
            10500, // geo_altitude (meters)
          ],
        ],
      }),
    );

    const pos = await fetchLivePosition(
      'AAL',
      '123',
      fetchImpl as unknown as typeof fetch,
    );

    expect(pos).not.toBeNull();
    expect(pos?.lat).toBeCloseTo(40.6413);
    expect(pos?.lon).toBeCloseTo(-73.7781);
    // 10500 m * 3.28084 ft/m ≈ 34449 ft
    expect(pos?.altitudeFt).toBeGreaterThan(34000);
    expect(pos?.altitudeFt).toBeLessThan(35000);
    // 250 m/s * 1.94384 ≈ 486 kt
    expect(pos?.velocityKt).toBeGreaterThan(480);
    expect(pos?.onGround).toBe(false);
  });

  test('returns null when no callsign matches', async () => {
    const fetchImpl = jest.fn(async () =>
      mockResponse({
        time: 1_700_000_000,
        states: [
          [
            'aaaaaa',
            'OTHER789',
            'US',
            1,
            1,
            0,
            0,
            0,
            false,
            0,
            0,
            0,
            null,
            0,
          ],
        ],
      }),
    );

    const pos = await fetchLivePosition(
      'AAL',
      '123',
      fetchImpl as unknown as typeof fetch,
    );
    expect(pos).toBeNull();
  });

  test('returns null and does not throw on HTTP failure', async () => {
    const fetchImpl = jest.fn(async () => mockResponse('nope', 503));
    const pos = await fetchLivePosition(
      'AAL',
      '123',
      fetchImpl as unknown as typeof fetch,
    );
    expect(pos).toBeNull();
  });
});

describe('lookupFlight - default providers integration', () => {
  test('without AVIATIONSTACK_API_KEY, mock provider answers and result is labeled mock', async () => {
    // Default providers, no env keys set.
    const out = await lookupFlight('AA123', { includeLivePosition: false });
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.result.source).toBe('mock');
      expect(out.result.mock).toBe(true);
      expect(out.result.flightNumber).toBe('AA123');
      expect(out.result.departure.iata).toBe('LAX');
      expect(out.result.arrival.iata).toBe('JFK');
    }
  });
});

describe('lookupFlight - forceMock option', () => {
  test('skips live providers and returns mock data when forceMock=true', async () => {
    const live: FlightProvider = {
      name: 'aviationstack',
      isAvailable: () => true,
      lookupFlight: jest.fn(),
    };
    const mockProv: FlightProvider = {
      name: 'mock',
      isAvailable: () => true,
      lookupFlight: jest.fn(async (): Promise<FlightLookupResult> => ({
        flightNumber: 'AA123',
        airline: { name: 'American Airlines', iata: 'AA', icao: 'AAL' },
        departure: {
          icao: 'KJFK',
          iata: 'JFK',
          name: 'JFK',
          city: 'New York',
          lat: 40.6413,
          lon: -73.7781,
        },
        arrival: {
          icao: 'KLAX',
          iata: 'LAX',
          name: 'LAX',
          city: 'Los Angeles',
          lat: 33.9425,
          lon: -118.408,
        },
        status: 'scheduled',
        source: 'mock',
        mock: true,
      })),
    };

    const out = await lookupFlight('AA123', {
      providers: [live, mockProv],
      forceMock: true,
      includeLivePosition: false,
    });

    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.result.mock).toBe(true);
      expect(out.result.source).toBe('mock');
    }
    expect(live.lookupFlight).not.toHaveBeenCalled();
    expect(mockProv.lookupFlight).toHaveBeenCalledTimes(1);
  });

  test('forceMock requests bypass the schedule cache', async () => {
    const liveResult: FlightLookupResult = {
      flightNumber: 'AA123',
      airline: { name: 'American Airlines', iata: 'AA', icao: 'AAL' },
      departure: {
        icao: 'KJFK',
        iata: 'JFK',
        name: 'JFK',
        city: 'New York',
        lat: 40.6413,
        lon: -73.7781,
      },
      arrival: {
        icao: 'KLAX',
        iata: 'LAX',
        name: 'LAX',
        city: 'Los Angeles',
        lat: 33.9425,
        lon: -118.408,
      },
      status: 'active',
      source: 'aviationstack',
      mock: false,
    };
    const live: FlightProvider = {
      name: 'aviationstack',
      isAvailable: () => true,
      lookupFlight: jest.fn(async () => liveResult),
    };
    const mockProv: FlightProvider = {
      name: 'mock',
      isAvailable: () => true,
      lookupFlight: jest.fn(async (): Promise<FlightLookupResult> => ({
        ...liveResult,
        source: 'mock',
        mock: true,
      })),
    };

    // Prime the cache with a live result.
    const first = await lookupFlight('AA123', {
      providers: [live, mockProv],
      includeLivePosition: false,
    });
    expect(first.ok && first.result.mock).toBe(false);

    // forceMock should ignore the cached live result and call the mock provider.
    const second = await lookupFlight('AA123', {
      providers: [live, mockProv],
      forceMock: true,
      includeLivePosition: false,
    });
    expect(second.ok && second.result.mock).toBe(true);
    expect(mockProv.lookupFlight).toHaveBeenCalledTimes(1);

    // Subsequent non-mock lookup should still hit the cache (live result is preserved).
    const third = await lookupFlight('AA123', {
      providers: [live, mockProv],
      includeLivePosition: false,
    });
    expect(third.ok && third.result.mock).toBe(false);
    // Live provider was only called once during the priming call.
    expect(live.lookupFlight).toHaveBeenCalledTimes(1);
  });
});
