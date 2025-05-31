interface WeatherData {
  current: {
    temp: number;
    condition: string;
    humidity: number;
    wind: number;
    windDirection?: number; // Wind direction in degrees
    windDisplay: string; // Formatted wind display (e.g., "SW 6 mph" or "Calm")
    location: string;
    description: string;
  };
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
    description: string;
  }>;
  moonPhase: {
    phase: string; // Phase name (e.g., "Waxing Crescent")
    illumination: number; // Percentage of illumination (0-100)
    emoji: string; // Unicode moon symbol
    phaseAngle: number; // Phase angle in degrees (0-360)
  };
}

interface OpenWeatherMapCurrentResponse {
  main: {
    temp: number;
    humidity: number;
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
  };
}

interface OpenWeatherMapForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
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

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// Convert wind degrees to compass direction
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

// Format wind display with direction and speed
const formatWindDisplay = (speed: number, direction?: number, gust?: number): string => {
  const roundedSpeed = Math.round(speed);
  
  // Handle calm conditions
  if (roundedSpeed === 0) {
    return 'Calm';
  }
  
  // If no direction data, just show speed
  if (direction === undefined || direction === null) {
    return `${roundedSpeed} mph`;
  }
  
  const compassDirection = getCompassDirection(direction);
  let windDisplay = `${compassDirection} ${roundedSpeed} mph`;
  
  // Add gust information if available and significant
  if (gust && Math.round(gust) > roundedSpeed + 3) {
    windDisplay += ` (gusts ${Math.round(gust)} mph)`;
  }
  
  return windDisplay;
};

// Location format detection and parsing
interface LocationQuery {
  query: string;
  type: 'zip' | 'city_state' | 'city_country' | 'city_only';
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

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

export const fetchWeatherData = async (locationInput: string, apiKey: string): Promise<WeatherData> => {
  // Debug logging for API key
  console.log('🔍 [DEBUG] fetchWeatherData called');
  console.log('🔍 [DEBUG] API Key received:', apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(-4)}` : 'NULL/UNDEFINED');
  console.log('🔍 [DEBUG] API Key length:', apiKey ? apiKey.length : 0);
  console.log('🔍 [DEBUG] API Key type:', typeof apiKey);
  console.log('🔍 [DEBUG] Environment variable NEXT_PUBLIC_OPENWEATHERMAP_API_KEY:', process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY ? `${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY.substring(0, 8)}...` : 'NOT SET');
  
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const locationQuery = parseLocationInput(locationInput);
  
  try {
    // First, geocode the location to get coordinates
    const { lat, lon, displayName } = await geocodeLocation(locationQuery, apiKey);
    
    // Fetch current weather using coordinates
    const currentResponse = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
    );

    if (!currentResponse.ok) {
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }

    const currentData: OpenWeatherMapCurrentResponse = await currentResponse.json();

    // Fetch 5-day forecast using coordinates
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
    );

    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`);
    }

    const forecastData: OpenWeatherMapForecastResponse = await forecastResponse.json();

    // Process forecast data to get daily forecasts (filter to noon readings)
    const dailyForecasts = forecastData.list
      .filter((_, index) => index % 8 === 0) // Every 8th item (approximately daily at noon)
      .slice(1, 4) // Take next 3 days
      .map((forecast, index) => {
        const date = new Date(forecast.dt * 1000);
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        
        return {
          day: dayNames[date.getDay()],
          temp: Math.round(forecast.main.temp),
          condition: mapWeatherCondition(forecast.weather[0].main),
          description: forecast.weather[0].description,
        };
      });

    // Calculate current moon phase
    const moonPhase = calculateMoonPhase();

    return {
      current: {
        temp: Math.round(currentData.main.temp),
        condition: mapWeatherCondition(currentData.weather[0].main),
        humidity: currentData.main.humidity,
        wind: Math.round(currentData.wind.speed),
        windDirection: currentData.wind.deg,
        windDisplay: formatWindDisplay(currentData.wind.speed, currentData.wind.deg, currentData.wind.gust),
        location: displayName, // Use the geocoded display name
        description: currentData.weather[0].description,
      },
      forecast: dailyForecasts,
      moonPhase
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch weather data. Please try again.');
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
export const fetchWeatherByLocation = async (apiKey: string): Promise<WeatherData> => {
  // Debug logging for API key
  console.log('🔍 [DEBUG] fetchWeatherByLocation called');
  console.log('🔍 [DEBUG] API Key received:', apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(-4)}` : 'NULL/UNDEFINED');
  console.log('🔍 [DEBUG] API Key length:', apiKey ? apiKey.length : 0);
  console.log('🔍 [DEBUG] API Key type:', typeof apiKey);
  console.log('🔍 [DEBUG] Environment variable NEXT_PUBLIC_OPENWEATHERMAP_API_KEY:', process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY ? `${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY.substring(0, 8)}...` : 'NOT SET');
  
  if (!apiKey) {
    throw new Error('API key is required');
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          if (!apiKey) {
            throw new Error('Weather API key is required.');
          }

          // Fetch current weather by coordinates
          const currentResponse = await fetch(
            `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
          );

          if (!currentResponse.ok) {
            throw new Error(`Weather API error: ${currentResponse.status}`);
          }

          const currentData: OpenWeatherMapCurrentResponse = await currentResponse.json();
          
          // Fetch forecast by coordinates
          const forecastResponse = await fetch(
            `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
          );

          if (!forecastResponse.ok) {
            throw new Error(`Forecast API error: ${forecastResponse.status}`);
          }

          const forecastData: OpenWeatherMapForecastResponse = await forecastResponse.json();

          // Process forecast data
          const dailyForecasts = forecastData.list
            .filter((_, index) => index % 8 === 0)
            .slice(1, 4)
            .map((forecast, index) => {
              const date = new Date(forecast.dt * 1000);
              const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
              
              return {
                day: dayNames[date.getDay()],
                temp: Math.round(forecast.main.temp),
                condition: mapWeatherCondition(forecast.weather[0].main),
                description: forecast.weather[0].description,
              };
            });

          const weatherData: WeatherData = {
            current: {
              temp: Math.round(currentData.main.temp),
              condition: mapWeatherCondition(currentData.weather[0].main),
              humidity: currentData.main.humidity,
              wind: Math.round(currentData.wind.speed),
              windDirection: currentData.wind.deg,
              windDisplay: formatWindDisplay(currentData.wind.speed, currentData.wind.deg, currentData.wind.gust),
              location: `${currentData.name}, ${currentData.sys.country}`,
              description: currentData.weather[0].description,
            },
            forecast: dailyForecasts,
            moonPhase: calculateMoonPhase()
          };

          resolve(weatherData);
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        let errorMessage = 'Failed to get your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enter a location manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        timeout: 10000, // 10 seconds timeout
      }
    );
  });
}; 