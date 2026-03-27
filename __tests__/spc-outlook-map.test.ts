/**
 * Unit tests for SPC Outlook Map Component
 *
 * OpenLayers requires browser canvas APIs not available in jsdom.
 * We mock OL modules and verify the component can be imported.
 * Full rendering is verified via E2E tests.
 */

// Mock OpenLayers modules that require canvas
jest.mock('ol/ol.css', () => ({}));
jest.mock('ol/Map', () => jest.fn());
jest.mock('ol/View', () => jest.fn());
jest.mock('ol/layer/Tile', () => jest.fn());
jest.mock('ol/source/XYZ', () => jest.fn());
jest.mock('ol/layer/Vector', () => jest.fn());
jest.mock('ol/source/Vector', () => jest.fn());
jest.mock('ol/format/GeoJSON', () => jest.fn());
jest.mock('ol/proj', () => ({ fromLonLat: jest.fn() }));
jest.mock('ol/style', () => ({ Style: jest.fn(), Fill: jest.fn(), Stroke: jest.fn() }));
jest.mock('ol/Overlay', () => jest.fn());

describe('SPCOutlookMap component', () => {
  it('should export a default function component', async () => {
    const mod = await import('@/components/severe/SPCOutlookMap');
    expect(typeof mod.default).toBe('function');
  });
});
