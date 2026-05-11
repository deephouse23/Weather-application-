/**
 * 7-day forecast outlook with regional cuts.
 * - Open-Meteo for global gridded forecasts (free, keyless, ERA5-backed)
 * - NWS API for US text-format outlooks (free, no key)
 *
 * The Roadmap section pulls from these to talk about the week ahead.
 */

const FETCH_TIMEOUT_MS = 15_000;
const UA = '16bitweather-newsletter/1.0 (https://16bitweather.co; contact: justinelrod111@gmail.com)';

export interface RegionForecast {
  region: string;
  lat: number;
  lon: number;
  daily: Array<{
    date: string;
    tMaxF: number;
    tMinF: number;
    precipIn: number;
    precipProb: number;
    weatherCode: number;
  }>;
}

export interface ForecastOutlook {
  conusQuadrants: RegionForecast[];
  international: RegionForecast[];
  fetchedAt: string;
}

const CONUS_QUADRANTS: Array<Pick<RegionForecast, 'region' | 'lat' | 'lon'>> = [
  { region: 'Northeast (NYC area)', lat: 40.71, lon: -74.0 },
  { region: 'Southeast (Atlanta area)', lat: 33.75, lon: -84.39 },
  { region: 'Midwest (Chicago area)', lat: 41.88, lon: -87.63 },
  { region: 'Mountain West (Denver area)', lat: 39.74, lon: -104.99 },
  { region: 'Pacific (San Francisco area)', lat: 37.77, lon: -122.42 },
  { region: 'South Plains (Dallas area)', lat: 32.78, lon: -96.8 },
];

const INTERNATIONAL: Array<Pick<RegionForecast, 'region' | 'lat' | 'lon'>> = [
  { region: 'London', lat: 51.5, lon: -0.13 },
  { region: 'Tokyo', lat: 35.68, lon: 139.69 },
  { region: 'Sydney', lat: -33.87, lon: 151.21 },
];

export async function fetchForecastOutlook(): Promise<ForecastOutlook> {
  const [conusQuadrants, international] = await Promise.all([
    Promise.all(CONUS_QUADRANTS.map(fetchRegion)),
    Promise.all(INTERNATIONAL.map(fetchRegion)),
  ]);
  return {
    conusQuadrants,
    international,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchRegion(region: Pick<RegionForecast, 'region' | 'lat' | 'lon'>): Promise<RegionForecast> {
  const params = new URLSearchParams({
    latitude: String(region.lat),
    longitude: String(region.lon),
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode',
    temperature_unit: 'fahrenheit',
    precipitation_unit: 'inch',
    timezone: 'auto',
    forecast_days: '7',
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status} for ${region.region}`);
    const data = (await res.json()) as {
      daily?: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum: number[];
        precipitation_probability_max: number[];
        weathercode: number[];
      };
    };
    const d = data.daily;
    const daily = d
      ? d.time.map((date, i) => ({
          date,
          tMaxF: d.temperature_2m_max[i],
          tMinF: d.temperature_2m_min[i],
          precipIn: d.precipitation_sum[i],
          precipProb: d.precipitation_probability_max[i],
          weatherCode: d.weathercode[i],
        }))
      : [];
    return { ...region, daily };
  } finally {
    clearTimeout(timer);
  }
}
