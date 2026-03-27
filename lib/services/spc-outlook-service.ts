export type SPCOutlookDay = 1 | 2 | 3;
export type SPCOutlookType = 'cat' | 'torn' | 'hail' | 'wind';

const SPC_BASE = 'https://www.spc.noaa.gov/products/outlook';

export const OUTLOOK_TYPE_LABELS: Record<SPCOutlookType, string> = {
  cat: 'Categorical',
  torn: 'Tornado',
  hail: 'Hail',
  wind: 'Wind',
};

export const RISK_ORDER: Record<string, number> = {
  TSTM: 0,
  MRGL: 1,
  SLGT: 2,
  ENH: 3,
  MDT: 4,
  HIGH: 5,
};

export const RISK_LABELS: Record<string, string> = {
  TSTM: 'General Thunderstorms',
  MRGL: 'Marginal',
  SLGT: 'Slight',
  ENH: 'Enhanced',
  MDT: 'Moderate',
  HIGH: 'High',
};

export function getSPCOutlookUrl(day: SPCOutlookDay, type: SPCOutlookType): string {
  return `${SPC_BASE}/day${day}otlk_${type}.lyr.geojson`;
}

export interface SPCOutlookFeatureProperties {
  DN: number;
  VALID: string;
  EXPIRE: string;
  ISSUE: string;
  VALID_ISO: string;
  EXPIRE_ISO: string;
  ISSUE_ISO: string;
  FORECASTER: string;
  LABEL: string;
  LABEL2: string;
  stroke: string;
  fill: string;
}

export interface SPCOutlookGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'MultiPolygon' | 'Polygon';
      coordinates: number[][][][] | number[][][];
    };
    properties: SPCOutlookFeatureProperties;
  }>;
}

export async function fetchSPCOutlook(
  day: SPCOutlookDay,
  type: SPCOutlookType
): Promise<SPCOutlookGeoJSON> {
  const url = getSPCOutlookUrl(day, type);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': '16BitWeather/1.0',
        Accept: 'application/geo+json',
      },
    });

    if (!response.ok) {
      throw new Error(`SPC outlook fetch failed: ${response.status}`);
    }

    return response.json() as Promise<SPCOutlookGeoJSON>;
  } finally {
    clearTimeout(timeout);
  }
}
