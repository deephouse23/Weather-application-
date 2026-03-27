/**
 * Unit tests for SPC Convective Outlook Service
 */

import { getSPCOutlookUrl, RISK_LABELS, RISK_ORDER, OUTLOOK_TYPE_LABELS, fetchSPCOutlook } from '@/lib/services/spc-outlook-service';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('SPC Outlook Service', () => {
  describe('getSPCOutlookUrl', () => {
    it('should build correct URL for day 1 categorical outlook', () => {
      const url = getSPCOutlookUrl(1, 'cat');
      expect(url).toBe('https://www.spc.noaa.gov/products/outlook/day1otlk_cat.lyr.geojson');
    });

    it('should build correct URL for day 2 tornado outlook', () => {
      const url = getSPCOutlookUrl(2, 'torn');
      expect(url).toBe('https://www.spc.noaa.gov/products/outlook/day2otlk_torn.lyr.geojson');
    });
  });

  describe('RISK_LABELS', () => {
    it('should have labels for all standard risk levels', () => {
      expect(RISK_LABELS.TSTM).toBe('General Thunderstorms');
      expect(RISK_LABELS.MRGL).toBe('Marginal');
      expect(RISK_LABELS.SLGT).toBe('Slight');
      expect(RISK_LABELS.ENH).toBe('Enhanced');
      expect(RISK_LABELS.MDT).toBe('Moderate');
      expect(RISK_LABELS.HIGH).toBe('High');
    });
  });

  describe('RISK_ORDER', () => {
    it('should order risk levels from least to most severe', () => {
      expect(RISK_ORDER.TSTM).toBeLessThan(RISK_ORDER.MRGL);
      expect(RISK_ORDER.MRGL).toBeLessThan(RISK_ORDER.SLGT);
      expect(RISK_ORDER.ENH).toBeLessThan(RISK_ORDER.HIGH);
    });
  });

  describe('OUTLOOK_TYPE_LABELS', () => {
    it('should have display names for all outlook types', () => {
      expect(OUTLOOK_TYPE_LABELS.cat).toBe('Categorical');
      expect(OUTLOOK_TYPE_LABELS.torn).toBe('Tornado');
      expect(OUTLOOK_TYPE_LABELS.hail).toBe('Hail');
      expect(OUTLOOK_TYPE_LABELS.wind).toBe('Wind');
    });
  });

  describe('fetchSPCOutlook', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should fetch and return GeoJSON from SPC', async () => {
      const mockGeoJSON = {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: { LABEL: 'TSTM' }, geometry: { type: 'MultiPolygon', coordinates: [] } }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockGeoJSON) });

      const result = await fetchSPCOutlook(1, 'cat');

      expect(result.type).toBe('FeatureCollection');
      expect(result.features[0].properties.LABEL).toBe('TSTM');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.spc.noaa.gov/products/outlook/day1otlk_cat.lyr.geojson',
        expect.objectContaining({ headers: expect.objectContaining({ 'User-Agent': '16BitWeather/1.0' }) })
      );
    });

    it('should throw on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });
      await expect(fetchSPCOutlook(1, 'cat')).rejects.toThrow('SPC outlook fetch failed: 503');
    });
  });
});
