/**
 * WMO Weather Interpretation Codes
 *
 * Maps Open-Meteo weather_code (WMO standard) to human-readable descriptions
 * and the app's internal condition categories.
 * See: https://open-meteo.com/en/docs#weathervariables
 */

export interface WMOCodeInfo {
  description: string;
  condition: string;
}

export const WMO_CODES: Record<number, WMOCodeInfo> = {
  0: { description: "Clear Sky", condition: "sunny" },
  1: { description: "Mainly Clear", condition: "sunny" },
  2: { description: "Partly Cloudy", condition: "cloudy" },
  3: { description: "Overcast", condition: "cloudy" },
  45: { description: "Fog", condition: "cloudy" },
  48: { description: "Depositing Rime Fog", condition: "cloudy" },
  51: { description: "Light Drizzle", condition: "rainy" },
  53: { description: "Moderate Drizzle", condition: "rainy" },
  55: { description: "Dense Drizzle", condition: "rainy" },
  56: { description: "Light Freezing Drizzle", condition: "rainy" },
  57: { description: "Dense Freezing Drizzle", condition: "rainy" },
  61: { description: "Slight Rain", condition: "rainy" },
  63: { description: "Moderate Rain", condition: "rainy" },
  65: { description: "Heavy Rain", condition: "rainy" },
  66: { description: "Light Freezing Rain", condition: "rainy" },
  67: { description: "Heavy Freezing Rain", condition: "rainy" },
  71: { description: "Slight Snowfall", condition: "snowy" },
  73: { description: "Moderate Snowfall", condition: "snowy" },
  75: { description: "Heavy Snowfall", condition: "snowy" },
  77: { description: "Snow Grains", condition: "snowy" },
  80: { description: "Slight Rain Showers", condition: "rainy" },
  81: { description: "Moderate Rain Showers", condition: "rainy" },
  82: { description: "Violent Rain Showers", condition: "rainy" },
  85: { description: "Slight Snow Showers", condition: "snowy" },
  86: { description: "Heavy Snow Showers", condition: "snowy" },
  95: { description: "Thunderstorm", condition: "rainy" },
  96: { description: "Thunderstorm with Slight Hail", condition: "rainy" },
  99: { description: "Thunderstorm with Heavy Hail", condition: "rainy" },
};

export function getWMOCodeInfo(code: number): WMOCodeInfo {
  return WMO_CODES[code] ?? { description: "Unknown", condition: "cloudy" };
}

export function getWMODescription(code: number): string {
  return getWMOCodeInfo(code).description;
}

export function getWMOCondition(code: number): string {
  return getWMOCodeInfo(code).condition;
}
