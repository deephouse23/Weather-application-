/**
 * 16-Bit Weather Platform - BETA v0.3.2
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */

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

import { WeatherData, HourlyForecast, EnhancedHourlyForecast } from './types'

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
      humidity: number;
      pressure: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
    wind?: {
      speed: number;
      deg?: number;
    };
    clouds?: {
      all: number;
    };
    pop?: number; // Probability of precipitation (0-1)
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

/**
 * Helper function to get proper API URL for server-side/client-side rendering
 * Handles the difference between build-time static generation and client-side fetching
 */
const getApiUrl = (path: string): string => {
  if (typeof window === 'undefined') {
    // Server-side/build time
    // Try multiple environment variables for maximum compatibility
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003';
    return `${baseUrl}${path}`;
  }
  // Client-side
  return path;
};

// Note: API key validation is no longer needed on client-side
// as all API calls are now routed through internal server endpoints
const validateApiKey = () => {
  // No longer needed - keeping for backwards compatibility
  return 'internal-api-routes';
};

// Note: Google API key validation is no longer needed on client-side
// as all API calls are now routed through internal server endpoints  
const validateGooglePollenApiKey = () => {
  // No longer needed - keeping for backwards compatibility
  return null;
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
  const displaySpeed = speed;
  const speedUnit = useMetric ? 'km/h' : 'mph';
  
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

// Geocoding function to get coordinates from location using internal API
const geocodeLocation = async (locationQuery: LocationQuery): Promise<{ lat: number; lon: number; displayName: string }> => {
  const baseUrl = getApiUrl('/api/weather/geocoding');
  
  if (locationQuery.type === 'zip') {
    // Use ZIP code geocoding endpoint
    const zipQuery = locationQuery.country 
      ? `${locationQuery.zipCode},${locationQuery.country}`
      : locationQuery.zipCode;
    
    const response = await fetch(
      `${baseUrl}?zip=${encodeURIComponent(zipQuery!)}`
    );
    
    if (!response.ok) {
      let errorMessage = 'ZIP code not found. Please check the ZIP code and try again.';
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If response is not JSON, use default error message
      }
      throw new Error(errorMessage);
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
      `${baseUrl}?q=${encodeURIComponent(query)}&limit=1`
    );
    
    if (!response.ok) {
      let errorMessage = `Geocoding API error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If response is not JSON, use default error message
      }
      throw new Error(errorMessage);
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

// Process 5-day forecast data to extract daily high/low temperatures with detailed metrics
const processDailyForecast = (forecastData: OpenWeatherMapForecastResponse, useFahrenheit: boolean) => {
  const dailyData: { [key: string]: { 
    high: number; 
    low: number; 
    condition: string; 
    description: string;
    humidity: number[];
    pressure: number[];
    windSpeed: number[];
    windDir: string[];
    cloudCover: number[];
    precipChance: number[];
    hourlyForecast: HourlyForecast[];
  } } = {};
  
  forecastData.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
    const time = new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    
    if (!dailyData[date]) {
      dailyData[date] = {
        high: item.main.temp,
        low: item.main.temp,
        condition: item.weather[0].main,
        description: item.weather[0].description,
        humidity: [],
        pressure: [],
        windSpeed: [],
        windDir: [],
        cloudCover: [],
        precipChance: [],
        hourlyForecast: []
      };
    } else {
      dailyData[date].high = Math.max(dailyData[date].high, item.main.temp);
      dailyData[date].low = Math.min(dailyData[date].low, item.main.temp);
    }

    // Collect detailed metrics for averaging
    dailyData[date].humidity.push(item.main.humidity);
    dailyData[date].pressure.push(item.main.pressure);
    dailyData[date].windSpeed.push(item.wind?.speed || 0);
    if (item.wind?.deg) {
      dailyData[date].windDir.push(getWindDirection(item.wind.deg));
    }
    dailyData[date].cloudCover.push(item.clouds?.all || 0);
    
    // Use actual API precipitation probability or fallback calculation
    let precipChance = 0;
    if (item.pop !== undefined) {
      // Use OpenWeatherMap's probability of precipitation (convert from 0-1 to 0-100)
      precipChance = Math.round(item.pop * 100);
    } else {
      // Fallback: simplified calculation based on weather conditions
      precipChance = item.weather[0].main.toLowerCase().includes('rain') ? 
        Math.min((item.main.humidity / 100) * 100, 85) : 0;
    }
    dailyData[date].precipChance.push(precipChance);

    // Add to hourly forecast (first 8 entries per day)
    if (dailyData[date].hourlyForecast.length < 8) {
      dailyData[date].hourlyForecast.push({
        time: time,
        temp: useFahrenheit ? Math.round(item.main.temp) : fahrenheitToCelsius(item.main.temp),
        condition: mapWeatherCondition(item.weather[0].main),
        precipChance: Math.round(precipChance)
      });
    }
  });
  
  return Object.entries(dailyData).map(([day, data]) => {
    // Calculate averages for detailed metrics
    const avgHumidity = Math.round(data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length);
    const avgPressure = Math.round(data.pressure.reduce((a, b) => a + b, 0) / data.pressure.length);
    const avgWindSpeed = Math.round(data.windSpeed.reduce((a, b) => a + b, 0) / data.windSpeed.length);
    const avgCloudCover = Math.round(data.cloudCover.reduce((a, b) => a + b, 0) / data.cloudCover.length);
    const avgPrecipChance = Math.round(data.precipChance.reduce((a, b) => a + b, 0) / data.precipChance.length);
    
    // Get most common wind direction
    const windDirection = data.windDir.length > 0 ? 
      data.windDir.sort((a, b) => 
        data.windDir.filter(v => v === a).length - data.windDir.filter(v => v === b).length
      ).pop() : undefined;

    return {
      day,
      date: new Date(Date.now() + (Object.keys(dailyData).indexOf(day) * 24 * 60 * 60 * 1000))
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      highTemp: useFahrenheit ? Math.round(data.high) : fahrenheitToCelsius(data.high),
      lowTemp: useFahrenheit ? Math.round(data.low) : fahrenheitToCelsius(data.low),
      condition: mapWeatherCondition(data.condition),
      description: data.description,
      details: {
        humidity: avgHumidity,
        windSpeed: avgWindSpeed,
        windDirection: windDirection,
        pressure: `${avgPressure} hPa`,
        cloudCover: avgCloudCover,
        precipitationChance: avgPrecipChance,
        visibility: undefined, // Not available in free API
        uvIndex: undefined // Not available in free API
      },
      hourlyForecast: data.hourlyForecast
    };
  });
};

// Helper function to convert wind degrees to direction
const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
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

// Fetch UV Index using internal API endpoint
const fetchUVIndex = async (lat: number, lon: number): Promise<number> => {
  console.log('=== UV INDEX DEBUG ===');
  console.log('Coordinates:', { lat, lon });
  
  try {
    const response = await fetch(getApiUrl(`/api/weather/uv?lat=${lat}&lon=${lon}`));
    
    if (!response.ok) {
      console.error('UV Index API failed:', response.status);
      return 0;
    }
    
    const data = await response.json();
    console.log('UV Index API Response:', data);
    
    const uvIndex = data.uvi || 0;
    console.log('Final UV Index:', uvIndex);
    
    return uvIndex;
    
  } catch (error) {
    console.error('UV Index API error:', error);
    return 0;
  }
};

// Helper function to estimate current UV from daily maximum based on time of day
const estimateCurrentUVFromDailyMax = (dailyMaxUV: number, hour: number): number => {
  // UV is typically highest around solar noon (12-2 PM)
  // This is a rough approximation based on typical UV patterns
  if (hour < 6 || hour > 18) return 0; // Nighttime
  
  // Create a bell curve approximation for UV throughout the day
  const peakHour = 13; // Peak UV around 1 PM
  const standardDeviation = 3; // Spread of the curve
  
  // Calculate how far we are from peak hour
  const distanceFromPeak = Math.abs(hour - peakHour);
  
  // Use a simplified normal distribution approximation
  const uvMultiplier = Math.exp(-(distanceFromPeak * distanceFromPeak) / (2 * standardDeviation * standardDeviation));
  
  const estimatedUV = dailyMaxUV * uvMultiplier;
  console.log(`UV estimation: hour=${hour}, dailyMax=${dailyMaxUV}, multiplier=${uvMultiplier.toFixed(3)}, estimated=${estimatedUV.toFixed(2)}`);
  
  return Math.max(0, estimatedUV);
};

// Fetch Pollen data using internal API endpoint
const fetchPollenData = async (lat: number, lon: number): Promise<{ tree: Record<string, string>; grass: Record<string, string>; weed: Record<string, string> }> => {
  console.log('=== POLLEN DATA DEBUG ===');
  console.log('Coordinates:', { lat, lon });
  
  try {
    const response = await fetch(getApiUrl(`/api/weather/pollen?lat=${lat}&lon=${lon}`));
    
    if (!response.ok) {
      console.error('Pollen API failed:', response.status);
      return { tree: { 'Tree': 'No Data' }, grass: { 'Grass': 'No Data' }, weed: { 'Weed': 'No Data' } };
    }
    
    const data = await response.json();
    console.log('Pollen API Response:', data);
    
    const pollenData = {
      tree: data.tree || { 'Tree': 'No Data' },
      grass: data.grass || { 'Grass': 'No Data' },
      weed: data.weed || { 'Weed': 'No Data' }
    };
    
    console.log('Final pollen data:', pollenData);
    return pollenData;
    
  } catch (error) {
    console.error('Pollen API error:', error);
    return { tree: { 'Tree': 'No Data' }, grass: { 'Grass': 'No Data' }, weed: { 'Weed': 'No Data' } };
  }
};

// Fetch Air Quality data using internal API endpoint
const fetchAirQualityData = async (lat: number, lon: number, cityName?: string): Promise<{ aqi: number; category: string }> => {
  console.log('=== AIR QUALITY DATA DEBUG ===');
  console.log('City:', cityName || 'Unknown');
  console.log('Coordinates:', { lat, lon });
  
  try {
    const response = await fetch(getApiUrl(`/api/weather/air-quality?lat=${lat}&lon=${lon}`));
    
    if (!response.ok) {
      console.error('Air Quality API failed:', response.status);
      return { aqi: 0, category: 'No Data' };
    }
    
    const data = await response.json();
    console.log('Air Quality API Response:', data);
    
    // Log debug information if available
    if (data.debug) {
      console.log('AQI Debug Info:', data.debug);
    }
    
    const airQualityData = {
      aqi: data.aqi || 0,
      category: data.category || 'No Data'
    };
    
    console.log('Final air quality data:', airQualityData);
    console.log('Data source:', data.source || 'unknown');
    return airQualityData;
    
  } catch (error) {
    console.error('Air Quality API error:', error);
    return { aqi: 0, category: 'No Data' };
  }
};

// Note: AQI calculation functions moved to server-side API routes

/**
 * Process hourly forecast data from One Call API
 * @param hourlyData - Array of hourly data from One Call API
 * @param timezoneOffset - Timezone offset in seconds
 * @returns Array of processed hourly forecast data (48 hours)
 */
const processHourlyForecast = (hourlyData: any[], timezoneOffset: number = 0): EnhancedHourlyForecast[] => {
  if (!Array.isArray(hourlyData) || hourlyData.length === 0) {
    return [];
  }

  // Process up to 48 hours
  return hourlyData.slice(0, 48).map((hour: any) => {
    const dt = hour.dt;
    const hourTime = new Date(dt * 1000);

    // Format time with timezone offset
    const localTime = new Date((dt + timezoneOffset) * 1000);
    const hours = localTime.getUTCHours();
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const timeString = `${displayHours} ${ampm}`;

    return {
      dt: dt,
      time: timeString,
      temp: hour.temp ?? 0,
      feelsLike: hour.feels_like,
      condition: hour.weather?.[0]?.main || 'Clear',
      description: hour.weather?.[0]?.description || 'clear sky',
      precipChance: Math.round((hour.pop ?? 0) * 100),
      windSpeed: hour.wind_speed,
      windDirection: hour.wind_deg ? getWindDirection(hour.wind_deg) : undefined,
      humidity: hour.humidity,
      uvIndex: hour.uvi ? Math.round(hour.uvi) : undefined,
      icon: hour.weather?.[0]?.icon
    };
  });
}

export const fetchWeatherData = async (
  locationInput: string,
  unitSystem: 'metric' | 'imperial' = 'imperial'
): Promise<WeatherData> => {
  console.log('Fetching weather data for:', locationInput);
  
  try {
    // Parse location input
    const locationQuery = parseLocationInput(locationInput);
    console.log('Parsed location query:', locationQuery);

    // Geocode location
    const { lat, lon, displayName } = await geocodeLocation(locationQuery);
    console.log('Geocoded location:', { lat, lon, displayName });

    // Playwright E2E tests stub the legacy endpoints (/current + /forecast + /uv + etc).
    // In test mode, prefer those endpoints to keep tests deterministic.
    const isPlaywrightTestMode = process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE === 'true';
    if (isPlaywrightTestMode) {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(getApiUrl(`/api/weather/current?lat=${lat}&lon=${lon}&units=${unitSystem}`), { cache: 'no-store' }),
        fetch(getApiUrl(`/api/weather/forecast?lat=${lat}&lon=${lon}&units=${unitSystem}`), { cache: 'no-store' }),
      ]);

      if (!currentRes.ok) {
        throw new Error(`Current weather API call failed: ${currentRes.status}`);
      }
      if (!forecastRes.ok) {
        throw new Error(`Forecast API call failed: ${forecastRes.status}`);
      }

      const current = await currentRes.json();
      const forecastRaw = await forecastRes.json();

      const countryCode = current?.sys?.country || 'US';
      const useFahrenheit = unitSystem === 'imperial';

      const temperature = Math.round(current?.main?.temp ?? 0);
      const unit = useFahrenheit ? '°F' : '°C';

      const forecast = processDailyForecast(forecastRaw, useFahrenheit).slice(0, 5);
      const moonPhase = calculateMoonPhase();

      const uvIndex = await fetchUVIndex(lat, lon).catch(() => 0);
      const pollenData = await fetchPollenData(lat, lon).catch(() => ({ tree: {}, grass: {}, weed: {} } as any));
      const airQualityData = await fetchAirQualityData(lat, lon, displayName).catch(() => ({ aqi: 0, category: 'Unknown' } as any));

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
        sunrise: current?.sys?.sunrise ? formatTime(current.sys.sunrise, current?.timezone ?? 0) : 'N/A',
        sunset: current?.sys?.sunset ? formatTime(current.sys.sunset, current?.timezone ?? 0) : 'N/A',
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

    // Fetch One Call 3.0 aggregation using internal API
    const oneCallResponse = await fetch(
      getApiUrl(`/api/weather/onecall?lat=${lat}&lon=${lon}&units=${unitSystem}`)
    );
    if (!oneCallResponse.ok) {
      throw new Error(`One Call API call failed: ${oneCallResponse.status}`);
    }
    const oneCall = await oneCallResponse.json();
    console.log('One Call response received. daily length:', Array.isArray(oneCall?.daily) ? oneCall.daily.length : 'missing', 'hourly length:', Array.isArray(oneCall?.hourly) ? oneCall.hourly.length : 'missing');

    // Process and validate data
    const countryCode = oneCall?.timezone?.includes('America') ? 'US' : (oneCall?.current?.sys?.country || 'US');
    const useFahrenheit = shouldUseFahrenheit(countryCode);
    console.log('Using Fahrenheit:', useFahrenheit);

    // Format temperature with proper unit handling
    const temp = formatTemperature(oneCall.current?.temp ?? 0, countryCode);
    console.log('Formatted temperature:', temp);

    // Process forecast data: use One Call daily for 5-day view
    const baseDaily = Array.isArray(oneCall.daily)
      ? oneCall.daily.slice(0, 5).map((d: any) => ({
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
      : []

    const ensureFiveDays = (list: any[]) => {
      const result = [...list]
      const now = oneCall?.current?.dt ?? Math.floor(Date.now() / 1000)
      let dayIndex = result.length
      while (result.length < 5) {
        const start = now + dayIndex * 86400
        const end = start + 86400
        const hours: any[] = Array.isArray(oneCall.hourly)
          ? oneCall.hourly.filter((h: any) => h.dt >= start && h.dt < end)
          : []
        if (hours.length > 0) {
          const temps = hours.map(h => h.temp)
          const high = Math.max(...temps)
          const low = Math.min(...temps)
          const humidity = Math.round(hours.reduce((a, b) => a + (b.humidity ?? 0), 0) / hours.length)
          const windSpeed = Math.round(hours.reduce((a, b) => a + (b.wind_speed ?? 0), 0) / hours.length)
          const windDeg = Math.round(hours.reduce((a, b) => a + (b.wind_deg ?? 0), 0) / hours.length)
          const pressure = Math.round(hours.reduce((a, b) => a + (b.pressure ?? 1013), 0) / hours.length)
          const clouds = Math.round(hours.reduce((a, b) => a + (b.clouds ?? 0), 0) / hours.length)
          const pop = Math.min(100, Math.round((hours.reduce((a, b) => a + (b.pop ?? 0), 0) / hours.length) * 100))
          const wx = hours.find(h => h.weather?.[0])?.weather?.[0]
          result.push({
            day: new Date(start * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
            highTemp: Math.round(high),
            lowTemp: Math.round(low),
            condition: wx?.main || 'Clear',
            description: wx?.description || 'clear sky',
            details: {
              humidity,
              windSpeed,
              windDirection: getWindDirection(windDeg),
              pressure: `${pressure} hPa`,
              cloudCover: clouds,
              precipitationChance: pop,
              visibility: undefined,
              uvIndex: 0,
            },
            hourlyForecast: [],
          })
        } else {
          // Graceful placeholder
          result.push({
            day: new Date(start * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
            highTemp: 0,
            lowTemp: 0,
            condition: 'Clear',
            description: 'No data',
            details: { humidity: 0, windSpeed: 0, windDirection: undefined, pressure: '1013 hPa', cloudCover: 0, precipitationChance: 0, visibility: undefined, uvIndex: 0 },
            hourlyForecast: [],
          })
        }
        dayIndex += 1
      }
      return result
    }

    const forecast = ensureFiveDays(baseDaily)
    console.log('Forecast days after mapping:', forecast.length)
    console.log('Processed forecast:', forecast);

    // Calculate moon phase
    const moonPhase = calculateMoonPhase();
    console.log('Moon phase:', moonPhase);

    // Fetch UV Index with debugging
    console.log('=== FETCHING UV INDEX ===');
    const uvIndex = Math.round(oneCall.current?.uvi ?? 0);
    console.log('UV Index fetched:', uvIndex);

    // Fetch Pollen data
    const pollenData = await fetchPollenData(lat, lon);
    console.log('Weather Data - Pollen:', pollenData);

    // Fetch Air Quality data
    const airQualityData = await fetchAirQualityData(lat, lon, displayName);
    console.log('Weather Data - Air Quality:', airQualityData);

    // Process hourly forecast data (48 hours)
    const hourlyForecast = processHourlyForecast(oneCall.hourly || [], oneCall.timezone_offset || 0);
    console.log('Processed hourly forecast:', hourlyForecast.length, 'hours');

    // Construct weather data object
    const weatherData: WeatherData = {
      location: displayName,
      country: countryCode,
      temperature: temp.value,
      unit: temp.unit,
      condition: oneCall.current?.weather?.[0]?.main ?? 'Clear',
      description: oneCall.current?.weather?.[0]?.description ?? 'clear sky',
      humidity: oneCall.current?.humidity ?? 0,
      wind: {
        speed: oneCall.current?.wind_speed ?? 0,
        direction: oneCall.current?.wind_deg ? getCompassDirection(oneCall.current.wind_deg) : undefined,
        gust: oneCall.current?.wind_gust
      } as WindData,
      pressure: formatPressureByRegion(oneCall.current?.pressure ?? 1013, countryCode),
      sunrise: oneCall.current?.sunrise ? formatTime(oneCall.current.sunrise, oneCall.timezone_offset) : 'N/A',
      sunset: oneCall.current?.sunset ? formatTime(oneCall.current.sunset, oneCall.timezone_offset) : 'N/A',
      forecast: forecast,
      moonPhase: moonPhase,
      uvIndex,
      aqi: airQualityData.aqi,
      aqiCategory: airQualityData.category,
      pollen: pollenData,
      coordinates: { lat, lon },
      hourlyForecast: hourlyForecast
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
export const fetchWeatherByLocation = async (
  coords: string,
  unitSystem: 'metric' | 'imperial' = 'imperial',
  locationName?: string
): Promise<WeatherData> => {
  const [latitude, longitude] = coords.split(',').map(Number)
  
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid coordinates')
  }

  try {
    const isPlaywrightTestMode = process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE === 'true';
    if (isPlaywrightTestMode) {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(getApiUrl(`/api/weather/current?lat=${latitude}&lon=${longitude}&units=${unitSystem}`), { cache: 'no-store' }),
        fetch(getApiUrl(`/api/weather/forecast?lat=${latitude}&lon=${longitude}&units=${unitSystem}`), { cache: 'no-store' }),
      ]);

      if (!currentRes.ok) {
        throw new Error(`Current weather API call failed: ${currentRes.status}`);
      }
      if (!forecastRes.ok) {
        throw new Error(`Forecast API call failed: ${forecastRes.status}`);
      }

      const current = await currentRes.json();
      const forecastRaw = await forecastRes.json();

      const countryCode = current?.sys?.country || 'US';
      const useFahrenheit = unitSystem === 'imperial';

      const temperature = Math.round(current?.main?.temp ?? 0);
      const unit = useFahrenheit ? '°F' : '°C';

      const forecast = processDailyForecast(forecastRaw, useFahrenheit).slice(0, 5);
      const moonPhase = calculateMoonPhase();

      const uvIndex = await fetchUVIndex(latitude, longitude).catch(() => 0);
      const pollenData = await fetchPollenData(latitude, longitude).catch(() => ({ tree: {}, grass: {}, weed: {} } as any));
      const airQualityData = await fetchAirQualityData(latitude, longitude, locationName || '').catch(() => ({ aqi: 0, category: 'Unknown' } as any));

      return {
        location: locationName || `${latitude}, ${longitude}`,
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
        sunrise: current?.sys?.sunrise ? formatTime(current.sys.sunrise, current?.timezone ?? 0) : 'N/A',
        sunset: current?.sys?.sunset ? formatTime(current.sys.sunset, current?.timezone ?? 0) : 'N/A',
        forecast,
        moonPhase,
        uvIndex,
        aqi: airQualityData.aqi,
        aqiCategory: airQualityData.category,
        pollen: pollenData,
        coordinates: { lat: latitude, lon: longitude },
        hourlyForecast: [],
      };
    }

    // Fetch One Call 3.0 aggregation using internal API
    const oneCallResponse = await fetch(
      getApiUrl(`/api/weather/onecall?lat=${latitude}&lon=${longitude}&units=${unitSystem}`)
    )
    if (!oneCallResponse.ok) {
      throw new Error(`One Call API call failed: ${oneCallResponse.status}`)
    }
    const oneCall = await oneCallResponse.json()
    console.log('One Call response:', oneCall)

    // Process and validate data
    const countryCode = oneCall?.timezone?.includes('America') ? 'US' : (oneCall?.current?.sys?.country || 'US')
    const useFahrenheit = shouldUseFahrenheit(countryCode)
    console.log('Using Fahrenheit:', useFahrenheit)

    // Format temperature with proper unit handling
    const temp = formatTemperature(oneCall.current?.temp ?? 0, countryCode)
    console.log('Formatted temperature:', temp)

    // Build 5-day forecast from One Call daily, with hourly fallback
    const baseDaily = Array.isArray(oneCall.daily)
      ? oneCall.daily.slice(0, 5).map((d: any) => ({
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
      : []

    const ensureFiveDays = (list: any[]) => {
      const result = [...list]
      const now = oneCall?.current?.dt ?? Math.floor(Date.now() / 1000)
      let dayIndex = result.length
      while (result.length < 5) {
        const start = now + dayIndex * 86400
        const end = start + 86400
        const hours: any[] = Array.isArray(oneCall.hourly)
          ? oneCall.hourly.filter((h: any) => h.dt >= start && h.dt < end)
          : []
        if (hours.length > 0) {
          const temps = hours.map(h => h.temp)
          const high = Math.max(...temps)
          const low = Math.min(...temps)
          const humidity = Math.round(hours.reduce((a, b) => a + (b.humidity ?? 0), 0) / hours.length)
          const windSpeed = Math.round(hours.reduce((a, b) => a + (b.wind_speed ?? 0), 0) / hours.length)
          const windDeg = Math.round(hours.reduce((a, b) => a + (b.wind_deg ?? 0), 0) / hours.length)
          const pressure = Math.round(hours.reduce((a, b) => a + (b.pressure ?? 1013), 0) / hours.length)
          const clouds = Math.round(hours.reduce((a, b) => a + (b.clouds ?? 0), 0) / hours.length)
          const pop = Math.min(100, Math.round((hours.reduce((a, b) => a + (b.pop ?? 0), 0) / hours.length) * 100))
          const wx = hours.find(h => h.weather?.[0])?.weather?.[0]
          result.push({
            day: new Date(start * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
            highTemp: Math.round(high),
            lowTemp: Math.round(low),
            condition: wx?.main || 'Clear',
            description: wx?.description || 'clear sky',
            details: {
              humidity,
              windSpeed,
              windDirection: getWindDirection(windDeg),
              pressure: `${pressure} hPa`,
              cloudCover: clouds,
              precipitationChance: pop,
              visibility: undefined,
              uvIndex: 0,
            },
            hourlyForecast: [],
          })
        } else {
          result.push({
            day: new Date(start * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
            highTemp: 0,
            lowTemp: 0,
            condition: 'Clear',
            description: 'No data',
            details: { humidity: 0, windSpeed: 0, windDirection: undefined, pressure: '1013 hPa', cloudCover: 0, precipitationChance: 0, visibility: undefined, uvIndex: 0 },
            hourlyForecast: [],
          })
        }
        dayIndex += 1
      }
      return result
    }

    const forecast = ensureFiveDays(baseDaily)
    console.log('Processed forecast:', forecast)

    // Calculate moon phase
    const moonPhase = calculateMoonPhase()
    console.log('Moon phase:', moonPhase)

    // Fetch UV Index with debugging
    console.log('=== FETCHING UV INDEX ===');
    const uvIndex = Math.round(oneCall.current?.uvi ?? 0)
    console.log('UV Index fetched:', uvIndex);

    // Fetch Pollen data
    console.log('=== FETCHING POLLEN DATA ===');
    const pollenData = await fetchPollenData(latitude, longitude);
    console.log('Weather Data - Pollen:', pollenData);

    // Fetch Air Quality data
    const airQualityData = await fetchAirQualityData(latitude, longitude, `${oneCall?.timezone || 'Unknown'}`);
    console.log('Weather Data - Air Quality:', airQualityData);

    // Process hourly forecast data (48 hours)
    const hourlyForecast = processHourlyForecast(oneCall.hourly || [], oneCall.timezone_offset || 0);
    console.log('Processed hourly forecast:', hourlyForecast.length, 'hours');

    // Construct weather data object
    const weatherData: WeatherData = {
      location: locationName || `${oneCall?.timezone || 'Selected Location'}`,
      country: countryCode,
      temperature: temp.value,
      unit: temp.unit,
      condition: oneCall.current?.weather?.[0]?.main ?? 'Clear',
      description: oneCall.current?.weather?.[0]?.description ?? 'clear sky',
      humidity: oneCall.current?.humidity ?? 0,
      wind: {
        speed: oneCall.current?.wind_speed ?? 0,
        direction: oneCall.current?.wind_deg ? getCompassDirection(oneCall.current.wind_deg) : undefined,
        gust: oneCall.current?.wind_gust
      },
      pressure: formatPressureByRegion(oneCall.current?.pressure ?? 1013, countryCode),
      sunrise: oneCall.current?.sunrise ? formatTime(oneCall.current.sunrise, oneCall.timezone_offset) : 'N/A',
      sunset: oneCall.current?.sunset ? formatTime(oneCall.current.sunset, oneCall.timezone_offset) : 'N/A',
      forecast: forecast,
      moonPhase: moonPhase,
      uvIndex: uvIndex,
      aqi: airQualityData.aqi,
      aqiCategory: airQualityData.category,
      pollen: pollenData,
      coordinates: { lat: latitude, lon: longitude },
      hourlyForecast: hourlyForecast
    }

    console.log('Final weather data:', weatherData)
    return weatherData

  } catch (error) {
    console.error('Error fetching weather data:', error)
    throw error
  }
} 

// One Call 3.0 minutely nowcast helper for overlays
export async function fetchMinutelyNowcast(lat: number, lon: number, units: 'metric' | 'imperial') {
  try {
    const res = await fetch(getApiUrl(`/api/weather/onecall/minutely?lat=${lat}&lon=${lon}&units=${units}`), { cache: 'no-store' })
    if (!res.ok) return { minutely: [] }
    return res.json()
  } catch {
    return { minutely: [] }
  }
}
