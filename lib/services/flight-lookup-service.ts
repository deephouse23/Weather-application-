/**
 * 16-Bit Weather Platform - Flight Lookup Service
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Provider-agnostic flight schedule + live position lookup.
 *
 * Fallback chain:
 *   1. AviationStack (real schedule data, free tier 100 req/month)
 *   2. OpenSky Network (live position by callsign — enrichment only, not gating)
 *   3. Mock (synthesized routes — last resort, response carries `mock: true`)
 *
 * Server-side cache keeps us under provider quotas. The cache lives in-process,
 * so warm Vercel functions share it; cold starts repopulate.
 */

export interface AirlineData {
  name: string;
  iata: string;
  icao: string;
}

export interface AirportData {
  icao: string;
  iata: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
}

export type FlightStatus =
  | 'scheduled'
  | 'active'
  | 'landed'
  | 'cancelled'
  | 'diverted';

export interface LivePosition {
  lat: number;
  lon: number;
  altitudeFt: number | null;
  velocityKt: number | null;
  headingDeg: number | null;
  onGround: boolean;
  fetchedAt: number;
}

export interface FlightLookupResult {
  flightNumber: string;
  airline: AirlineData;
  departure: AirportData;
  arrival: AirportData;
  status: FlightStatus;
  livePosition?: LivePosition;
  /** Which provider returned the schedule data. */
  source: 'aviationstack' | 'mock';
  /** True when route data is synthesized rather than from a live provider. */
  mock: boolean;
}

export interface FlightProvider {
  readonly name: 'aviationstack' | 'mock';
  isAvailable(): boolean;
  lookupFlight(
    airlineCode: string,
    flightNum: string,
  ): Promise<FlightLookupResult | null>;
}

// ───────────────────────────────────────────────────────────────
// Reference data (airlines + airports)
// ───────────────────────────────────────────────────────────────

export const AIRLINES: Record<string, AirlineData> = {
  AA: { name: 'American Airlines', iata: 'AA', icao: 'AAL' },
  UA: { name: 'United Airlines', iata: 'UA', icao: 'UAL' },
  DL: { name: 'Delta Air Lines', iata: 'DL', icao: 'DAL' },
  WN: { name: 'Southwest Airlines', iata: 'WN', icao: 'SWA' },
  B6: { name: 'JetBlue Airways', iata: 'B6', icao: 'JBU' },
  AS: { name: 'Alaska Airlines', iata: 'AS', icao: 'ASA' },
  NK: { name: 'Spirit Airlines', iata: 'NK', icao: 'NKS' },
  F9: { name: 'Frontier Airlines', iata: 'F9', icao: 'FFT' },
  G4: { name: 'Allegiant Air', iata: 'G4', icao: 'AAY' },
  HA: { name: 'Hawaiian Airlines', iata: 'HA', icao: 'HAL' },
};

export const AIRPORTS: Record<string, AirportData> = {
  LAX: { icao: 'KLAX', iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', lat: 33.9425, lon: -118.408 },
  JFK: { icao: 'KJFK', iata: 'JFK', name: 'John F Kennedy International', city: 'New York', lat: 40.6413, lon: -73.7781 },
  ORD: { icao: 'KORD', iata: 'ORD', name: "O'Hare International", city: 'Chicago', lat: 41.9742, lon: -87.9073 },
  SFO: { icao: 'KSFO', iata: 'SFO', name: 'San Francisco International', city: 'San Francisco', lat: 37.6213, lon: -122.379 },
  DFW: { icao: 'KDFW', iata: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', lat: 32.8998, lon: -97.0403 },
  DEN: { icao: 'KDEN', iata: 'DEN', name: 'Denver International', city: 'Denver', lat: 39.8561, lon: -104.6737 },
  ATL: { icao: 'KATL', iata: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', lat: 33.6407, lon: -84.4277 },
  SEA: { icao: 'KSEA', iata: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', lat: 47.4502, lon: -122.3088 },
  MIA: { icao: 'KMIA', iata: 'MIA', name: 'Miami International', city: 'Miami', lat: 25.7959, lon: -80.2870 },
  BOS: { icao: 'KBOS', iata: 'BOS', name: 'Logan International', city: 'Boston', lat: 42.3656, lon: -71.0096 },
  PHX: { icao: 'KPHX', iata: 'PHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix', lat: 33.4373, lon: -112.0078 },
  LAS: { icao: 'KLAS', iata: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', lat: 36.0840, lon: -115.1537 },
  MSP: { icao: 'KMSP', iata: 'MSP', name: 'Minneapolis-Saint Paul International', city: 'Minneapolis', lat: 44.8848, lon: -93.2223 },
  DTW: { icao: 'KDTW', iata: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit', lat: 42.2162, lon: -83.3554 },
  EWR: { icao: 'KEWR', iata: 'EWR', name: 'Newark Liberty International', city: 'Newark', lat: 40.6895, lon: -74.1745 },
  IAH: { icao: 'KIAH', iata: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', lat: 29.9902, lon: -95.3368 },
  SAN: { icao: 'KSAN', iata: 'SAN', name: 'San Diego International', city: 'San Diego', lat: 32.7338, lon: -117.1933 },
  HNL: { icao: 'PHNL', iata: 'HNL', name: 'Daniel K. Inouye International', city: 'Honolulu', lat: 21.3187, lon: -157.9225 },
  MCO: { icao: 'KMCO', iata: 'MCO', name: 'Orlando International', city: 'Orlando', lat: 28.4312, lon: -81.3081 },
  CLT: { icao: 'KCLT', iata: 'CLT', name: 'Charlotte Douglas International', city: 'Charlotte', lat: 35.2144, lon: -80.9473 },
};

const AIRPORTS_BY_IATA = AIRPORTS;
const AIRPORTS_BY_ICAO: Record<string, AirportData> = Object.fromEntries(
  Object.values(AIRPORTS).map((a) => [a.icao, a]),
);

// ───────────────────────────────────────────────────────────────
// Parsing helpers
// ───────────────────────────────────────────────────────────────

export interface ParsedFlightNumber {
  airlineCode: string;
  flightNum: string;
}

export function parseFlightNumber(input: string): ParsedFlightNumber | null {
  const cleaned = input.replace(/\s+/g, '').toUpperCase();
  const match = cleaned.match(/^([A-Z]{2})(\d{1,4})$/);
  if (!match) return null;
  return { airlineCode: match[1], flightNum: match[2] };
}

// ───────────────────────────────────────────────────────────────
// In-process TTL cache
// ───────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const SCHEDULE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const POSITION_TTL_MS = 60 * 1000; // 1 minute

const scheduleCache = new Map<string, CacheEntry<FlightLookupResult>>();
const positionCache = new Map<string, CacheEntry<LivePosition>>();

function cacheGet<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function cacheSet<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  value: T,
  ttlMs: number,
): void {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/** Test helper — clears all cached state. */
export function _resetCacheForTests(): void {
  scheduleCache.clear();
  positionCache.clear();
}

// ───────────────────────────────────────────────────────────────
// AviationStack provider (real schedule data)
// ───────────────────────────────────────────────────────────────

interface AviationStackAirport {
  airport?: string | null;
  iata?: string | null;
  icao?: string | null;
  timezone?: string | null;
}

interface AviationStackAirline {
  name?: string | null;
  iata?: string | null;
  icao?: string | null;
}

interface AviationStackFlight {
  flight_status?: string | null;
  departure?: AviationStackAirport | null;
  arrival?: AviationStackAirport | null;
  airline?: AviationStackAirline | null;
  flight?: { iata?: string | null; icao?: string | null; number?: string | null } | null;
}

interface AviationStackResponse {
  data?: AviationStackFlight[];
  error?: { code?: string; message?: string };
}

const AVIATIONSTACK_BASE_URL = 'http://api.aviationstack.com/v1';

function mapAviationStackStatus(raw: string | null | undefined): FlightStatus {
  switch ((raw || '').toLowerCase()) {
    case 'active':
    case 'en-route':
      return 'active';
    case 'landed':
      return 'landed';
    case 'cancelled':
      return 'cancelled';
    case 'diverted':
      return 'diverted';
    case 'scheduled':
    default:
      return 'scheduled';
  }
}

function airportFromAviationStack(
  raw: AviationStackAirport | null | undefined,
): AirportData | null {
  if (!raw) return null;
  const iata = raw.iata?.toUpperCase();
  const icao = raw.icao?.toUpperCase();
  if (iata && AIRPORTS_BY_IATA[iata]) return AIRPORTS_BY_IATA[iata];
  if (icao && AIRPORTS_BY_ICAO[icao]) return AIRPORTS_BY_ICAO[icao];
  // We don't have coords for unknown airports — caller decides whether to bail.
  if (iata && icao && raw.airport) {
    return {
      iata,
      icao,
      name: raw.airport,
      city: raw.airport,
      lat: 0,
      lon: 0,
    };
  }
  return null;
}

class AviationStackProvider implements FlightProvider {
  readonly name = 'aviationstack' as const;

  constructor(
    private readonly apiKey: string | undefined,
    private readonly fetchImpl: typeof fetch = globalThis.fetch,
  ) {}

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async lookupFlight(
    airlineCode: string,
    flightNum: string,
  ): Promise<FlightLookupResult | null> {
    if (!this.apiKey) return null;

    const flightIata = `${airlineCode}${flightNum}`;
    const url = `${AVIATIONSTACK_BASE_URL}/flights?access_key=${encodeURIComponent(
      this.apiKey,
    )}&flight_iata=${encodeURIComponent(flightIata)}&limit=1`;

    let json: AviationStackResponse;
    try {
      const res = await this.fetchImpl(url);
      if (!res.ok) {
        console.warn(
          `[flight-lookup] AviationStack returned ${res.status} for ${flightIata}`,
        );
        return null;
      }
      json = (await res.json()) as AviationStackResponse;
    } catch (err) {
      console.warn(`[flight-lookup] AviationStack fetch failed:`, err);
      return null;
    }

    if (json.error) {
      console.warn(
        `[flight-lookup] AviationStack error: ${json.error.code} ${json.error.message}`,
      );
      return null;
    }

    const flight = json.data?.[0];
    if (!flight) return null;

    const departure = airportFromAviationStack(flight.departure);
    const arrival = airportFromAviationStack(flight.arrival);
    if (!departure || !arrival) return null;
    if (departure.lat === 0 && departure.lon === 0) return null;
    if (arrival.lat === 0 && arrival.lon === 0) return null;

    const airline: AirlineData = AIRLINES[airlineCode] ?? {
      name: flight.airline?.name || airlineCode,
      iata: flight.airline?.iata?.toUpperCase() || airlineCode,
      icao: flight.airline?.icao?.toUpperCase() || airlineCode,
    };

    return {
      flightNumber: flightIata,
      airline,
      departure,
      arrival,
      status: mapAviationStackStatus(flight.flight_status),
      source: 'aviationstack',
      mock: false,
    };
  }
}

// ───────────────────────────────────────────────────────────────
// Mock provider (last-resort synthesized data)
// ───────────────────────────────────────────────────────────────

interface MockRoute {
  departure: string;
  arrival: string;
}

const MOCK_ROUTES: Record<string, MockRoute> = {
  AA1: { departure: 'JFK', arrival: 'LAX' },
  AA100: { departure: 'JFK', arrival: 'LAX' },
  AA123: { departure: 'LAX', arrival: 'JFK' },
  AA175: { departure: 'DFW', arrival: 'ORD' },
  AA200: { departure: 'MIA', arrival: 'JFK' },
  AA234: { departure: 'ORD', arrival: 'DFW' },
  AA300: { departure: 'LAX', arrival: 'MIA' },
  AA456: { departure: 'DFW', arrival: 'LAX' },
  AA500: { departure: 'JFK', arrival: 'MIA' },
  AA789: { departure: 'PHX', arrival: 'DFW' },
  UA1: { departure: 'SFO', arrival: 'EWR' },
  UA100: { departure: 'EWR', arrival: 'SFO' },
  UA123: { departure: 'ORD', arrival: 'DEN' },
  UA234: { departure: 'SFO', arrival: 'ORD' },
  UA456: { departure: 'SFO', arrival: 'ORD' },
  UA500: { departure: 'DEN', arrival: 'SFO' },
  UA789: { departure: 'IAH', arrival: 'DEN' },
  DL1: { departure: 'JFK', arrival: 'LAX' },
  DL100: { departure: 'ATL', arrival: 'LAX' },
  DL123: { departure: 'JFK', arrival: 'ATL' },
  DL234: { departure: 'ATL', arrival: 'JFK' },
  DL456: { departure: 'MSP', arrival: 'ATL' },
  DL500: { departure: 'DTW', arrival: 'ATL' },
  DL789: { departure: 'SEA', arrival: 'ATL' },
  WN1: { departure: 'LAS', arrival: 'PHX' },
  WN100: { departure: 'DEN', arrival: 'LAS' },
  WN123: { departure: 'LAX', arrival: 'LAS' },
  WN456: { departure: 'PHX', arrival: 'DEN' },
  WN789: { departure: 'ORD', arrival: 'DEN' },
  B6100: { departure: 'JFK', arrival: 'BOS' },
  B6123: { departure: 'BOS', arrival: 'JFK' },
  B6456: { departure: 'JFK', arrival: 'MCO' },
  B6789: { departure: 'BOS', arrival: 'MCO' },
  AS100: { departure: 'SEA', arrival: 'LAX' },
  AS123: { departure: 'SEA', arrival: 'SFO' },
  AS456: { departure: 'LAX', arrival: 'SEA' },
  HA100: { departure: 'HNL', arrival: 'LAX' },
  HA123: { departure: 'HNL', arrival: 'SFO' },
  HA456: { departure: 'LAX', arrival: 'HNL' },
};

function generateMockRoute(flightNum: string): MockRoute {
  const num = parseInt(flightNum, 10);
  const keys = Object.keys(AIRPORTS_BY_IATA);
  const depIndex = num % keys.length;
  let arrIndex = (num * 7 + 3) % keys.length;
  if (arrIndex === depIndex) arrIndex = (arrIndex + 1) % keys.length;
  return { departure: keys[depIndex], arrival: keys[arrIndex] };
}

class MockProvider implements FlightProvider {
  readonly name = 'mock' as const;

  isAvailable(): boolean {
    return true;
  }

  async lookupFlight(
    airlineCode: string,
    flightNum: string,
  ): Promise<FlightLookupResult | null> {
    const airline = AIRLINES[airlineCode];
    if (!airline) return null;

    const formatted = `${airlineCode}${flightNum}`;
    const route = MOCK_ROUTES[formatted] ?? generateMockRoute(flightNum);
    const departure = AIRPORTS_BY_IATA[route.departure];
    const arrival = AIRPORTS_BY_IATA[route.arrival];
    if (!departure || !arrival) return null;

    return {
      flightNumber: formatted,
      airline,
      departure,
      arrival,
      status: 'scheduled',
      source: 'mock',
      mock: true,
    };
  }
}

// ───────────────────────────────────────────────────────────────
// OpenSky live position enrichment
// ───────────────────────────────────────────────────────────────

// State vector tuple per https://openskynetwork.github.io/opensky-api/rest.html
// 0: icao24, 1: callsign, 2: origin_country, 3: time_position, 4: last_contact,
// 5: longitude, 6: latitude, 7: baro_altitude, 8: on_ground, 9: velocity,
// 10: true_track, 11: vertical_rate, 12: sensors, 13: geo_altitude
type OpenSkyStateVector = readonly unknown[];

interface OpenSkyResponse {
  time: number;
  states: OpenSkyStateVector[] | null;
}

const OPENSKY_BASE_URL = 'https://opensky-network.org/api/states/all';

function asNumber(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function asString(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

export async function fetchLivePosition(
  airlineIcao: string,
  flightNum: string,
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<LivePosition | null> {
  if (!fetchImpl) return null;

  // Callsigns are typically ICAO airline + flight number, padded with spaces.
  const callsignPrefix = `${airlineIcao}${flightNum}`.toUpperCase();
  const cacheKey = `pos:${callsignPrefix}`;
  const cached = cacheGet(positionCache, cacheKey);
  if (cached) return cached;

  const username = process.env.OPENSKY_USERNAME;
  const password = process.env.OPENSKY_PASSWORD;
  const headers: Record<string, string> = {};
  if (username && password) {
    headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  }

  let json: OpenSkyResponse;
  try {
    const res = await fetchImpl(OPENSKY_BASE_URL, { headers });
    if (!res.ok) return null;
    json = (await res.json()) as OpenSkyResponse;
  } catch (err) {
    console.warn('[flight-lookup] OpenSky fetch failed:', err);
    return null;
  }

  if (!json.states) return null;

  const match = json.states.find((s) => {
    const callsign = asString(s[1])?.trim().toUpperCase();
    return callsign === callsignPrefix;
  });
  if (!match) return null;

  const lon = asNumber(match[5]);
  const lat = asNumber(match[6]);
  if (lat === null || lon === null) return null;

  const altMeters = asNumber(match[13]) ?? asNumber(match[7]);
  const velocityMs = asNumber(match[9]);
  const heading = asNumber(match[10]);
  const onGround = Boolean(match[8]);

  const position: LivePosition = {
    lat,
    lon,
    altitudeFt: altMeters !== null ? Math.round(altMeters * 3.28084) : null,
    velocityKt: velocityMs !== null ? Math.round(velocityMs * 1.94384) : null,
    headingDeg: heading,
    onGround,
    fetchedAt: Date.now(),
  };

  cacheSet(positionCache, cacheKey, position, POSITION_TTL_MS);
  return position;
}

// ───────────────────────────────────────────────────────────────
// Public lookup entry point
// ───────────────────────────────────────────────────────────────

export interface LookupOptions {
  /** When false, skip OpenSky live position enrichment. Default: true */
  includeLivePosition?: boolean;
  /** Override providers (test injection). */
  providers?: FlightProvider[];
  /** Override fetch (test injection). */
  fetchImpl?: typeof fetch;
  /** When true, ignore cache for this lookup. */
  bypassCache?: boolean;
  /**
   * When true, skip real providers and return mock data directly. Used by the
   * user-facing "Demo mode" toggle so screenshots/demos don't burn quota.
   */
  forceMock?: boolean;
}

export type LookupErrorCode =
  | 'INVALID_FLIGHT_NUMBER'
  | 'UNKNOWN_AIRLINE'
  | 'FLIGHT_NOT_FOUND';

export interface LookupError {
  code: LookupErrorCode;
  message: string;
}

export type LookupOutcome =
  | { ok: true; result: FlightLookupResult }
  | { ok: false; error: LookupError };

function defaultProviders(fetchImpl: typeof fetch = globalThis.fetch): FlightProvider[] {
  return [
    new AviationStackProvider(process.env.AVIATIONSTACK_API_KEY, fetchImpl),
    new MockProvider(),
  ];
}

export async function lookupFlight(
  rawFlightNumber: string,
  options: LookupOptions = {},
): Promise<LookupOutcome> {
  const parsed = parseFlightNumber(rawFlightNumber);
  if (!parsed) {
    return {
      ok: false,
      error: {
        code: 'INVALID_FLIGHT_NUMBER',
        message:
          'Invalid flight number format. Use airline code + number (e.g., AA123, UA456).',
      },
    };
  }

  const { airlineCode, flightNum } = parsed;
  if (!AIRLINES[airlineCode]) {
    return {
      ok: false,
      error: {
        code: 'UNKNOWN_AIRLINE',
        message: `Unknown airline code: ${airlineCode}. Supported airlines: ${Object.keys(AIRLINES).join(', ')}.`,
      },
    };
  }

  // Demo-mode lookups bypass cache entirely so toggling on/off shows the
  // change immediately, and we never want a live result to satisfy a mock
  // request (or vice versa).
  const cacheKey = `flight:${airlineCode}${flightNum}`;
  if (!options.bypassCache && !options.forceMock) {
    const cached = cacheGet(scheduleCache, cacheKey);
    if (cached) return { ok: true, result: cached };
  }

  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const allProviders = options.providers ?? defaultProviders(fetchImpl);
  const providers = options.forceMock
    ? allProviders.filter((p) => p.name === 'mock')
    : allProviders;

  for (const provider of providers) {
    if (!provider.isAvailable()) continue;
    try {
      const result = await provider.lookupFlight(airlineCode, flightNum);
      if (result) {
        if (!options.forceMock) {
          cacheSet(scheduleCache, cacheKey, result, SCHEDULE_TTL_MS);
        }

        if (options.includeLivePosition !== false && !result.mock) {
          const livePosition = await fetchLivePosition(
            result.airline.icao,
            flightNum,
            fetchImpl,
          ).catch(() => null);
          if (livePosition) {
            const enriched = { ...result, livePosition };
            if (!options.forceMock) {
              cacheSet(scheduleCache, cacheKey, enriched, SCHEDULE_TTL_MS);
            }
            return { ok: true, result: enriched };
          }
        }

        return { ok: true, result };
      }
    } catch (err) {
      console.warn(`[flight-lookup] Provider ${provider.name} threw:`, err);
    }
  }

  return {
    ok: false,
    error: {
      code: 'FLIGHT_NOT_FOUND',
      message: 'Flight not found. Check the flight number and try again.',
    },
  };
}
