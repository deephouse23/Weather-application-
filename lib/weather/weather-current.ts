/**
 * Weather Current Module
 *
 * Contains main functions for:
 * - Fetching current weather data
 * - Fetching weather by coordinates
 * - Fetching minutely nowcast
 */

import { WeatherData } from '../types';
import {
  getApiUrl,
  formatTemperature,
  formatPressureByRegion,
  formatTime,
  getCompassDirection,
  getWindDirection,
  calculateMoonPhase,
  WindData
} from './weather-utils';
import { parseLocationInput, geocodeLocation } from './weather-geocoding';
import {
  processDailyForecast,
  processHourlyForecast,
  fetchUVIndex,
  fetchPollenData,
  fetchAirQualityData,
  ensureFiveDays,
  OpenWeatherMapForecastResponse
} from './weather-forecast';

// ============================================================================
// Types
// ============================================================================

interface OpenWeatherMapCurrentResponse {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
    deg?: number;
    gust?: number;
  };
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
}

// ============================================================================
// Main Weather Fetch Functions
// ============================================================================

/**
 * Fetch weather data for a location string
 */
export const fetchWeatherData = async (
  locationInput: string,
  unitSystem: 'metric' | 'imperial' = 'imperial'
): Promise<WeatherData> => {
  try {
    // Parse location input
    const locationQuery = parseLocationInput(locationInput);

    // Geocode location
    const { lat, lon, displayName, country } = await geocodeLocation(locationQuery);

    // Playwright E2E tests stub the legacy endpoints
    const isPlaywrightTestMode = process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE === 'true';
    if (isPlaywrightTestMode) {
      return await fetchWeatherLegacyEndpoints(lat, lon, displayName, unitSystem);
    }

    // Fetch One Call 3.0 aggregation using internal API
    const oneCallResponse = await fetch(
      getApiUrl(`/api/weather/onecall?lat=${lat}&lon=${lon}&units=${unitSystem}`)
    );
    if (!oneCallResponse.ok) {
      throw new Error(`One Call API call failed: ${oneCallResponse.status}`);
    }
    const oneCall = await oneCallResponse.json();

    return buildWeatherDataFromOneCall(oneCall, displayName, lat, lon, unitSystem, country);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Fetch weather by coordinates
 */
export const fetchWeatherByLocation = async (
  coords: string,
  unitSystem: 'metric' | 'imperial' = 'imperial',
  locationName?: string
): Promise<WeatherData> => {
  const [latitude, longitude] = coords.split(',').map(Number);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid coordinates');
  }

  try {
    const isPlaywrightTestMode = process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE === 'true';
    if (isPlaywrightTestMode) {
      return await fetchWeatherLegacyEndpoints(
        latitude,
        longitude,
        locationName || `${latitude}, ${longitude}`,
        unitSystem
      );
    }

    // Fetch One Call 3.0 aggregation using internal API
    const oneCallResponse = await fetch(
      getApiUrl(`/api/weather/onecall?lat=${latitude}&lon=${longitude}&units=${unitSystem}`)
    );
    if (!oneCallResponse.ok) {
      throw new Error(`One Call API call failed: ${oneCallResponse.status}`);
    }
    const oneCall = await oneCallResponse.json();

    const displayName = locationName || `${oneCall?.timezone || 'Selected Location'}`;
    return buildWeatherDataFromOneCall(oneCall, displayName, latitude, longitude, unitSystem);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Fetch minutely nowcast for overlays
 */
export async function fetchMinutelyNowcast(
  lat: number,
  lon: number,
  units: 'metric' | 'imperial'
): Promise<{ minutely: Array<{ dt: number; precipitation: number }> }> {
  try {
    const res = await fetch(
      getApiUrl(`/api/weather/onecall/minutely?lat=${lat}&lon=${lon}&units=${units}`),
      { cache: 'no-store' }
    );
    if (!res.ok) return { minutely: [] };
    return res.json();
  } catch {
    return { minutely: [] };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build WeatherData from One Call API response
 */
async function buildWeatherDataFromOneCall(
  oneCall: {
    timezone?: string;
    timezone_offset?: number;
    current?: {
      dt?: number;
      temp?: number;
      humidity?: number;
      pressure?: number;
      wind_speed?: number;
      wind_deg?: number;
      wind_gust?: number;
      sunrise?: number;
      sunset?: number;
      uvi?: number;
      weather?: Array<{ main?: string; description?: string }>;
      sys?: { country?: string };
    };
    daily?: Array<{
      dt: number;
      temp?: { max?: number; min?: number };
      humidity?: number;
      wind_speed?: number;
      wind_deg?: number;
      pressure?: number;
      clouds?: number;
      pop?: number;
      uvi?: number;
      weather?: Array<{ main?: string; description?: string }>;
    }>;
    hourly?: Array<{
      dt: number;
      temp: number;
      humidity?: number;
      wind_speed?: number;
      wind_deg?: number;
      pressure?: number;
      clouds?: number;
      pop?: number;
      weather?: Array<{ main?: string; description?: string; icon?: string }>;
      feels_like?: number;
      uvi?: number;
    }>;
  },
  displayName: string,
  lat: number,
  lon: number,
  unitSystem: 'metric' | 'imperial',
  countryCode?: string
): Promise<WeatherData> {
  // Process and validate data
  const resolvedCountryCode = countryCode || oneCall?.current?.sys?.country || 'US';

  // Format temperature with proper unit handling
  const temp = formatTemperature(oneCall.current?.temp ?? 0, resolvedCountryCode, unitSystem);

  // Process forecast data: use One Call daily for 5-day view
  const baseDaily = Array.isArray(oneCall.daily)
    ? oneCall.daily.slice(0, 5).map((d) => ({
        day: new Date(d.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
        highTemp: Math.round(d.temp?.max ?? 0),
        lowTemp: Math.round(d.temp?.min ?? 0),
        condition: d.weather?.[0]?.main || 'Clear',
        description: d.weather?.[0]?.description || 'clear sky',
        details: {
          humidity: d.humidity ?? 0,
          windSpeed: Math.round(d.wind_speed ?? 0),
          windDirection: d.wind_deg ? getWindDirection(d.wind_deg) : undefined,
          pressure: `${d.pressure ?? 1013} hPa`,
          cloudCover: d.clouds ?? 0,
          precipitationChance: Math.round((d.pop ?? 0) * 100),
          visibility: undefined,
          uvIndex: Math.round(d.uvi ?? 0)
        },
        hourlyForecast: []
      }))
    : [];

  const forecast = ensureFiveDays(baseDaily, oneCall);

  // Calculate moon phase
  const moonPhase = calculateMoonPhase();

  // Get UV Index from One Call response
  const uvIndex = Math.round(oneCall.current?.uvi ?? 0);

  // Fetch Pollen data
  const pollenData = await fetchPollenData(lat, lon);

  // Fetch Air Quality data
  const airQualityData = await fetchAirQualityData(lat, lon, displayName);

  // Process hourly forecast data (48 hours)
  const hourlyForecast = processHourlyForecast(
    oneCall.hourly || [],
    oneCall.timezone_offset || 0
  );

  // Construct weather data object
  const weatherData: WeatherData = {
    location: displayName,
    country: resolvedCountryCode,
    temperature: temp.value,
    unit: temp.unit,
    condition: oneCall.current?.weather?.[0]?.main ?? 'Clear',
    description: oneCall.current?.weather?.[0]?.description ?? 'clear sky',
    humidity: oneCall.current?.humidity ?? 0,
    wind: {
      speed: oneCall.current?.wind_speed ?? 0,
      direction: oneCall.current?.wind_deg
        ? getCompassDirection(oneCall.current.wind_deg)
        : undefined,
      gust: oneCall.current?.wind_gust
    } as WindData,
    pressure: formatPressureByRegion(oneCall.current?.pressure ?? 1013, resolvedCountryCode),
    sunrise: oneCall.current?.sunrise
      ? formatTime(oneCall.current.sunrise, oneCall.timezone_offset)
      : 'N/A',
    sunset: oneCall.current?.sunset
      ? formatTime(oneCall.current.sunset, oneCall.timezone_offset)
      : 'N/A',
    forecast: forecast,
    moonPhase: moonPhase,
    uvIndex,
    aqi: airQualityData.aqi,
    aqiCategory: airQualityData.category,
    pollen: pollenData,
    coordinates: { lat, lon },
    hourlyForecast: hourlyForecast
  };

  return weatherData;
}

/**
 * Fetch weather using legacy endpoints (for Playwright tests)
 */
async function fetchWeatherLegacyEndpoints(
  lat: number,
  lon: number,
  displayName: string,
  unitSystem: 'metric' | 'imperial'
): Promise<WeatherData> {
  const [currentRes, forecastRes] = await Promise.all([
    fetch(getApiUrl(`/api/weather/current?lat=${lat}&lon=${lon}&units=${unitSystem}`), {
      cache: 'no-store'
    }),
    fetch(getApiUrl(`/api/weather/forecast?lat=${lat}&lon=${lon}&units=${unitSystem}`), {
      cache: 'no-store'
    }),
  ]);

  if (!currentRes.ok) {
    throw new Error(`Current weather API call failed: ${currentRes.status}`);
  }
  if (!forecastRes.ok) {
    throw new Error(`Forecast API call failed: ${forecastRes.status}`);
  }

  const current: OpenWeatherMapCurrentResponse = await currentRes.json();
  const forecastRaw: OpenWeatherMapForecastResponse = await forecastRes.json();

  const countryCode = current?.sys?.country || 'US';
  const useFahrenheit = unitSystem === 'imperial';

  const temperature = Math.round(current?.main?.temp ?? 0);
  const unit = useFahrenheit ? '°F' : '°C';

  const forecast = processDailyForecast(forecastRaw, useFahrenheit).slice(0, 5);
  const moonPhase = calculateMoonPhase();

  const uvIndex = await fetchUVIndex(lat, lon).catch(() => 0);
  const pollenData = await fetchPollenData(lat, lon).catch(() => ({
    tree: {},
    grass: {},
    weed: {}
  } as { tree: Record<string, string>; grass: Record<string, string>; weed: Record<string, string> }));
  const airQualityData = await fetchAirQualityData(lat, lon, displayName).catch(() => ({
    aqi: 0,
    category: 'Unknown'
  }));

  return {
    location: displayName,
    country: countryCode,
    temperature,
    unit,
    condition: current?.weather?.[0]?.main ?? 'Clear',
    description: current?.weather?.[0]?.description ?? 'clear sky',
    humidity: current?.main?.humidity ?? 0,
    wind: {
      speed: current?.wind?.speed ?? 0,
      direction: current?.wind?.deg ? getCompassDirection(current.wind.deg) : undefined,
      gust: current?.wind?.gust,
    } as WindData,
    pressure: formatPressureByRegion(current?.main?.pressure ?? 1013, countryCode),
    sunrise: current?.sys?.sunrise
      ? formatTime(current.sys.sunrise, current?.timezone ?? 0)
      : 'N/A',
    sunset: current?.sys?.sunset
      ? formatTime(current.sys.sunset, current?.timezone ?? 0)
      : 'N/A',
    forecast,
    moonPhase,
    uvIndex,
    aqi: airQualityData.aqi,
    aqiCategory: airQualityData.category,
    pollen: pollenData,
    coordinates: { lat, lon },
    hourlyForecast: [],
  };
}
