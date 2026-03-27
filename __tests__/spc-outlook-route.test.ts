/**
 * Unit tests for SPC Outlook API Route
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

jest.mock('@/lib/services/spc-outlook-service', () => ({
  fetchSPCOutlook: jest.fn(),
}));

import { GET } from '@/app/api/weather/spc-outlook/route';
import { NextRequest } from 'next/server';
import { fetchSPCOutlook } from '@/lib/services/spc-outlook-service';
const mockFetchSPCOutlook = fetchSPCOutlook as jest.MockedFunction<typeof fetchSPCOutlook>;

describe('SPC Outlook API Route', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return GeoJSON for valid day and type params', async () => {
    const mockGeoJSON = { type: 'FeatureCollection', features: [] };
    mockFetchSPCOutlook.mockResolvedValueOnce(mockGeoJSON as never);

    const req = new NextRequest('http://localhost:3000/api/weather/spc-outlook?day=1&type=cat');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.type).toBe('FeatureCollection');
    expect(mockFetchSPCOutlook).toHaveBeenCalledWith(1, 'cat');
  });

  it('should return 400 for invalid day param', async () => {
    const req = new NextRequest('http://localhost:3000/api/weather/spc-outlook?day=5&type=cat');
    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it('should return 400 for partially numeric day like 1foo', async () => {
    const req = new NextRequest('http://localhost:3000/api/weather/spc-outlook?day=1foo&type=cat');
    const res = await GET(req);

    expect(res.status).toBe(400);
  });
});
