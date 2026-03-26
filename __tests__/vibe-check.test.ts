/**
 * Unit tests for Vibe Check comfort scoring algorithm
 */

import {
  calculateVibeScore,
  getVibeCategory,
  type VibeInput,
} from '@/lib/services/vibe-check';

describe('Vibe Check', () => {
  describe('calculateVibeScore', () => {
    it('should return a perfect score for ideal conditions', () => {
      const input: VibeInput = {
        tempF: 72,
        humidity: 45,
        windMph: 5,
        precipChance: 0,
        uvIndex: 3,
        cloudCover: 20,
      };

      const result = calculateVibeScore(input);

      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should return a low score for harsh conditions', () => {
      const input: VibeInput = {
        tempF: 10,
        humidity: 95,
        windMph: 40,
        precipChance: 100,
        uvIndex: 0,
        cloudCover: 100,
      };

      const result = calculateVibeScore(input);

      expect(result.score).toBeLessThan(20);
    });

    it('should clamp score between 0 and 100', () => {
      const extreme: VibeInput = {
        tempF: -50, humidity: 100, windMph: 100,
        precipChance: 100, uvIndex: 15, cloudCover: 100,
      };

      const result = calculateVibeScore(extreme);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('getVibeCategory', () => {
    it('should map scores to correct categories', () => {
      expect(getVibeCategory(95)).toBe('Immaculate');
      expect(getVibeCategory(70)).toBe('Vibin');
      expect(getVibeCategory(50)).toBe('Decent');
      expect(getVibeCategory(30)).toBe('Meh');
      expect(getVibeCategory(10)).toBe('Rough');
    });
  });
});
