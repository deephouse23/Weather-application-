/**
 * Tests for Stargazer Location Display Features
 */

import type { StargazerData } from '@/lib/stargazer/types';

describe('StargazerData location type', () => {
  it('should support displayName, bortle, and bortleLabel fields', () => {
    const location: StargazerData['location'] = {
      lat: 35.7796,
      lon: -78.6382,
      name: 'Raleigh',
      displayName: 'Raleigh, NC',
      bortle: 7,
      bortleLabel: 'Suburban/urban transition',
    };
    expect(location.displayName).toBe('Raleigh, NC');
    expect(location.bortle).toBe(7);
    expect(location.bortleLabel).toBe('Suburban/urban transition');
  });
});

describe('estimateBortleClass', () => {
  it('returns high Bortle for large cities (>1M population)', async () => {
    const { estimateBortleClass } = await import('@/lib/stargazer/bortle');
    const result = estimateBortleClass(2_000_000);
    expect(result.bortle).toBeGreaterThanOrEqual(8);
    expect(typeof result.label).toBe('string');
  });

  it('returns moderate Bortle for medium cities (100k-500k)', async () => {
    const { estimateBortleClass } = await import('@/lib/stargazer/bortle');
    const result = estimateBortleClass(250_000);
    expect(result.bortle).toBeGreaterThanOrEqual(6);
    expect(result.bortle).toBeLessThanOrEqual(7);
  });

  it('returns low Bortle for small towns (<10k)', async () => {
    const { estimateBortleClass } = await import('@/lib/stargazer/bortle');
    const result = estimateBortleClass(5_000);
    expect(result.bortle).toBeLessThanOrEqual(4);
  });

  it('returns Bortle 4 when population is unknown', async () => {
    const { estimateBortleClass } = await import('@/lib/stargazer/bortle');
    const result = estimateBortleClass(undefined);
    expect(result.bortle).toBe(4);
    expect(result.label).toBeDefined();
  });
});

describe('formatTonightDate', () => {
  it('formats a date spanning tonight into tomorrow', async () => {
    const { formatTonightDate } = await import('@/lib/stargazer/bortle');
    const date = new Date(2026, 3, 5); // April 5, 2026
    const result = formatTonightDate(date);
    expect(result).toContain('Apr');
    expect(result).toContain('2026');
    expect(result).toMatch(/Apr \d+.*Apr \d+/);
  });

  it('handles month boundary correctly', async () => {
    const { formatTonightDate } = await import('@/lib/stargazer/bortle');
    const date = new Date(2026, 3, 30); // April 30, 2026
    const result = formatTonightDate(date);
    expect(result).toContain('Apr 30');
    expect(result).toContain('May 1');
  });
});
