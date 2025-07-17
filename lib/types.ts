export interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  unit: string;
  condition: string;
  description: string;
  humidity: number;
  wind: {
    speed: number;
    direction?: string;
    gust?: number;
  };
  pressure: string;
  sunrise: string;
  sunset: string;
  precipitationProbability?: number; // Added precipitation probability for current weather
  forecast: Array<{
    day: string;
    highTemp: number;
    lowTemp: number;
    condition: string;
    description: string;
    precipitationChance?: number; // Added precipitation chance to forecast days
    details?: {
      humidity?: number;
      windSpeed?: number;
      windDirection?: string;
      pressure?: string;
      cloudCover?: number;
      precipitationChance?: number;
      visibility?: number;
      uvIndex?: number;
    };
    hourlyForecast?: Array<{
      time: string;
      temp: number;
      condition: string;
      precipChance: number;
    }>;
  }>;
  moonPhase: {
    phase: string;
    illumination: number;
    emoji: string;
    phaseAngle: number;
  };
  uvIndex: number;
  aqi: number;
  aqiCategory?: string;
  pollen: {
    tree: Record<string, string>;
    grass: Record<string, string>;
    weed: Record<string, string>;
  };
}

export interface HistoricalData {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
  daily_units: {
    time: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
  };
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
} 