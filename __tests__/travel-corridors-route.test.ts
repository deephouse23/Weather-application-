/**
 * Unit tests for Travel Corridors API Route
 */

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

import { GET } from '@/app/api/travel/corridors/route';
import { NextRequest } from 'next/server';

describe('Travel Corridors API Route', () => {
  it('should export a GET handler', async () => {
    const mod = await import('@/app/api/travel/corridors/route');
    expect(typeof mod.GET).toBe('function');
  });

  it('should return 400 for invalid day param', async () => {
    const req = new NextRequest('http://localhost:3000/api/travel/corridors?day=5');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});
