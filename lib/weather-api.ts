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

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const BASE_URL_V3 = 'https://api.openweathermap.org/data/3.0';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

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

// Enhanced temperature formatting
const formatTemperature = (temp: number, countryCode: string): { value: number; unit: string; display: string } => {
  const useMetric = shouldUseMetricUnits(countryCode);
  
  if (useMetric) {
    // Convert Fahrenheit to Celsius if needed
    const tempC = (temp - 32) * 5/9;
    return {
      value: tempC,
      unit: '°C',
      display: `${Math.round(tempC)}°C`
    };
  } else {
    return {
      value: temp,
      unit: '°F', 
      display: `${Math.round(temp)}°F`
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
const processDailyForecast = (forecastData: OpenWeatherMapForecastResponse) => {
  const dailyData: { [key: string]: { 
    temps: number[]; 
    conditions: string[]; 
    descriptions: string[]; 
    date: Date;
  } } = {};

  // Group forecast data by day
  forecastData.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toDateString(); // Use date string as key
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        temps: [],
        conditions: [],
        descriptions: [],
        date: date
      };
    }
    
    dailyData[dateKey].temps.push(item.main.temp);
    dailyData[dateKey].conditions.push(item.weather[0].main);
    dailyData[dateKey].descriptions.push(item.weather[0].description);
  });

  // Convert to forecast array, excluding today and taking next 5 days
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const today = new Date().toDateString();
  
  return Object.entries(dailyData)
    .filter(([dateKey]) => dateKey !== today) // Exclude today
    .slice(0, 5) // Take next 5 days
    .map(([dateKey, data]) => {
      const highTemp = Math.round(Math.max(...data.temps));
      const lowTemp = Math.round(Math.min(...data.temps));
      
      // Use the most common condition for the day
      const conditionCounts: { [key: string]: number } = {};
      data.conditions.forEach(condition => {
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
      });
      const dominantCondition = Object.entries(conditionCounts)
        .sort(([,a], [,b]) => b - a)[0][0];
      
      // Use the first description for the dominant condition
      const conditionIndex = data.conditions.findIndex(c => c === dominantCondition);
      const description = data.descriptions[conditionIndex];
      
      return {
        day: dayNames[data.date.getDay()],
        highTemp,
        lowTemp,
        condition: mapWeatherCondition(dominantCondition),
        description
      };
    });
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

// Enhanced UV Index fetching with time-aware logic
const fetchCurrentWeatherData = async (lat: number, lon: number, apiKey: string): Promise<{ uvIndex: number; uvDescription: string }> => {
  try {
    // Use One Call API 3.0 which includes real-time UV Index
    const oneCallResponse = await fetch(
      `${BASE_URL_V3}/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&exclude=minutely,daily,alerts`
    );

    if (!oneCallResponse.ok) {
      console.warn('Failed to fetch UV Index from One Call API 3.0 - Status:', oneCallResponse.status);
      return { uvIndex: 0, uvDescription: 'N/A' };
    }

    const oneCallData = await oneCallResponse.json();
    
    // Get UV Index from One Call API 3.0 current data
    const uvIndex = Math.round(oneCallData.current?.uvi || 0);
    const uvDescription = getUVDescription(uvIndex);
    
    return { uvIndex, uvDescription };
  } catch (error) {
    console.warn('Failed to fetch UV Index from One Call API 3.0:', error);
    return { uvIndex: 0, uvDescription: 'N/A' };
  }
};

export const fetchWeatherData = async (locationInput: string, apiKey: string): Promise<WeatherData> => {
  if (!apiKey) {
    throw new Error('API key is required')
  }

  // Check cache first
  const cached = getCachedWeatherData()
  if (cached.data && cached.location === locationInput && !cached.isStale) {
    return cached.data
  }

  const locationQuery = parseLocationInput(locationInput)
  
  try {
    // Deduplicate geocoding requests
    const { lat, lon, displayName } = await deduplicateRequest(
      `geocode_${locationInput}`,
      () => geocodeLocation(locationQuery, apiKey)
    )
    
    // Deduplicate weather data requests
    const currentData = await deduplicateRequest(
      `current_${lat}_${lon}`,
      () => withRetry(async () => {
        const response = await fetch(
          `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
        )

        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`)
        }

        return response.json()
      })
    )

    // Deduplicate forecast requests
    const forecastData = await deduplicateRequest(
      `forecast_${lat}_${lon}`,
      () => withRetry(async () => {
        const response = await fetch(
          `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
        )

        if (!response.ok) {
          throw new Error(`Forecast API error: ${response.status}`)
        }

        return response.json()
      })
    )

    // Process forecast data to get daily high/low temperatures
    const dailyForecasts = processDailyForecast(forecastData)

    // Calculate current moon phase
    const moonPhase = calculateMoonPhase()

    // Fetch UV Index data with retry
    const { uvIndex, uvDescription } = await withRetry(() => 
      fetchCurrentWeatherData(lat, lon, apiKey)
    )

    const weatherData: WeatherData = {
      current: {
        temp: Math.round(currentData.main.temp),
        condition: mapWeatherCondition(currentData.weather[0].main),
        humidity: currentData.main.humidity,
        wind: Math.round(currentData.wind.speed),
        windDirection: currentData.wind.deg,
        windDisplay: formatWindDisplay(currentData.wind.speed, currentData.wind.deg, currentData.wind.gust, currentData.sys.country),
        location: displayName,
        description: currentData.weather[0].description,
        sunrise: currentData.sys.sunrise ? formatTime(currentData.sys.sunrise, currentData.timezone) : 'N/A',
        sunset: currentData.sys.sunset ? formatTime(currentData.sys.sunset, currentData.timezone) : 'N/A',
        dewPoint: calculateDewPoint(currentData.main.temp, currentData.main.humidity),
        uvIndex,
        uvDescription,
        pressure: currentData.main.pressure,
        pressureDisplay: formatPressureByRegion(currentData.main.pressure, currentData.sys.country),
        country: currentData.sys.country,
        lat,
        lon
      },
      forecast: dailyForecasts,
      moonPhase
    }

    // Cache the weather data
    cacheWeatherData(locationInput, weatherData)

    return weatherData
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch weather data. Please try again.')
  }
}

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
export const fetchWeatherByLocation = async (apiKey: string): Promise<WeatherData> => {
  if (!apiKey) {
    throw new Error('API key is required')
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Deduplicate current weather request
          const currentData = await deduplicateRequest(
            `current_${latitude}_${longitude}`,
            () => withRetry(async () => {
              const response = await fetch(
                `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
              )

              if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`)
              }

              return response.json()
            })
          )
          
          // Deduplicate forecast request
          const forecastData = await deduplicateRequest(
            `forecast_${latitude}_${longitude}`,
            () => withRetry(async () => {
              const response = await fetch(
                `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
              )

              if (!response.ok) {
                throw new Error(`Forecast API error: ${response.status}`)
              }

              return response.json()
            })
          )

          // Process forecast data
          const dailyForecasts = processDailyForecast(forecastData)

          // Fetch UV Index data with retry
          const { uvIndex, uvDescription } = await withRetry(() => 
            fetchCurrentWeatherData(latitude, longitude, apiKey)
          )

          const weatherData: WeatherData = {
            current: {
              temp: Math.round(currentData.main.temp),
              condition: mapWeatherCondition(currentData.weather[0].main),
              humidity: currentData.main.humidity,
              wind: Math.round(currentData.wind.speed),
              windDirection: currentData.wind.deg,
              windDisplay: formatWindDisplay(currentData.wind.speed, currentData.wind.deg, currentData.wind.gust, currentData.sys.country),
              location: `${currentData.name}, ${currentData.sys.country}`,
              description: currentData.weather[0].description,
              sunrise: currentData.sys.sunrise ? formatTime(currentData.sys.sunrise, currentData.timezone) : 'N/A',
              sunset: currentData.sys.sunset ? formatTime(currentData.sys.sunset, currentData.timezone) : 'N/A',
              dewPoint: calculateDewPoint(currentData.main.temp, currentData.main.humidity),
              uvIndex,
              uvDescription,
              pressure: currentData.main.pressure,
              pressureDisplay: formatPressureByRegion(currentData.main.pressure, currentData.sys.country),
              country: currentData.sys.country,
              lat: latitude,
              lon: longitude
            },
            forecast: dailyForecasts,
            moonPhase: calculateMoonPhase()
          }

          // Cache the weather data
          cacheWeatherData(weatherData.current.location, weatherData)

          resolve(weatherData)
        } catch (error) {
          reject(error)
        }
      },
      (error) => {
        let errorMessage = 'Failed to get your location.'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enter a location manually.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }
        
        reject(new Error(errorMessage))
      },
      {
        timeout: 10000, // 10 seconds timeout
      }
    )
  })
} 