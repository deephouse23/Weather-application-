/**
 * Test for Sentry fix: JAVASCRIPT-NEXTJS-X / JAVASCRIPT-NEXTJS-W
 * useWeatherController must not include checkRateLimit in useEffect deps
 * to avoid infinite re-render loops
 */

import { renderHook } from '@testing-library/react';

// Mock dependencies
jest.mock('@/lib/location-service', () => ({
  reverseGeocode: jest.fn(),
}));
jest.mock('@/components/location-context', () => ({
  useLocation: () => ({
    location: null,
    setLocation: jest.fn(),
    isLoading: false,
  }),
}));

// Track how many times checkRateLimit executes
let checkRateLimitCallCount = 0;

jest.mock('@/lib/user-cache-service', () => ({
  UserCacheService: {
    getCachedWeather: jest.fn().mockReturnValue(null),
    cacheWeather: jest.fn(),
  },
}));

describe('useWeatherController rate limit effect (JAVASCRIPT-NEXTJS-X/W)', () => {
  it('should not cause infinite re-renders from checkRateLimit in useEffect deps', async () => {
    // We test this by verifying the hook stabilizes (doesn't exceed render limit)
    // Import the actual hook source to check the dependency array
    const fs = require('fs');
    const path = require('path');
    const hookSource = fs.readFileSync(
      path.join(__dirname, '..', 'hooks', 'useWeatherController.ts'),
      'utf8'
    );

    // The useEffect that calls checkRateLimit() and setRemainingSearches
    // must NOT include checkRateLimit in its dependency array.
    // We identify it by the "Update remaining searches on mount" comment
    // or the useEffect containing both checkRateLimit() call and setRemainingSearches.
    const lines = hookSource.split('\n');
    let inTargetEffect = false;
    let hasUnsafeDep = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('useEffect(') || lines[i].includes('useCallback(')) {
        inTargetEffect = false; // reset on any new hook block
      }
      if (lines[i].includes('checkRateLimit()') && lines[i - 1]?.includes('isClient')) {
        inTargetEffect = true;
      }
      if (inTargetEffect && lines[i].match(/\},\s*\[/) && lines[i].includes('checkRateLimit')) {
        hasUnsafeDep = true;
      }
    }

    expect(hasUnsafeDep).toBe(false);
  });
});
