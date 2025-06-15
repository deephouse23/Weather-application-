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
  forecast: Array<{
    day: string;
    highTemp: number;
    lowTemp: number;
    condition: string;
    description: string;
  }>;
  moonPhase: {
    phase: string;
    illumination: number;
    emoji: string;
    phaseAngle: number;
  };
  uvIndex: number;
  aqi: number;
  pollen: {
    tree: number;
    grass: number;
    weed: number;
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