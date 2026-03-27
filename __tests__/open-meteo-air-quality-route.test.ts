/**
 * Unit tests for Open-Meteo air quality API route
 */

// Mock Next.js modules before importing
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    url: string;
    headers: Map<string, string>;
    nextUrl: { searchParams: URLSearchParams };

    constructor(url: string) {
      this.url = url;
      this.headers = new Map();
      this.nextUrl = { searchParams: new URLSearchParams(new URL(url).search) };
    }
  },
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      status: init?.status || 200,
      headers: init?.headers || {},
      json: async () => body,
    })),
  },
}));

// Mock the rate limiter
jest.mock('@/lib/services/weather-rate-limiter', () => ({
  rateLimitRequest: jest.fn().mockResolvedValue({
    allowed: true,
    headers: { 'X-RateLimit-Remaining': '99' },
  }),
}));

// Mock the open-meteo service
jest.mock('@/lib/open-meteo', () => ({
  fetchOpenMeteoAirQuality: jest.fn(),
}));

import { GET } from '@/app/api/open-meteo/air-quality/route';
import { fetchOpenMeteoAirQuality } from '@/lib/open-meteo';
import { rateLimitRequest } from '@/lib/services/weather-rate-limiter';
import { NextRequest } from 'next/server';

const mockedFetch = fetchOpenMeteoAirQuality as jest.MockedFunction<typeof fetchOpenMeteoAirQuality>;
const mockedRateLimit = rateLimitRequest as jest.MockedFunction<typeof rateLimitRequest>;

describe('GET /api/open-meteo/air-quality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRateLimit.mockResolvedValue({
      allowed: true,
      headers: { 'X-RateLimit-Remaining': '99' },
    } as any);
  });

  it('should return 400 when lat/lon are missing', async () => {
    const req = new NextRequest('http://localhost/api/open-meteo/air-quality');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Missing required parameters: lat, lon');
  });

  it('should return air quality data for valid coordinates', async () => {
    const mockData = { latitude: 40.71, longitude: -74.01, current: { us_aqi: 42 } };
    mockedFetch.mockResolvedValueOnce(mockData as any);

    const req = new NextRequest('http://localhost/api/open-meteo/air-quality?lat=40.71&lon=-74.01');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.current.us_aqi).toBe(42);
    expect(mockedFetch).toHaveBeenCalledWith(40.71, -74.01);
  });

  it('should return 400 for invalid coordinates', async () => {
    const req = new NextRequest('http://localhost/api/open-meteo/air-quality?lat=abc&lon=def');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid coordinates provided');
  });

  it('should return 400 for out-of-range coordinates', async () => {
    const req = new NextRequest('http://localhost/api/open-meteo/air-quality?lat=0&lon=181');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Coordinates out of valid range');
  });

  it('should return 502 when upstream service fails', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Air quality API down'));

    const req = new NextRequest('http://localhost/api/open-meteo/air-quality?lat=40.71&lon=-74.01');
    const res = await GET(req);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Air quality service unavailable');
  });
});
