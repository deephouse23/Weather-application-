/**
 * @jest-environment node
 */

/**
 * Tests for Sentry error fixes
 */

import { getApiUrl } from '@/lib/weather/weather-utils';

describe('getApiUrl localhost fallback (JAVASCRIPT-NEXTJS-P)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.VERCEL_URL;
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
    delete process.env.NEXT_PUBLIC_BASE_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should fallback to localhost:3000, not localhost:3003, when no env vars are set', () => {
    const url = getApiUrl('/api/weather/geocoding');
    expect(url).toBe('http://localhost:3000/api/weather/geocoding');
  });
});
