/**
 * Unit tests for Travel Weather Components
 */

// Mock OpenLayers
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
jest.mock('ol/Feature', () => jest.fn());
jest.mock('ol/geom/LineString', () => jest.fn());

describe('TravelCorridorMap component', () => {
  it('should export a default function component', async () => {
    const mod = await import('@/components/travel/TravelCorridorMap');
    expect(typeof mod.default).toBe('function');
  });
});

describe('WorstCorridors component', () => {
  it('should export a default function component', async () => {
    const mod = await import('@/components/travel/WorstCorridors');
    expect(typeof mod.default).toBe('function');
  });
});

describe('DailyOutlookImages component', () => {
  it('should export a default function component', async () => {
    const mod = await import('@/components/travel/DailyOutlookImages');
    expect(typeof mod.default).toBe('function');
  });
});
