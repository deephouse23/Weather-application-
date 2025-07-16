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
    console.warn('Please set either NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY or REACT_APP_GOOGLE_POLLEN_API_KEY environment variable for real pollen data.');
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
    hourlyForecast: any[];
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

// Add UV Index API endpoint with detailed debugging
const fetchUVIndex = async (lat: number, lon: number, apiKey: string): Promise<number> => {
  console.log('=== UV INDEX REAL-TIME DEBUG ===');
  console.log('Coordinates:', { lat, lon });
  
  try {
    // Use One Call API 3.0 for real-time UV data
    const oneCallUrl = `${BASE_URL_V3}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&appid=${apiKey}`;
    console.log('One Call API URL for UV Index:', oneCallUrl);
    
    const response = await fetch(oneCallUrl);
    console.log('One Call API Response Status:', response.status);
    
    if (!response.ok) {
      console.error('One Call API failed for UV Index:', response.status, response.statusText);
      
      // Fallback to basic UV endpoint (daily maximum)
      console.log('Falling back to basic UV endpoint (daily maximum)...');
      const fallbackUrl = `${BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
      const fallbackResponse = await fetch(fallbackUrl);
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const dailyMaxUV = fallbackData.value || fallbackData.uvi || 0;
        console.log('Fallback daily maximum UV Index:', dailyMaxUV);
        
        // Estimate current UV based on time of day (rough approximation)
        const now = new Date();
        const hour = now.getHours();
        const currentUV = estimateCurrentUVFromDailyMax(dailyMaxUV, hour);
        console.log('Estimated current UV from daily max:', currentUV);
        return Math.round(currentUV);
      }
      
      return 0;
    }
    
    const data = await response.json();
    console.log('One Call API Response Data:', data);
    
    // Get current UV index from the current conditions
    const currentUV = data.current?.uvi || 0;
    console.log('Current UV Index from One Call API:', currentUV);
    
    if (currentUV === 0) {
      // Check if it's nighttime
      const currentTime = data.current?.dt || Date.now() / 1000;
      const timezone = data.timezone_offset || 0;
      const localTime = currentTime + timezone;
      const localHour = new Date(localTime * 1000).getHours();
      
      console.log('Local hour:', localHour);
      console.log('UV Index: 0 (likely nighttime)');
      return 0;
    }
    
    const roundedUV = Math.round(currentUV);
    console.log('Final UV Index (rounded):', roundedUV);
    return roundedUV;
    
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

// Add Pollen API endpoint with real Google Pollen API
const fetchPollenData = async (lat: number, lon: number, openWeatherApiKey: string): Promise<{ tree: Record<string, string>; grass: Record<string, string>; weed: Record<string, string> }> => {
  console.log('=== POLLEN DATA DEBUG ===');
  console.log('Coordinates:', { lat, lon });
  console.log('OpenWeather API Key available:', !!openWeatherApiKey);
  
  // Use real Google Pollen API
  const googlePollenApiKey = validateGooglePollenApiKey();
  console.log('Google Pollen API Key available:', !!googlePollenApiKey);
  
  if (googlePollenApiKey) {
    try {
      console.log('🔍 Attempting to fetch real pollen data from Google Pollen API...');
      const googlePollenUrl = `https://pollen.googleapis.com/v1/forecast:lookup?key=${googlePollenApiKey}&location.latitude=${lat}&location.longitude=${lon}&days=1`;
      console.log('Google Pollen API URL:', googlePollenUrl);
      
      const response = await fetch(googlePollenUrl);
      console.log('Google Pollen API Response Status:', response.status);
      console.log('Google Pollen API Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Google Pollen API Response Data:', data);
        console.log('Full Google Pollen API Response:', JSON.stringify(data, null, 2));
        
        // Parse the actual Google Pollen API response
        const dailyInfo = data.dailyInfo?.[0];
        console.log('Daily Info:', dailyInfo);
        
        if (dailyInfo) {
          console.log('Pollen Type Info:', dailyInfo.pollenTypeInfo);
          console.log('Plant Info:', dailyInfo.plantInfo);
          
          // Helper function to convert pollen value to category
          const getPollenCategory = (value: number): string => {
            if (value === 0) return 'No Data';
            if (value <= 2) return 'Low';
            if (value <= 5) return 'Moderate';
            if (value <= 8) return 'High';
            return 'Very High';
          };

          // Plant code groupings
          const treePlants = ['MAPLE', 'ELM', 'COTTONWOOD', 'ALDER', 'BIRCH', 'ASH', 'PINE', 'OAK', 'JUNIPER'];
          const grassPlants = ['GRAMINALES'];
          const weedPlants = ['RAGWEED', 'WEED'];

          // Helper to extract all plants of a group
          const extractPlantCategories = (plants: any[], group: string[]): Record<string, string> => {
            const result: Record<string, string> = {};
            plants?.forEach((p: any) => {
              const code = p.code || p.displayName || '';
              if (group.some(type => code.includes(type))) {
                const value = p.indexInfo?.value || 0;
                const category = p.indexInfo?.category || getPollenCategory(value);
                result[p.displayName || code] = category;
              }
            });
            return result;
          };

          const plantInfo = dailyInfo.plantInfo || [];
          const treeBreakdown = extractPlantCategories(plantInfo, treePlants);
          const grassBreakdown = extractPlantCategories(plantInfo, grassPlants);
          const weedBreakdown = extractPlantCategories(plantInfo, weedPlants);

          // Fallback to pollenTypeInfo if no plantInfo for a group
          const pollenTypeTree = dailyInfo.pollenTypeInfo?.find((p: any) => p.code === 'TREE');
          const pollenTypeGrass = dailyInfo.pollenTypeInfo?.find((p: any) => p.code === 'GRASS');
          const pollenTypeWeed = dailyInfo.pollenTypeInfo?.find((p: any) => p.code === 'WEED');

          if (Object.keys(treeBreakdown).length === 0 && pollenTypeTree) {
            treeBreakdown['Tree'] = pollenTypeTree.indexInfo?.category || getPollenCategory(pollenTypeTree.indexInfo?.value || 0);
          }
          if (Object.keys(grassBreakdown).length === 0 && pollenTypeGrass) {
            grassBreakdown['Grass'] = pollenTypeGrass.indexInfo?.category || getPollenCategory(pollenTypeGrass.indexInfo?.value || 0);
          }
          if (Object.keys(weedBreakdown).length === 0 && pollenTypeWeed) {
            weedBreakdown['Weed'] = pollenTypeWeed.indexInfo?.category || getPollenCategory(pollenTypeWeed.indexInfo?.value || 0);
          }

          // Log for debugging
          console.log('Tree breakdown:', treeBreakdown);
          console.log('Grass breakdown:', grassBreakdown);
          console.log('Weed breakdown:', weedBreakdown);

          const pollenData = {
            tree: treeBreakdown,
            grass: grassBreakdown,
            weed: weedBreakdown
          };

          console.log('Final parsed pollen data from Google API:', pollenData);
          return pollenData;
        } else {
          console.warn('No daily pollen info found in Google API response');
          console.log('Available keys in response:', Object.keys(data));
        }
      } else {
        console.error('Google Pollen API failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Google Pollen API error:', error);
    }
  }
  
  // Fallback to OpenWeather Air Pollution API only if Google API fails
  console.log('🔄 Falling back to OpenWeather Air Pollution API for basic air quality data...');
  try {
    const airPollutionUrl = `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`;
    console.log('OpenWeather Air Pollution API URL:', airPollutionUrl);
    
    const response = await fetch(airPollutionUrl);
    console.log('OpenWeather Air Pollution API Response Status:', response.status);
    
    if (!response.ok) {
      console.warn('OpenWeather Air Pollution API failed:', response.status, response.statusText);
      return { tree: { 'Tree': 'No Data' }, grass: { 'Grass': 'No Data' }, weed: { 'Weed': 'No Data' } };
    }
    
    const data = await response.json();
    console.log('OpenWeather Air Pollution API Response Data:', data);
    
    // Use air quality as fallback (not seasonal estimates)
    const airQualityIndex = data.list?.[0]?.main?.aqi || 1;
    const pm10 = data.list?.[0]?.components?.pm10 || 0;
    const pm2_5 = data.list?.[0]?.components?.pm2_5 || 0;
    
    console.log('Air quality fallback data:', { airQualityIndex, pm10, pm2_5 });
    
    // Simple fallback based on air quality (not seasonal estimates)
    const getPollenCategory = (value: number): string => {
      if (value === 0) return 'No Data';
      if (value <= 2) return 'Low';
      if (value <= 5) return 'Moderate';
      if (value <= 8) return 'High';
      return 'Very High';
    };
    
    const pollenData = {
      tree: { 'Tree': getPollenCategory(Math.min(Math.round(airQualityIndex * 10), 100)) },
      grass: { 'Grass': getPollenCategory(Math.min(Math.round(airQualityIndex * 8), 100)) },
      weed: { 'Weed': getPollenCategory(Math.min(Math.round(airQualityIndex * 6), 100)) }
    };
    
    console.log('Fallback pollen data (air quality based):', pollenData);
    console.log('Note: Using air quality fallback. For real pollen data, ensure Google Pollen API key is properly configured.');
    
    return pollenData;
    
  } catch (error) {
    console.warn('OpenWeather Air Pollution API error:', error);
    console.log('Returning default pollen values');
    return { tree: { 'Tree': 'No Data' }, grass: { 'Grass': 'No Data' }, weed: { 'Weed': 'No Data' } };
  }
};

// Fetch Air Quality from Google Air Quality API with enhanced debugging and fallbacks
const fetchAirQualityData = async (lat: number, lon: number, cityName?: string): Promise<{ aqi: number; category: string }> => {
  console.log('=== FETCHING AIR QUALITY DATA ===');
  console.log('=== AIR QUALITY COORDINATE DEBUG ===');
  console.log('City being searched:', cityName || 'Unknown');
  console.log('Coordinates passed to Air Quality API:', { latitude: lat, longitude: lon });
  console.log('Timestamp:', new Date().toISOString());
  
  // Store previous coordinates for comparison (in a simple way for debugging)
  const previousCoordinates = (globalThis as any).lastAirQualityCoordinates;
  console.log('Previous coordinates (if cached):', previousCoordinates);
  
  // Update stored coordinates
  (globalThis as any).lastAirQualityCoordinates = { latitude: lat, longitude: lon };
  
  console.log('Fetching Air Quality for:', cityName || 'Unknown', 'at coordinates:', lat, lon);
  
  const googleApiKey = validateGooglePollenApiKey();
  console.log('Google Air Quality API Key available:', !!googleApiKey);
  
  // Try Google Air Quality API first
  if (googleApiKey) {
    try {
      const url = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${googleApiKey}`;
      const payload = JSON.stringify({ location: { latitude: lat, longitude: lon } });
      
      console.log('Google Air Quality API URL:', url);
      console.log('Google Air Quality API Payload:', payload);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      
      console.log('Google Air Quality API Response Status:', response.status);
      console.log('Google Air Quality API Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Google Air Quality API Response Data:', responseData);
        console.log('Full Google Air Quality API Response:', JSON.stringify(responseData, null, 2));
        
        // Parse AQI value and category with correct data path
        const indexes = responseData?.indexes;
        console.log('Google AQI Indexes:', indexes);
        
        const aqiValue = indexes?.[0]?.aqi || 0;
        const aqiCategory = indexes?.[0]?.category || 'No Data';
        
        console.log('Google AQI value extracted:', aqiValue);
        console.log('Google AQI category extracted:', aqiCategory);
        
        // Check if we have additional AQI information
        const additionalInfo = responseData?.indexes?.[0];
        if (additionalInfo) {
          console.log('Google AQI additional info:', {
            displayName: additionalInfo.displayName,
            aqiDisplay: additionalInfo.aqiDisplay,
            category: additionalInfo.category,
            dominantPollutant: additionalInfo.dominantPollutant
          });
        }
        
        const finalAirQualityObject = { aqi: aqiValue, category: aqiCategory };
        console.log('Final Google air quality object:', finalAirQualityObject);
        
        return finalAirQualityObject;
        
      } else {
        console.error('Google Air Quality API failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Google API Error response:', errorText);
      }
    } catch (error) {
      console.error('Google Air Quality API error:', error);
    }
  } else {
    console.warn('No Google Air Quality API key found.');
  }
  
  // Fallback to OpenWeather Air Pollution API
  console.log('🔄 Falling back to OpenWeather Air Pollution API...');
  try {
    const openWeatherApiKey = validateApiKey();
    const airPollutionUrl = `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`;
    console.log('OpenWeather Air Pollution API URL:', airPollutionUrl);
    
    const response = await fetch(airPollutionUrl);
    console.log('OpenWeather Air Pollution API Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('OpenWeather Air Pollution API Response Data:', data);
      
      // OpenWeather uses a different AQI scale (1-5)
      const openWeatherAQI = data.list?.[0]?.main?.aqi || 1;
      const components = data.list?.[0]?.components || {};
      
      console.log('OpenWeather AQI (1-5 scale):', openWeatherAQI);
      console.log('OpenWeather components:', components);
      
      // Convert OpenWeather AQI (1-5) to US EPA AQI scale (0-500)
      const convertedAQI = convertOpenWeatherAQIToEPA(openWeatherAQI, components);
      const category = getAQICategory(convertedAQI);
      
      console.log('Converted OpenWeather AQI to EPA scale:', convertedAQI);
      console.log('AQI Category:', category);
      
      return { aqi: convertedAQI, category };
      
    } else {
      console.error('OpenWeather Air Pollution API failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('OpenWeather Air Pollution API error:', error);
  }
  
  // Final fallback
  console.warn('All AQI APIs failed. Returning default values.');
  return { aqi: 0, category: 'No Data' };
};

// Convert OpenWeather AQI (1-5) to US EPA AQI scale (0-500)
const convertOpenWeatherAQIToEPA = (openWeatherAQI: number, components: any): number => {
  // OpenWeather AQI scale: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
  // US EPA AQI scale: 0-50=Good, 51-100=Moderate, 101-150=Unhealthy for Sensitive Groups, etc.
  
  const aqiRanges = {
    1: { min: 0, max: 50 },      // Good
    2: { min: 51, max: 100 },    // Fair/Moderate
    3: { min: 101, max: 150 },   // Moderate/Unhealthy for Sensitive Groups
    4: { min: 151, max: 200 },   // Poor/Unhealthy
    5: { min: 201, max: 300 }    // Very Poor/Very Unhealthy
  };
  
  const range = aqiRanges[openWeatherAQI as keyof typeof aqiRanges] || aqiRanges[1];
  
  // Use PM2.5 and PM10 values if available for more accurate conversion
  if (components.pm2_5 && components.pm10) {
    const pm25AQI = calculateEPAFromPM25(components.pm2_5);
    const pm10AQI = calculateEPAFromPM10(components.pm10);
    
    console.log('PM2.5 AQI calculation:', { pm25: components.pm2_5, aqi: pm25AQI });
    console.log('PM10 AQI calculation:', { pm10: components.pm10, aqi: pm10AQI });
    
    // Return the higher of the two (worst case)
    return Math.max(pm25AQI, pm10AQI);
  }
  
  // Fallback to range-based conversion
  const convertedAQI = Math.round((range.min + range.max) / 2);
  console.log(`OpenWeather AQI ${openWeatherAQI} converted to EPA AQI: ${convertedAQI} (range: ${range.min}-${range.max})`);
  
  return convertedAQI;
};

// Calculate EPA AQI from PM2.5 concentration
const calculateEPAFromPM25 = (pm25: number): number => {
  // EPA PM2.5 breakpoints (μg/m³)
  const breakpoints = [
    { low: 0, high: 12.0, aqiLow: 0, aqiHigh: 50 },
    { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
    { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
    { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
    { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
    { low: 250.5, high: 350.4, aqiLow: 301, aqiHigh: 400 },
    { low: 350.5, high: 500.4, aqiLow: 401, aqiHigh: 500 }
  ];
  
  for (const bp of breakpoints) {
    if (pm25 >= bp.low && pm25 <= bp.high) {
      return Math.round(((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (pm25 - bp.low) + bp.aqiLow);
    }
  }
  
  return 500; // Above 500.4 μg/m³
};

// Calculate EPA AQI from PM10 concentration
const calculateEPAFromPM10 = (pm10: number): number => {
  // EPA PM10 breakpoints (μg/m³)
  const breakpoints = [
    { low: 0, high: 54, aqiLow: 0, aqiHigh: 50 },
    { low: 55, high: 154, aqiLow: 51, aqiHigh: 100 },
    { low: 155, high: 254, aqiLow: 101, aqiHigh: 150 },
    { low: 255, high: 354, aqiLow: 151, aqiHigh: 200 },
    { low: 355, high: 424, aqiLow: 201, aqiHigh: 300 },
    { low: 425, high: 504, aqiLow: 301, aqiHigh: 400 },
    { low: 505, high: 604, aqiLow: 401, aqiHigh: 500 }
  ];
  
  for (const bp of breakpoints) {
    if (pm10 >= bp.low && pm10 <= bp.high) {
      return Math.round(((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (pm10 - bp.low) + bp.aqiLow);
    }
  }
  
  return 500; // Above 604 μg/m³
};

// Get AQI category based on EPA scale
const getAQICategory = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
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

    // Fetch Air Quality data
    const airQualityData = await fetchAirQualityData(lat, lon, displayName);
    console.log('Weather Data - Air Quality:', airQualityData);

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
      aqi: airQualityData.aqi,
      aqiCategory: airQualityData.category,
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

    // Fetch UV Index with debugging
    console.log('=== FETCHING UV INDEX ===');
    const uvIndex = await fetchUVIndex(latitude, longitude, apiKey);
    console.log('UV Index fetched:', uvIndex);

    // Fetch Pollen data
    console.log('=== FETCHING POLLEN DATA ===');
    const pollenData = await fetchPollenData(latitude, longitude, apiKey);
    console.log('Weather Data - Pollen:', pollenData);

    // Fetch Air Quality data
    const airQualityData = await fetchAirQualityData(latitude, longitude, `${currentWeatherData.name}, ${currentWeatherData.sys.country}`);
    console.log('Weather Data - Air Quality:', airQualityData);

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
      uvIndex: uvIndex,
      aqi: airQualityData.aqi,
      aqiCategory: airQualityData.category,
      pollen: pollenData,
    }

    console.log('Final weather data:', weatherData)
    return weatherData

  } catch (error) {
    console.error('Error fetching weather data:', error)
    throw error
  }
} 