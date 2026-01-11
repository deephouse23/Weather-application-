/**
 * Weather API Module - Barrel Export
 *
 * This module re-exports all weather-related functions for backward compatibility.
 * Import from 'lib/weather' instead of 'lib/weather-api' for the new modular structure.
 */

// ============================================================================
// Main Weather Functions
// ============================================================================

export {
  fetchWeatherData,
  fetchWeatherByLocation,
  fetchMinutelyNowcast
} from './weather-current';

// ============================================================================
// Geocoding Functions
// ============================================================================

export {
  parseLocationInput,
  geocodeLocation,
  getLocationNotFoundError,
  type LocationQuery,
  type GeocodingResponse,
  type GeocodedLocation
} from './weather-geocoding';

// ============================================================================
// Forecast Functions
// ============================================================================

export {
  processDailyForecast,
  processHourlyForecast,
  fetchUVIndex,
  fetchPollenData,
  fetchAirQualityData,
  ensureFiveDays,
  type OpenWeatherMapForecastResponse,
  type DailyForecast
} from './weather-forecast';

// ============================================================================
// Utility Functions
// ============================================================================

export {
  // Constants
  BASE_URL,
  BASE_URL_V3,
  GEO_URL,

  // API URL Helper
  getApiUrl,

  // Unit System Detection
  shouldUseMetricUnits,
  isUSALocation,
  shouldUseFahrenheit,
  shouldUseInchesOfMercury,

  // Temperature Functions
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  formatTemperature,
  calculateDewPoint,

  // Wind Functions
  getCompassDirection,
  getWindDirection,
  formatWindDisplay,

  // Time Functions
  formatTime,

  // Pressure Functions
  getPressureUnit,
  formatPressureValue,
  formatPressureByRegion,

  // UV Index Functions
  getUVDescription,
  estimateCurrentUVFromDailyMax,

  // Moon Phase Functions
  calculateMoonPhase,

  // Weather Condition Mapping
  mapWeatherCondition,

  // Input Normalization
  normalizeInput,

  // Types
  type MoonPhaseInfo,
  type WindData
} from './weather-utils';
