/**
 * Weather API Module - OpenWeatherMap Integration
 * 
 * This module provides comprehensive weather data fetching capabilities with:
 * - Real weather data from OpenWeatherMap API
 * - Enhanced location search (ZIP, City+State, City+Country)
 * - Timezone-aware sunrise/sunset times
 * - Wind direction with compass notation
 * - UV Index, pressure, and moon phase calculations
 */

import { WeatherData, HistoricalData } from './types'
import { deduplicateRequest, withRetry, cacheWeatherData, getCachedWeatherData } from './cache'

interface OpenWeatherMapCurrentResponse {
  main: {
    temp: number;
    humidity: number;
    pressure: number; // Atmospheric pressure in hPa
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
    deg?: number; // Wind direction in degrees (0-360)
    gust?: number; // Wind gust speed (optional)
  };
  name: string;
  sys: {
    country: string;
    sunrise: number; // Unix timestamp
    sunset: number; // Unix timestamp
  };
  timezone: number; // Timezone offset in seconds from UTC
}

interface OpenWeatherMapForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
  }>;
}

interface GeocodingResponse {
  name: string;
  local_names?: { [key: string]: string };
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

interface LocationQuery {
  query: string;
  type: 'zip' | 'city_state' | 'city_country' | 'city_only';
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

interface MoonPhaseInfo {
  phase: string;
  illumination: number;
  emoji: string;
  phaseAngle: number;
}

interface WindData {
  speed: number;
  direction?: string;
  gust?: number;
}

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const BASE_URL_V3 = 'https://api.openweathermap.org/data/3.0';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// Validate API key
const validateApiKey = () => {
  // Debug environment variables
  console.log('🔍 ENVIRONMENT VARIABLE DEBUG:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('REACT_APP_OPENWEATHER_API_KEY:', process.env.REACT_APP_OPENWEATHER_API_KEY ? 'SET' : 'MISSING');
  console.log('NEXT_PUBLIC_OPENWEATHER_API_KEY:', process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ? 'SET' : 'MISSING');
  console.log('All env vars starting with REACT_APP_:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
  console.log('All env vars starting with NEXT_PUBLIC_:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
  
  // Try both variable names for compatibility
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.REACT_APP_OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OpenWeather API key is missing!');
    console.error('Please set either NEXT_PUBLIC_OPENWEATHER_API_KEY or REACT_APP_OPENWEATHER_API_KEY environment variable.');
    console.error('For Next.js, use NEXT_PUBLIC_OPENWEATHER_API_KEY');
    throw new Error('OpenWeather API key not configured');
  }
  
  console.log('✅ OpenWeather API key found:', apiKey.substring(0, 8) + '...');
  return apiKey;
};

// Validate Google Pollen API key
const validateGooglePollenApiKey = () => {
  // Try both variable names for compatibility
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY || process.env.REACT_APP_GOOGLE_POLLEN_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ Google Pollen API key is missing!');
    console.warn('Please set either NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY or REACT_APP_GOOGLE_POLLEN_API_KEY environment variable for accurate pollen data.');
    return null;
  }
  
  console.log('✅ Google Pollen API key found:', apiKey.substring(0, 8) + '...');
  return apiKey;
};

/**
 * Convert wind degrees to 8-point compass direction
 * @param degrees - Wind direction in degrees (0-360)
 * @returns Compass direction abbreviation (N, NE, E, SE, S, SW, W, NW)
 */
const getCompassDirection = (degrees: number): string => {
  if (degrees < 0 || degrees > 360) {
    return 'N'; // Default fallback
  }
  
  // Normalize to 0-360 range
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  
  // 8-point compass system
  if (normalizedDegrees >= 337.5 || normalizedDegrees < 22.5) return 'N';
  if (normalizedDegrees >= 22.5 && normalizedDegrees < 67.5) return 'NE';
  if (normalizedDegrees >= 67.5 && normalizedDegrees < 112.5) return 'E';
  if (normalizedDegrees >= 112.5 && normalizedDegrees < 157.5) return 'SE';
  if (normalizedDegrees >= 157.5 && normalizedDegrees < 202.5) return 'S';
  if (normalizedDegrees >= 202.5 && normalizedDegrees < 247.5) return 'SW';
  if (normalizedDegrees >= 247.5 && normalizedDegrees < 292.5) return 'W';
  if (normalizedDegrees >= 292.5 && normalizedDegrees < 337.5) return 'NW';
  
  return 'N'; // Fallback
};

/**
 * Format Unix timestamp to readable time with timezone offset
 * This function properly handles timezone conversion for accurate local times
 * @param timestamp - Unix timestamp from OpenWeatherMap API
 * @param timezoneOffset - Timezone offset in seconds from UTC (optional)
 * @returns Formatted time string (e.g., "5:38 am", "8:14 pm")
 */
const formatTime = (timestamp: number, timezoneOffset?: number): string => {
  // Convert timestamp to milliseconds and apply timezone offset
  const utcTime = timestamp * 1000;
  const localTime = timezoneOffset ? utcTime + (timezoneOffset * 1000) : utcTime;
  
  const date = new Date(localTime);
  const hours = date.getUTCHours(); // Use UTC methods since we've already applied the offset
  const minutes = date.getUTCMinutes();
  
  // Convert to 12-hour format
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours >= 12 ? 'pm' : 'am';
  
  // Pad minutes with leading zero if needed
  const paddedMinutes = minutes.toString().padStart(2, '0');
  
  return `${displayHours}:${paddedMinutes} ${ampm}`;
};

/**
 * Calculate dew point from temperature and humidity using Magnus formula
 * @param tempF - Temperature in Fahrenheit
 * @param humidity - Relative humidity percentage (0-100)
 * @returns Dew point in Fahrenheit
 */
const calculateDewPoint = (tempF: number, humidity: number): number => {
  // Convert Fahrenheit to Celsius for calculation
  const tempC = (tempF - 32) * 5/9;
  
  // Magnus formula coefficients
  const a = 17.27;
  const b = 237.7;
  
  // Calculate alpha
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100);
  
  // Calculate dew point in Celsius
  const dewPointC = (b * alpha) / (a - alpha);
  
  // Convert back to Fahrenheit and round
  const dewPointF = (dewPointC * 9/5) + 32;
  
  return Math.round(dewPointF);
};

// Get UV Index description
const getUVDescription = (uvIndex: number): string => {
  if (uvIndex <= 2) return 'Low';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very High';
  return 'Extreme';
};

// Enhanced wind display formatting with proper unit handling
const formatWindDisplay = (speed: number, direction?: number, gust?: number, countryCode?: string): string => {
  // Determine unit system based on country
  const useMetric = shouldUseMetricUnits(countryCode || 'US');
  
  // Convert speed if needed (OpenWeatherMap returns in meters/sec by default, but we request imperial)
  // When using imperial units, API returns mph; when metric, it returns m/s
  let displaySpeed = speed;
  let speedUnit = useMetric ? 'km/h' : 'mph';
  
  // Format wind speed
  if (displaySpeed < 1) {
    return 'Calm';
  }
  
  let windString = '';
  
  // Add direction if available
  if (direction !== undefined) {
    const compassDirection = getCompassDirection(direction);
    windString += `${compassDirection} `;
  }
  
  // Add wind speed
  windString += `${Math.round(displaySpeed)} ${speedUnit}`;
  
  // Add gust information if significant
  if (gust && gust > speed * 1.2) {
    windString += ` (gusts ${Math.round(gust)} ${speedUnit})`;
  }
  
  return windString;
};

// Determine if country should use metric units
const shouldUseMetricUnits = (countryCode: string): boolean => {
  // Countries that primarily use imperial units
  const imperialCountries = ['US', 'LR', 'MM']; // US, Liberia, Myanmar
  return !imperialCountries.includes(countryCode);
};

// Temperature conversion functions
const celsiusToFahrenheit = (celsius: number): number => Math.round((celsius * 9/5) + 32);
const fahrenheitToCelsius = (fahrenheit: number): number => Math.round((fahrenheit - 32) * 5/9);

// Location-based unit detection
const isUSALocation = (country: string): boolean => country === 'US' || country === 'USA';
const shouldUseFahrenheit = (countryCode: string): boolean => isUSALocation(countryCode);

// Enhanced temperature formatting with proper unit handling
const formatTemperature = (temp: number, countryCode: string): { value: number; unit: string; display: string } => {
  console.log('Formatting temperature:', { temp, countryCode });
  const useF = shouldUseFahrenheit(countryCode);
  console.log('Using Fahrenheit:', useF);
  
  if (useF) {
    return {
      value: temp,
      unit: '°F',
      display: `${Math.round(temp)}°F`
    };
  } else {
    // Convert to Celsius if needed
    const tempC = fahrenheitToCelsius(temp);
    return {
      value: tempC,
      unit: '°C',
      display: `${tempC}°C`
    };
  }
};

// Normalize input by trimming whitespace and handling special characters
const normalizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[""'']/g, '"') // Normalize quotes
    .replace(/[–—]/g, '-'); // Normalize dashes
};

const parseLocationInput = (input: string): LocationQuery => {
  const cleanInput = normalizeInput(input);
  
  // Enhanced ZIP code patterns
  const usZipPattern = /^\d{5}(-\d{4})?$/; // US ZIP: 12345 or 12345-6789
  const ukPostcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i; // UK: SW1A 1AA
  const canadaPostalPattern = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i; // Canada: K1A 0A6
  const generalPostalPattern = /^[A-Z0-9]{3,10}$/i; // General international
  
  // Check for US ZIP code
  if (usZipPattern.test(cleanInput)) {
    return {
      query: cleanInput,
      type: 'zip',
      zipCode: cleanInput,
      country: 'US'
    };
  }
  
  // Check for UK postcode
  if (ukPostcodePattern.test(cleanInput)) {
    return {
      query: cleanInput,
      type: 'zip',
      zipCode: cleanInput.replace(/\s/g, ''), // Remove spaces for API
      country: 'GB'
    };
  }
  
  // Check for Canada postal code
  if (canadaPostalPattern.test(cleanInput)) {
    return {
      query: cleanInput,
      type: 'zip',
      zipCode: cleanInput.replace(/\s/g, ''), // Remove spaces for API
      country: 'CA'
    };
  }
  
  // Check for other international postal codes (as fallback)
  if (generalPostalPattern.test(cleanInput) && cleanInput.length >= 3) {
    return {
      query: cleanInput,
      type: 'zip',
      zipCode: cleanInput
      // No country specified - let API determine
    };
  }
  
  // Parse comma-separated formats
  if (cleanInput.includes(',')) {
    const parts = cleanInput.split(',').map(part => part.trim()).filter(part => part.length > 0);
    
    if (parts.length >= 2) {
      const [city, regionOrCountry, ...rest] = parts;
      
      // Clean city name (handle cities with special characters)
      const cleanCity = city.replace(/[^\w\s\-'.]/g, '').trim();
      
      if (!cleanCity) {
        return {
          query: cleanInput,
          type: 'city_only',
          city: cleanInput
        };
      }
      
      // US State patterns (comprehensive list)
      const usStateAbbreviations = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
        'DC' // District of Columbia
      ];
      
      const usStateNames = [
        'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',
        'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',
        'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana',
        'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota',
        'mississippi', 'missouri', 'montana', 'nebraska', 'nevada',
        'new hampshire', 'new jersey', 'new mexico', 'new york',
        'north carolina', 'north dakota', 'ohio', 'oklahoma', 'oregon',
        'pennsylvania', 'rhode island', 'south carolina', 'south dakota',
        'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington',
        'west virginia', 'wisconsin', 'wyoming', 'district of columbia'
      ];
      
      // Common country codes and names
      const countryCodes = [
        'US', 'GB', 'UK', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'JP', 'CN', 'IN',
        'BR', 'RU', 'MX', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI',
        'IE', 'PT', 'GR', 'TR', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SI',
        'SK', 'LT', 'LV', 'EE', 'IS', 'MT', 'CY', 'LU'
      ];
      
      const countryNames = [
        'united states', 'united kingdom', 'canada', 'australia', 'germany',
        'france', 'italy', 'spain', 'japan', 'china', 'india', 'brazil',
        'russia', 'mexico', 'netherlands', 'belgium', 'switzerland',
        'austria', 'sweden', 'norway', 'denmark', 'finland', 'ireland',
        'portugal', 'greece', 'turkey', 'poland', 'czech republic',
        'hungary', 'romania', 'bulgaria', 'croatia', 'slovenia', 'slovakia',
        'lithuania', 'latvia', 'estonia', 'iceland', 'malta', 'cyprus',
        'luxembourg'
      ];
      
      const regionOrCountryLower = regionOrCountry.toLowerCase();
      
      // Check if it's a US state
      const isUSState = usStateAbbreviations.includes(regionOrCountry.toUpperCase()) ||
                       usStateNames.includes(regionOrCountryLower);
      
      if (isUSState) {
        return {
          query: cleanInput,
          type: 'city_state',
          city: cleanCity,
          state: regionOrCountry,
          country: 'US'
        };
      }
      
      // Check if it's a known country code or name
      const isCountry = countryCodes.includes(regionOrCountry.toUpperCase()) ||
                       countryNames.includes(regionOrCountryLower);
      
      if (isCountry) {
        return {
          query: cleanInput,
          type: 'city_country',
          city: cleanCity,
          country: regionOrCountry
        };
      }
      
      // If we have a third part, assume middle is state/region and last is country
      if (rest.length > 0) {
        return {
          query: cleanInput,
          type: 'city_country',
          city: cleanCity,
          state: regionOrCountry,
          country: rest[0]
        };
      }
      
      // Default: assume it's city, country
      return {
        query: cleanInput,
        type: 'city_country',
        city: cleanCity,
        country: regionOrCountry
      };
    }
  }
  
  // Default: treat as city only
  const cleanCity = cleanInput.replace(/[^\w\s\-'.]/g, '').trim();
  return {
    query: cleanInput,
    type: 'city_only',
    city: cleanCity || cleanInput
  };
};

// Map OpenWeatherMap conditions to our custom condition names
const mapWeatherCondition = (condition: string): string => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('clear') || conditionLower.includes('sun')) return 'sunny';
  if (conditionLower.includes('cloud')) return 'cloudy';
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return 'rainy';
  if (conditionLower.includes('snow') || conditionLower.includes('sleet')) return 'snowy';
  if (conditionLower.includes('mist') || conditionLower.includes('fog')) return 'cloudy';
  if (conditionLower.includes('thunder')) return 'rainy';
  
  return 'sunny'; // default fallback
};

// Geocoding function to get coordinates from location
const geocodeLocation = async (locationQuery: LocationQuery, apiKey: string): Promise<{ lat: number; lon: number; displayName: string }> => {
  if (locationQuery.type === 'zip') {
    // Use ZIP code geocoding endpoint
    const zipQuery = locationQuery.country 
      ? `${locationQuery.zipCode},${locationQuery.country}`
      : locationQuery.zipCode;
    
    const response = await fetch(
      `${GEO_URL}/zip?zip=${encodeURIComponent(zipQuery!)}&appid=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('ZIP code not found. Please check the ZIP code and try again.');
    }
    
    const data = await response.json();
    return {
      lat: data.lat,
      lon: data.lon,
      displayName: `${data.name}, ${data.country}`
    };
  } else {
    // Use direct geocoding endpoint
    let query = locationQuery.city || locationQuery.query;
    
    if (locationQuery.state) {
      query += `,${locationQuery.state}`;
    }
    if (locationQuery.country) {
      query += `,${locationQuery.country}`;
    }
    
    const response = await fetch(
      `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=1&appid=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data: GeocodingResponse[] = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error(getLocationNotFoundError(locationQuery));
    }
    
    const location = data[0];
    const displayName = location.state 
      ? `${location.name}, ${location.state}, ${location.country}`
      : `${location.name}, ${location.country}`;
    
    return {
      lat: location.lat,
      lon: location.lon,
      displayName
    };
  }
};

// Moon phase calculation
interface MoonPhaseInfo {
  phase: string;
  illumination: number;
  emoji: string;
  phaseAngle: number;
}

const calculateMoonPhase = (): MoonPhaseInfo => {
  // Known new moon date: January 11, 2024
  const knownNewMoon = new Date('2024-01-11T11:57:00Z');
  const synodicMonth = 29.530588853; // Average length of lunar month in days
  
  const now = new Date();
  const daysSinceNewMoon = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const lunarAge = daysSinceNewMoon % synodicMonth;
  
  // Calculate phase angle (0-360 degrees)
  const phaseAngle = (lunarAge / synodicMonth) * 360;
  
  // Calculate illumination percentage
  const illumination = Math.round((1 - Math.cos((phaseAngle * Math.PI) / 180)) * 50);
  
  // Determine phase name and emoji
  let phase: string;
  let emoji: string;
  
  if (phaseAngle < 1 || phaseAngle > 359) {
    phase = 'New Moon';
    emoji = '🌑';
  } else if (phaseAngle < 90) {
    phase = 'Waxing Crescent';
    emoji = '🌒';
  } else if (phaseAngle < 91) {
    phase = 'First Quarter';
    emoji = '🌓';
  } else if (phaseAngle < 180) {
    phase = 'Waxing Gibbous';
    emoji = '🌔';
  } else if (phaseAngle < 181) {
    phase = 'Full Moon';
    emoji = '🌕';
  } else if (phaseAngle < 270) {
    phase = 'Waning Gibbous';
    emoji = '🌖';
  } else if (phaseAngle < 271) {
    phase = 'Last Quarter';
    emoji = '🌗';
  } else {
    phase = 'Waning Crescent';
    emoji = '🌘';
  }
  
  return {
    phase,
    illumination,
    emoji,
    phaseAngle
  };
};

// Process 5-day forecast data to extract daily high/low temperatures
const processDailyForecast = (forecastData: OpenWeatherMapForecastResponse, useFahrenheit: boolean) => {
  const dailyTemps: { [key: string]: { high: number; low: number; condition: string; description: string } } = {};
  
  forecastData.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
    
    if (!dailyTemps[date]) {
      dailyTemps[date] = {
        high: item.main.temp_max,
        low: item.main.temp_min,
        condition: item.weather[0].main,
        description: item.weather[0].description
      };
    } else {
      dailyTemps[date].high = Math.max(dailyTemps[date].high, item.main.temp_max);
      dailyTemps[date].low = Math.min(dailyTemps[date].low, item.main.temp_min);
    }
  });
  
  return Object.entries(dailyTemps).map(([day, data]) => ({
    day,
    highTemp: useFahrenheit ? Math.round(data.high) : fahrenheitToCelsius(data.high),
    lowTemp: useFahrenheit ? Math.round(data.low) : fahrenheitToCelsius(data.low),
    condition: mapWeatherCondition(data.condition),
    description: data.description
  }));
};

// Enhanced pressure formatting utilities with better regional support
const formatPressureByRegion = (pressureHPa: number, countryCode: string, userPreference?: 'hPa' | 'inHg'): string => {
  // Check user preference first, then fall back to regional default
  const useInchesOfMercury = userPreference === 'inHg' || (userPreference === undefined && shouldUseInchesOfMercury(countryCode));
  
  if (useInchesOfMercury) {
    // Convert hPa to inches of mercury using precise formula
    const pressureInHg = pressureHPa * 0.02953;
    return `${pressureInHg.toFixed(2)} in`;
  } else {
    // Use hPa/mb for international (most common worldwide)
    return `${Math.round(pressureHPa)} hPa`;
  }
};

// Determine if country should use inches of mercury
const shouldUseInchesOfMercury = (countryCode: string): boolean => {
  // Countries that primarily use inches of mercury for atmospheric pressure
  const inHgCountries = ['US', 'CA', 'PR', 'VI', 'GU', 'AS', 'MP']; // US, Canada, US territories
  return inHgCountries.includes(countryCode);
};

const getPressureUnit = (countryCode: string, userPreference?: 'hPa' | 'inHg'): 'hPa' | 'inHg' => {
  if (userPreference) return userPreference;
  return shouldUseInchesOfMercury(countryCode) ? 'inHg' : 'hPa';
};

const formatPressureValue = (pressureHPa: number, unit: 'hPa' | 'inHg'): { value: number; display: string } => {
  if (unit === 'inHg') {
    const pressureInHg = pressureHPa * 0.02953;
    return {
      value: pressureInHg,
      display: pressureInHg.toFixed(2)
    };
  } else {
    return {
      value: pressureHPa,
      display: Math.round(pressureHPa).toString()
    };
  }
};

// Add UV Index API endpoint with detailed debugging
const fetchUVIndex = async (lat: number, lon: number, apiKey: string): Promise<number> => {
  console.log('=== UV INDEX NIGHTTIME DEBUG ===');
  console.log('Coordinates:', { lat, lon });
  
  try {
    // First, get current weather data to determine if it's day or night
    const currentWeatherUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    console.log('Getting current weather for UV calculation:', currentWeatherUrl);
    
    const currentResponse = await fetch(currentWeatherUrl);
    if (!currentResponse.ok) {
      console.error('Current weather API failed for UV calculation:', currentResponse.status);
      return 0;
    }
    
    const currentData = await currentResponse.json();
    console.log('Current weather data for UV calculation:', currentData);
    
    // Extract sunrise, sunset, and timezone data
    const sunrise = currentData.sys.sunrise;
    const sunset = currentData.sys.sunset;
    const timezone = currentData.timezone;
    const currentTime = currentData.dt;
    
    console.log('Sunrise timestamp:', sunrise);
    console.log('Sunset timestamp:', sunset);
    console.log('Current time timestamp:', currentTime);
    console.log('Timezone offset (seconds):', timezone);
    
    // Calculate local times
    const localCurrentTime = currentTime + timezone;
    const localSunrise = sunrise + timezone;
    const localSunset = sunset + timezone;
    
    console.log('Local current time:', new Date(localCurrentTime * 1000).toLocaleString('en-US', {timeZone: 'UTC'}));
    console.log('Local sunrise time:', new Date(localSunrise * 1000).toLocaleString('en-US', {timeZone: 'UTC'}));
    console.log('Local sunset time:', new Date(localSunset * 1000).toLocaleString('en-US', {timeZone: 'UTC'}));
    
    // Check if it's currently day or night
    const isDaytime = localCurrentTime >= localSunrise && localCurrentTime <= localSunset;
    console.log('Is currently daytime?', isDaytime);
    
    // If it's nighttime, return 0 immediately
    if (!isDaytime) {
      console.log('UV Index: 0 (nighttime)');
      return 0;
    }
    
    // If it's daytime, fetch the actual UV index
    console.log('Fetching UV Index for daytime...');
    const uvApiUrl = `${BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    console.log('UV API URL:', uvApiUrl);
    
    const response = await fetch(uvApiUrl);
    console.log('UV API Response Status:', response.status);
    
    if (!response.ok) {
      console.error('UV Index API failed:', response.status, response.statusText);
      
      // Try alternative endpoint for UV Index
      const altUvUrl = `${BASE_URL_V3}/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily,alerts&appid=${apiKey}`;
      console.log('Trying alternative UV API URL:', altUvUrl);
      
      const altResponse = await fetch(altUvUrl);
      if (altResponse.ok) {
        const altData = await altResponse.json();
        console.log('Alternative UV API Response:', altData);
        const uvIndex = altData.current?.uvi || 0;
        console.log('Alternative UV Index value:', uvIndex);
        return Math.round(uvIndex);
      }
      
      return 0;
    }
    
    const data = await response.json();
    console.log('UV API Response Data:', data);
    
    // Check both possible properties for UV index
    const uvIndex = data.value || data.uvi || 0;
    console.log('UV Index value:', uvIndex);
    
    if (!uvIndex) {
      console.error('UV Index not found in response');
      return 0;
    }
    
    const roundedUV = Math.round(uvIndex);
    console.log('Final UV Index (rounded):', roundedUV);
    return roundedUV;
    
  } catch (error) {
    console.error('UV Index API error:', error);
    return 0;
  }
};

// Add Pollen API endpoint with better debugging
const fetchPollenData = async (lat: number, lon: number, openWeatherApiKey: string): Promise<{ tree: number; grass: number; weed: number }> => {
  console.log('=== POLLEN DATA DEBUG ===');
  console.log('Coordinates:', { lat, lon });
  
  // Try Google Pollen API first if available
  const googlePollenApiKey = validateGooglePollenApiKey();
  
  if (googlePollenApiKey) {
    try {
      console.log('Attempting to fetch pollen data from Google Pollen API...');
      // Google Pollen API endpoint (this is a placeholder - actual endpoint may vary)
      const googlePollenUrl = `https://pollen.googleapis.com/v1/pollen?location=${lat},${lon}&key=${googlePollenApiKey}`;
      console.log('Google Pollen API URL:', googlePollenUrl);
      
      const response = await fetch(googlePollenUrl);
      console.log('Google Pollen API Response Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Google Pollen API Response Data:', data);
        
        // Extract pollen data from Google API response
        // Note: This structure may need adjustment based on actual Google Pollen API response
        const pollenData = {
          tree: data.tree_pollen_count || 0,
          grass: data.grass_pollen_count || 0,
          weed: data.weed_pollen_count || 0
        };
        console.log('Processed Google pollen counts:', pollenData);
        return pollenData;
      } else {
        console.warn('Google Pollen API failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('Google Pollen API error:', error);
    }
  }
  
  // Fallback to OpenWeather Air Pollution API
  console.log('Falling back to OpenWeather Air Pollution API for basic air quality data...');
  try {
    const pollenUrl = `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`;
    console.log('OpenWeather Air Pollution API URL:', pollenUrl);
    
    const response = await fetch(pollenUrl);
    console.log('OpenWeather Air Pollution API Response Status:', response.status);
    
    if (!response.ok) {
      console.warn('OpenWeather Air Pollution API failed:', response.status, response.statusText);
      return { tree: 0, grass: 0, weed: 0 };
    }
    
    const data = await response.json();
    console.log('OpenWeather Air Pollution API Response Data:', data);
    
    // Extract air quality data from OpenWeather response
    // Note: OpenWeather doesn't provide specific pollen data, so we use air quality metrics as fallback
    const pollenData = {
      tree: data.components?.pm10 || 0,
      grass: data.components?.pm2_5 || 0,
      weed: data.components?.co || 0
    };
    console.log('Processed air quality data (pollen fallback):', pollenData);
    console.log('Note: Using air quality data as pollen fallback. For accurate pollen data, set REACT_APP_GOOGLE_POLLEN_API_KEY.');
    
    return pollenData;
  } catch (error) {
    console.warn('OpenWeather Air Pollution API error:', error);
    return { tree: 0, grass: 0, weed: 0 };
  }
};

export const fetchWeatherData = async (locationInput: string, apiKey: string): Promise<WeatherData> => {
  console.log('Fetching weather data for:', locationInput);
  
  try {
    // Validate API key
    const validApiKey = validateApiKey();
    
    // Parse location input
    const locationQuery = parseLocationInput(locationInput);
    console.log('Parsed location query:', locationQuery);

    // Geocode location
    const { lat, lon, displayName } = await geocodeLocation(locationQuery, validApiKey);
    console.log('Geocoded location:', { lat, lon, displayName });

    // Fetch current weather
    const currentWeatherUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${validApiKey}&units=imperial`;
    console.log('Fetching current weather from:', currentWeatherUrl);
    
    const currentWeatherResponse = await fetch(currentWeatherUrl);
    if (!currentWeatherResponse.ok) {
      throw new Error(`Current weather API call failed: ${currentWeatherResponse.status}`);
    }
    const currentWeatherData = await currentWeatherResponse.json();
    console.log('Current weather response:', currentWeatherData);

    // Fetch forecast
    const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${validApiKey}&units=imperial`;
    console.log('Fetching forecast from:', forecastUrl);
    
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API call failed: ${forecastResponse.status}`);
    }
    const forecastData = await forecastResponse.json();
    console.log('Forecast response:', forecastData);

    // Process and validate data
    const countryCode = currentWeatherData.sys.country;
    const useFahrenheit = shouldUseFahrenheit(countryCode);
    console.log('Using Fahrenheit:', useFahrenheit);

    // Format temperature with proper unit handling
    const temp = formatTemperature(currentWeatherData.main.temp, countryCode);
    console.log('Formatted temperature:', temp);

    // Process forecast data
    const forecast = processDailyForecast(forecastData, useFahrenheit);
    console.log('Processed forecast:', forecast);

    // Calculate moon phase
    const moonPhase = calculateMoonPhase();
    console.log('Moon phase:', moonPhase);

    // Fetch UV Index with debugging
    console.log('=== FETCHING UV INDEX ===');
    const uvIndex = await fetchUVIndex(lat, lon, validApiKey);
    console.log('UV Index fetched:', uvIndex);

    // Fetch Pollen data
    const pollenData = await fetchPollenData(lat, lon, validApiKey);
    console.log('Weather Data - Pollen:', pollenData);

    // Construct weather data object
    const weatherData: WeatherData = {
      location: displayName,
      country: countryCode,
      temperature: temp.value,
      unit: temp.unit,
      condition: currentWeatherData.weather[0].main,
      description: currentWeatherData.weather[0].description,
      humidity: currentWeatherData.main.humidity,
      wind: {
        speed: currentWeatherData.wind.speed,
        direction: currentWeatherData.wind.deg ? getCompassDirection(currentWeatherData.wind.deg) : undefined,
        gust: currentWeatherData.wind.gust
      } as WindData,
      pressure: formatPressureByRegion(currentWeatherData.main.pressure, countryCode),
      sunrise: formatTime(currentWeatherData.sys.sunrise, currentWeatherData.timezone),
      sunset: formatTime(currentWeatherData.sys.sunset, currentWeatherData.timezone),
      forecast: forecast,
      moonPhase: moonPhase,
      uvIndex,
      aqi: 0, // Placeholder - will be updated if available
      pollen: pollenData,
    };

    console.log('Final weather data:', weatherData);
    return weatherData;

  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Generate helpful error messages based on location type
const getLocationNotFoundError = (locationQuery: LocationQuery): string => {
  switch (locationQuery.type) {
    case 'zip':
      return 'ZIP/Postal code not found. Please check the code and try again.';
    case 'city_state':
      return 'City/State combination not found. Try "City, State" format (e.g., "New York, NY").';
    case 'city_country':
      return 'City/Country combination not found. Try "City, Country" format (e.g., "London, UK").';
    case 'city_only':
      return 'City not found. Try including state/country (e.g., "Paris, France").';
    default:
      return 'Location not found. Please check the spelling and try again.';
  }
};

// Function to get user's location and fetch weather
export const fetchWeatherByLocation = async (coords: string): Promise<WeatherData> => {
  const apiKey = validateApiKey();
  const [latitude, longitude] = coords.split(',').map(Number)
  
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid coordinates')
  }

  try {
    // Fetch current weather
    const currentWeatherUrl = `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
    console.log('Fetching current weather from:', currentWeatherUrl)
    
    const currentWeatherResponse = await fetch(currentWeatherUrl)
    if (!currentWeatherResponse.ok) {
      throw new Error(`Current weather API call failed: ${currentWeatherResponse.status}`)
    }
    const currentWeatherData = await currentWeatherResponse.json()
    console.log('Current weather response:', currentWeatherData)

    // Fetch forecast
    const forecastUrl = `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
    console.log('Fetching forecast from:', forecastUrl)
    
    const forecastResponse = await fetch(forecastUrl)
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API call failed: ${forecastResponse.status}`)
    }
    const forecastData = await forecastResponse.json()
    console.log('Forecast response:', forecastData)

    // Process and validate data
    const countryCode = currentWeatherData.sys.country
    const useFahrenheit = shouldUseFahrenheit(countryCode)
    console.log('Using Fahrenheit:', useFahrenheit)

    // Format temperature with proper unit handling
    const temp = formatTemperature(currentWeatherData.main.temp, countryCode)
    console.log('Formatted temperature:', temp)

    // Process forecast data
    const forecast = processDailyForecast(forecastData, useFahrenheit)
    console.log('Processed forecast:', forecast)

    // Calculate moon phase
    const moonPhase = calculateMoonPhase()
    console.log('Moon phase:', moonPhase)

    // Construct weather data object
    const weatherData: WeatherData = {
      location: `${currentWeatherData.name}, ${currentWeatherData.sys.country}`,
      country: countryCode,
      temperature: temp.value,
      unit: temp.unit,
      condition: currentWeatherData.weather[0].main,
      description: currentWeatherData.weather[0].description,
      humidity: currentWeatherData.main.humidity,
      wind: {
        speed: currentWeatherData.wind.speed,
        direction: currentWeatherData.wind.deg ? getCompassDirection(currentWeatherData.wind.deg) : undefined,
        gust: currentWeatherData.wind.gust
      },
      pressure: formatPressureByRegion(currentWeatherData.main.pressure, countryCode),
      sunrise: formatTime(currentWeatherData.sys.sunrise, currentWeatherData.timezone),
      sunset: formatTime(currentWeatherData.sys.sunset, currentWeatherData.timezone),
      forecast: forecast,
      moonPhase: moonPhase,
      uvIndex: 0, // Placeholder - will be updated if available
      aqi: 0, // Placeholder - will be updated if available
      pollen: {
        tree: 0,
        grass: 0,
        weed: 0
      }
    }

    console.log('Final weather data:', weatherData)
    return weatherData

  } catch (error) {
    console.error('Error fetching weather data:', error)
    throw error
  }
} 