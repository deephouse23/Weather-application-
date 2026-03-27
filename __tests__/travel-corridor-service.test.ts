/**
 * Unit tests for Travel Corridor Service
 */

import { scoreWeatherSeverity, getSeverityLevel, SEVERITY_COLORS, getWorstCorridors, getHazardDescription, type CorridorResult } from '@/lib/services/travel-corridor-service';

describe('Travel Corridor Service', () => {
  describe('scoreWeatherSeverity', () => {
    it('should return 0 for clear weather conditions', () => {
      const score = scoreWeatherSeverity({
        precipitation: 0,
        snowfall: 0,
        windGusts: 5,
        visibility: 10000,
        freezingLevel: 3000,
      });
      expect(score).toBe(0);
    });

    it('should score heavy rain higher than light rain', () => {
      const light = scoreWeatherSeverity({ precipitation: 1, snowfall: 0, windGusts: 5, visibility: 10000, freezingLevel: 3000 });
      const heavy = scoreWeatherSeverity({ precipitation: 5, snowfall: 0, windGusts: 5, visibility: 10000, freezingLevel: 3000 });
      expect(heavy).toBeGreaterThan(light);
      expect(light).toBeGreaterThan(0);
    });

    it('should cap score at 100', () => {
      const score = scoreWeatherSeverity({ precipitation: 20, snowfall: 10, windGusts: 120, visibility: 100, freezingLevel: 0 });
      expect(score).toBe(100);
    });
  });

  describe('getSeverityLevel', () => {
    it('should map scores to correct severity levels', () => {
      expect(getSeverityLevel(0)).toBe('green');
      expect(getSeverityLevel(24)).toBe('green');
      expect(getSeverityLevel(25)).toBe('yellow');
      expect(getSeverityLevel(50)).toBe('orange');
      expect(getSeverityLevel(75)).toBe('red');
    });
  });

  describe('SEVERITY_COLORS', () => {
    it('should have hex colors for each severity level', () => {
      expect(SEVERITY_COLORS.green).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(SEVERITY_COLORS.yellow).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(SEVERITY_COLORS.orange).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(SEVERITY_COLORS.red).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe('getWorstCorridors', () => {
    it('should return corridors sorted by worst score descending', () => {
      const corridors: CorridorResult[] = [
        { name: 'I-70', score: 10, level: 'green', color: '#22c55e', hazard: 'Clear', segments: [] },
        { name: 'I-90', score: 80, level: 'red', color: '#ef4444', hazard: 'Heavy snow', segments: [] },
        { name: 'I-95', score: 40, level: 'yellow', color: '#eab308', hazard: 'Rain', segments: [] },
      ];
      const worst = getWorstCorridors(corridors, 2);
      expect(worst).toHaveLength(2);
      expect(worst[0].name).toBe('I-90');
      expect(worst[1].name).toBe('I-95');
    });
  });

  describe('getHazardDescription', () => {
    it('should describe snow as primary hazard when snowfall is highest factor', () => {
      const desc = getHazardDescription({ precipitation: 0, snowfall: 3, windGusts: 10, visibility: 10000, freezingLevel: 3000 });
      expect(desc.toLowerCase()).toContain('snow');
    });
  });
});
