/**
 * Unit tests for weather geocoding functions
 */

import { parseLocationInput, type LocationQuery } from '@/lib/weather/weather-geocoding';

describe('Location Parsing', () => {
  describe('parseLocationInput', () => {
    it('should parse city name only', () => {
      const result = parseLocationInput('New York');
      expect(result.type).toBe('city_only');
      expect(result.city).toBe('New York');
    });

    it('should parse city with state', () => {
      const result = parseLocationInput('Los Angeles, CA');
      expect(result.type).toBe('city_state');
      expect(result.city).toBe('Los Angeles');
      expect(result.state).toBe('CA');
    });

    it('should parse city with country', () => {
      const result = parseLocationInput('London, UK');
      expect(result.type).toBe('city_country');
      expect(result.city).toBe('London');
      expect(result.country).toBe('UK');
    });

    it('should parse US zip code', () => {
      const result = parseLocationInput('10001');
      expect(result.type).toBe('zip');
      expect(result.zipCode).toBe('10001');
    });

    it('should handle whitespace in input', () => {
      const result = parseLocationInput('  San Francisco  ');
      expect(result.city).toBe('San Francisco');
    });

    it('should return query string', () => {
      const result = parseLocationInput('Austin, TX');
      expect(result.query).toBe('Austin, TX');
    });
  });
});

describe('Location Query Types', () => {
  it('should have correct structure for city_only query', () => {
    const query: LocationQuery = {
      query: 'Paris',
      type: 'city_only',
      city: 'Paris',
    };
    expect(query.type).toBe('city_only');
    expect(query.city).toBe('Paris');
  });

  it('should have correct structure for city_country query', () => {
    const query: LocationQuery = {
      query: 'Paris, FR',
      type: 'city_country',
      city: 'Paris',
      country: 'FR',
    };
    expect(query.type).toBe('city_country');
    expect(query.country).toBe('FR');
  });

  it('should have correct structure for zip query', () => {
    const query: LocationQuery = {
      query: '90210',
      type: 'zip',
      zipCode: '90210',
    };
    expect(query.type).toBe('zip');
    expect(query.zipCode).toBe('90210');
  });
});
