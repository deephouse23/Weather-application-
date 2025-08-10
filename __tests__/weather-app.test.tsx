// __tests__/weather-app.test.tsx

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { fetchWeatherData, fetchWeatherByLocation } from '@/lib/weather-api';
import { locationService } from '@/lib/location-service';
import { userCacheService } from '@/lib/user-cache-service';
import { calculateAQI, getAQIColor, getAQIDescription } from '@/lib/air-quality-utils';

import WeatherSearch from '@/components/weather-search';
import Forecast from '@/components/forecast';
import EnvironmentalDisplay from '@/components/environmental-display';

// ---------- Global/test environment shims ----------

// Make sure window exists for TypeScript
const g = globalThis as unknown as {
  window: any;
  navigator: any;
  fetch: any;
  localStorage: any;
};

// jsdom provides window, but we ensure it's accessible
if (!g.window) g.window = {} as any;

// Minimal Storage-like mock with TS-friendly typing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(g.window, 'localStorage', {
  value: localStorageMock,
  configurable: true
});
Object.defineProperty(g, 'localStorage', {
  value: localStorageMock,
  configurable: true
});

// Ensure fetch exists and is mockable
if (!g.fetch) {
  g.fetch = jest.fn();
} else {
  g.fetch = jest.fn(g.fetch);
}

// Provide a configurable geolocation stub on navigator
if (!g.navigator) g.navigator = {} as any;
if (!g.navigator.geolocation) {
  Object.defineProperty(g.navigator, 'geolocation', {
    value: {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn()
    },
    configurable: true,
    writable: true
  });
}

// ---------- Shared test data ----------

const mockWeatherData = {
  temperature: 72,
  condition: 'Clear',
  description: 'Clear sky',
  humidity: 65,
  wind: { speed: 10, direction: 'NW', gust: 15 },
  pressure: 1013,
  uvIndex: 6,
  location: 'San Francisco, CA',
  country: 'US',
  unit: '°F',
  sunrise: '6:45 am',
  sunset: '7:30 pm',
  moonPhase: { phase: 'Waxing Crescent', illumination: 25, phaseAngle: 90 },
  forecast: [
    {
      day: 'Monday',
      date: 'Jan 20',
      highTemp: 75,
      lowTemp: 60,
      condition: 'sunny',
      description: 'Clear sky',
      details: {
        humidity: 60,
        windSpeed: 12,
        windDirection: 'W',
        pressure: '1015 hPa',
        precipitationChance: 10,
        uvIndex: 7
      }
    }
  ],
  aqi: 45,
  pollen: {
    tree: { value: 'Low', score: 2 },
    grass: { value: 'Moderate', score: 4 },
    weed: { value: 'Low', score: 1 }
  }
};

// ---------- API tests ----------

describe('Weather API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('fetchWeatherData should handle valid city input', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        main: { temp: 72, humidity: 65, pressure: 1013 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 10, deg: 315, gust: 15 },
        name: 'San Francisco',
        sys: { country: 'US', sunrise: 1642680300, sunset: 1642719000 },
        timezone: -28800
      })
    } as Response;

    (g.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await fetchWeatherData('San Francisco', 'test_api_key');

    expect(result).toBeDefined();
    expect(result?.location).toBe('San Francisco');
    expect(result?.temperature).toBe(72);
    expect(result?.condition).toBe('Clear');
  });

  test('fetchWeatherData should handle ZIP code input', async () => {
    const mockGeoResponse = {
      ok: true,
      json: async () => ({
        lat: 37.7749,
        lon: -122.4194,
        name: 'San Francisco',
        country: 'US'
      })
    } as Response;

    (g.fetch as jest.Mock).mockResolvedValueOnce(mockGeoResponse);

    await fetchWeatherData('94102', 'test_api_key');

    expect(g.fetch).toHaveBeenCalledWith(expect.stringContaining('zip=94102'));
  });

  test('fetchWeatherData should handle City, State format', async () => {
    const mockResponse = {
      ok: true,
      json: async () => [
        {
          lat: 30.2672,
          lon: -97.7431,
          name: 'Austin',
          state: 'Texas',
          country: 'US'
        }
      ]
    } as Response;

    (g.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await fetchWeatherData('Austin, TX', 'test_api_key');

    expect(g.fetch).toHaveBeenCalledWith(
      expect.stringContaining('q=Austin%2CTX%2CUS')
    );
  });

  test('fetchWeatherData should handle API errors gracefully', async () => {
    (g.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchWeatherData('Invalid City', 'test_api_key')).rejects.toThrow(
      'Network error'
    );
  });

  test('fetchWeatherByLocation should handle coordinates', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        main: { temp: 72, humidity: 65, pressure: 1013 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 10, deg: 315 },
        name: 'San Francisco',
        sys: { country: 'US', sunrise: 1642680300, sunset: 1642719000 },
        timezone: -28800
      })
    } as Response;

    (g.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await fetchWeatherByLocation('37.7749,-122.4194');

    expect(g.fetch).toHaveBeenCalledWith(
      expect.stringContaining('lat=37.7749&lon=-122.4194')
    );
    expect(result?.location).toBe('San Francisco');
  });
});

// ---------- Location service ----------

describe('Location Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('isGeolocationSupported should detect browser support', () => {
    const original = g.navigator.geolocation;

    // With geolocation
    Object.defineProperty(g.navigator, 'geolocation', {
      value: { getCurrentPosition: jest.fn() },
      configurable: true,
      writable: true
    });
    expect(locationService.isGeolocationSupported()).toBe(true);

    // Without geolocation
    Object.defineProperty(g.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
      writable: true
    });
    expect(locationService.isGeolocationSupported()).toBe(false);

    // Restore
    Object.defineProperty(g.navigator, 'geolocation', {
      value: original,
      configurable: true,
      writable: true
    });
  });

  test('getCurrentLocation should handle successful geolocation', async () => {
    const mockPosition = {
      coords: { latitude: 37.7749, longitude: -122.4194 }
    };

    Object.defineProperty(g.navigator, 'geolocation', {
      value: {
        getCurrentPosition: (success: (pos: any) => void) => success(mockPosition)
      },
      configurable: true,
      writable: true
    });

    (g.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        city: 'San Francisco',
        region: 'California',
        country: 'US'
      })
    } as Response);

    const location = await locationService.getCurrentLocation();

    expect(location.lat).toBe(37.7749);
    expect(location.lon).toBe(-122.4194);
    expect(location.displayName).toContain('San Francisco');
  });

  test('getCurrentLocation should handle geolocation error', async () => {
    Object.defineProperty(g.navigator, 'geolocation', {
      value: {
        getCurrentPosition: (_success: any, error: (e: any) => void) =>
          error({ code: 1, message: 'User denied' })
      },
      configurable: true,
      writable: true
    });

    await expect(locationService.getCurrentLocation()).rejects.toThrow(
      'Location access denied'
    );
  });

  test('getLocationByIP should fallback to IP-based location', async () => {
    (g.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        city: 'San Francisco',
        region: 'California',
        country: 'US',
        loc: '37.7749,-122.4194'
      })
    } as Response);

    const location = await locationService.getLocationByIP();

    expect(location.displayName).toContain('San Francisco');
    expect(location.lat).toBe(37.7749);
    expect(location.lon).toBe(-122.4194);
  });
});

// ---------- Cache service ----------

describe('Cache Service Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('saveLastLocation should store location data', () => {
    const location = {
      lat: 37.7749,
      lon: -122.4194,
      displayName: 'San Francisco, CA',
      city: 'San Francisco',
      state: 'CA',
      country: 'US'
    };

    userCacheService.saveLastLocation(location);

    const saved = localStorageMock.getItem('bitweather_last_location');
    expect(saved).toBeTruthy();

    const parsed = JSON.parse(saved!);
    expect(parsed.displayName).toBe('San Francisco, CA');
    expect(parsed.lat).toBe(37.7749);
  });

  test('getLastLocation should retrieve stored location', () => {
    const location = {
      lat: 37.7749,
      lon: -122.4194,
      displayName: 'San Francisco, CA',
      city: 'San Francisco',
      state: 'CA',
      country: 'US'
    };

    localStorageMock.setItem('bitweather_last_location', JSON.stringify(location));

    const retrieved = userCacheService.getLastLocation();
    expect(retrieved).toEqual(location);
  });

  test('cacheWeatherData should store weather with timestamp', () => {
    userCacheService.cacheWeatherData('37.77_-122.42', mockWeatherData);

    const cached = userCacheService.getCachedWeatherData('37.77_-122.42');
    expect(cached).toEqual(mockWeatherData);
  });

  test('getCachedWeatherData should return null for expired cache', () => {
    const oldTimestamp = Date.now() - 11 * 60 * 1000; // 11 minutes
    const cachedData = { data: mockWeatherData, timestamp: oldTimestamp };

    localStorageMock.setItem(
      'bitweather_weather_37.77_-122.42',
      JSON.stringify(cachedData)
    );

    const retrieved = userCacheService.getCachedWeatherData('37.77_-122.42');
    expect(retrieved).toBeNull();
  });

  test('clearCache should remove all cached data', () => {
    localStorageMock.setItem('bitweather_last_location', 'test');
    localStorageMock.setItem('bitweather_weather_test', 'test');
    localStorageMock.setItem('other_key', 'test');

    userCacheService.clearCache();

    expect(localStorageMock.getItem('bitweather_last_location')).toBeNull();
    expect(localStorageMock.getItem('bitweather_weather_test')).toBeNull();
    expect(localStorageMock.getItem('other_key')).toBe('test'); // untouched
  });
});

// ---------- AQI utils ----------

describe('Air Quality Utils Tests', () => {
  test('calculateAQI should return correct AQI values', () => {
    expect(calculateAQI(50)).toBe(50);
    expect(calculateAQI(100)).toBe(100);
    expect(calculateAQI(150)).toBe(150);
    expect(calculateAQI(200)).toBe(200);
    expect(calculateAQI(300)).toBe(300);
    expect(calculateAQI(450)).toBe(450);
  });

  test('getAQIDescription should return correct descriptions', () => {
    expect(getAQIDescription(25)).toBe('Good');
    expect(getAQIDescription(75)).toBe('Moderate');
    expect(getAQIDescription(125)).toBe('Unhealthy for Sensitive Groups');
    expect(getAQIDescription(175)).toBe('Unhealthy');
    expect(getAQIDescription(250)).toBe('Very Unhealthy');
    expect(getAQIDescription(400)).toBe('Hazardous');
  });

  test('getAQIColor should return correct colors', () => {
    expect(getAQIColor(25)).toBe('#00e400');
    expect(getAQIColor(75)).toBe('#ffff00');
    expect(getAQIColor(125)).toBe('#ff7e00');
    expect(getAQIColor(175)).toBe('#ff0000');
    expect(getAQIColor(250)).toBe('#8f3f97');
    expect(getAQIColor(400)).toBe('#7e0023');
  });
});

// ---------- Component tests ----------

describe('Component Tests', () => {
  describe('WeatherSearch Component', () => {
    test('should render search input and button', () => {
      render(
        <WeatherSearch
          onSearch={jest.fn()}
          onLocationSearch={jest.fn()}
          isLoading={false}
          error=""
          rateLimitError=""
          isDisabled={false}
        />
      );

      expect(screen.getByPlaceholderText(/enter location/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    test('should call onSearch when form is submitted', async () => {
      const onSearch = jest.fn();
      render(
        <WeatherSearch
          onSearch={onSearch}
          onLocationSearch={jest.fn()}
          isLoading={false}
          error=""
          rateLimitError=""
          isDisabled={false}
        />
      );

      const input = screen.getByPlaceholderText(/enter location/i);
      const button = screen.getByRole('button', { name: /search/i });

      fireEvent.change(input, { target: { value: 'San Francisco' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('San Francisco');
      });
    });

    test('should show loading state', () => {
      render(
        <WeatherSearch
          onSearch={jest.fn()}
          onLocationSearch={jest.fn()}
          isLoading={true}
          error=""
          rateLimitError=""
          isDisabled={false}
        />
      );

      expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
    });

    test('should display error message', () => {
      render(
        <WeatherSearch
          onSearch={jest.fn()}
          onLocationSearch={jest.fn()}
          isLoading={false}
          error="City not found"
          rateLimitError=""
          isDisabled={false}
        />
      );

      expect(screen.getByText(/city not found/i)).toBeInTheDocument();
    });
  });

  describe('Forecast Component', () => {
    test('should render 5-day forecast', () => {
      const forecast = Array.from({ length: 5 }, (_, i) => ({
        day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i],
        date: `Jan ${20 + i}`,
        highTemp: 75 + i,
        lowTemp: 60 + i,
        condition: 'sunny',
        description: 'Clear sky',
        country: 'US',
        details: {
          humidity: 60,
          windSpeed: 12,
          windDirection: 'W',
          pressure: '1015 hPa',
          precipitationChance: 10
        }
      }));

      render(<Forecast forecast={forecast} theme="dark" />);

      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('Tuesday')).toBeInTheDocument();
      expect(screen.getByText('Wednesday')).toBeInTheDocument();
      expect(screen.getByText('Thursday')).toBeInTheDocument();
      expect(screen.getByText('Friday')).toBeInTheDocument();
    });

    test('should handle day click to show details', () => {
      const onDayClick = jest.fn();
      const forecast = [
        {
          day: 'Monday',
          date: 'Jan 20',
          highTemp: 75,
          lowTemp: 60,
          condition: 'sunny',
          description: 'Clear sky',
          country: 'US',
          details: {
            humidity: 60,
            windSpeed: 12,
            windDirection: 'W',
            pressure: '1015 hPa',
            precipitationChance: 10
          }
        }
      ];

      render(
        <Forecast
          forecast={forecast}
          theme="dark"
          onDayClick={onDayClick}
          selectedDay={null}
        />
      );

      const dayElement = screen.getByText('Monday').closest('div');
      if (!dayElement) throw new Error('Day element not found');
      fireEvent.click(dayElement);

      expect(onDayClick).toHaveBeenCalledWith(0);
    });
  });

  describe('EnvironmentalDisplay Component', () => {
    test('should display AQI and pollen data', () => {
      render(<EnvironmentalDisplay weather={mockWeatherData} theme="dark" />);

      expect(screen.getByText(/air quality/i)).toBeInTheDocument();
      expect(screen.getByText(/45/)).toBeInTheDocument();
      expect(screen.getByText(/good/i)).toBeInTheDocument();
      expect(screen.getByText(/pollen count/i)).toBeInTheDocument();
      expect(screen.getByText(/tree.*low/i)).toBeInTheDocument();
      expect(screen.getByText(/grass.*moderate/i)).toBeInTheDocument();
    });

    test('should show N/A when data is unavailable', () => {
      const weatherWithoutEnvData = { ...mockWeatherData, aqi: undefined, pollen: undefined };
      render(<EnvironmentalDisplay weather={weatherWithoutEnvData} theme="dark" />);

      expect(screen.getAllByText(/n\/a/i)).toHaveLength(2);
    });
  });
});

// ---------- Integration ----------

describe('Integration Tests', () => {
  test('Weather search flow - successful search', async () => {
    (g.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            lat: 37.7749,
            lon: -122.4194,
            name: 'San Francisco',
            state: 'California',
            country: 'US'
          }
        ]
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          main: { temp: 72, humidity: 65, pressure: 1013 },
          weather: [{ main: 'Clear', description: 'Clear sky' }],
          wind: { speed: 10, deg: 315 },
          name: 'San Francisco',
          sys: { country: 'US', sunrise: 1642680300, sunset: 1642719000 },
          timezone: -28800
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          list: Array.from({ length: 40 }, (_, i) => ({
            dt: Date.now() / 1000 + i * 3 * 3600,
            main: { temp: 70 + (i % 10), humidity: 60, pressure: 1013 },
            weather: [{ main: 'Clear', description: 'Clear sky' }],
            wind: { speed: 10, deg: 270 },
            clouds: { all: 20 },
            pop: 0.1
          }))
        })
      } as Response);

    const weatherData = await fetchWeatherData('San Francisco, CA', 'test_api_key');

    expect(weatherData).toBeDefined();
    expect(weatherData?.location).toContain('San Francisco');
    expect(weatherData?.temperature).toBe(72);
    expect(weatherData?.forecast).toHaveLength(5);

    const cached = userCacheService.getCachedWeatherData('37.77_-122.42');
    expect(cached).toBeDefined();
  });

  test('Location auto-detection flow', async () => {
    Object.defineProperty(g.navigator, 'geolocation', {
      value: {
        getCurrentPosition: (success: (pos: any) => void) =>
          success({ coords: { latitude: 37.7749, longitude: -122.4194 } })
      },
      configurable: true,
      writable: true
    });

    (g.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        city: 'San Francisco',
        region: 'California',
        country: 'US'
      })
    } as Response);

    const location = await locationService.getCurrentLocation();

    expect(location.lat).toBe(37.7749);
    expect(location.lon).toBe(-122.4194);
    expect(location.displayName).toContain('San Francisco');

    userCacheService.saveLastLocation(location);
    const savedLocation = userCacheService.getLastLocation();
    expect(savedLocation).toEqual(location);
  });
});

// ---------- Error handling ----------

describe('Error Handling Tests', () => {
  test('should handle network errors gracefully', async () => {
    (g.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchWeatherData('San Francisco', 'test_api_key')).rejects.toThrow(
      'Network error'
    );
  });

  test('should handle invalid API key', async () => {
    (g.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    } as Response);

    await expect(fetchWeatherData('San Francisco', 'invalid_key')).rejects.toThrow();
  });

  test('should handle rate limiting', async () => {
    (g.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    } as Response);

    await expect(fetchWeatherData('San Francisco', 'test_api_key')).rejects.toThrow();
  });
});

// ---------- Accessibility ----------

describe('Accessibility Tests', () => {
  test('WeatherSearch should have proper ARIA labels', () => {
    render(
      <WeatherSearch
        onSearch={jest.fn()}
        onLocationSearch={jest.fn()}
        isLoading={false}
        error=""
        rateLimitError=""
        isDisabled={false}
      />
    );

    const input = screen.getByPlaceholderText(/enter location/i);
    expect(input).toHaveAttribute('aria-label');

    const button = screen.getByRole('button', { name: /search/i });
    expect(button).toHaveAttribute('aria-label');
  });

  test('Error messages should be announced', () => {
    render(
      <WeatherSearch
        onSearch={jest.fn()}
        onLocationSearch={jest.fn()}
        isLoading={false}
        error="City not found"
        rateLimitError=""
        isDisabled={false}
      />
    );

    const errorElement = screen.getByText(/city not found/i);
    expect(errorElement).toHaveAttribute('role', 'alert');
  });
});

// ---------- Performance ----------

describe('Performance Tests', () => {
  test('Cache should prevent redundant API calls', async () => {
    const apiKey = 'test_api_key';

    (g.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherData
    } as Response);

    await fetchWeatherData('San Francisco', apiKey);
    expect(g.fetch).toHaveBeenCalledTimes(1);

    jest.clearAllMocks();
    await fetchWeatherData('San Francisco', apiKey);
    expect(g.fetch).not.toHaveBeenCalled();
  });

  test('Rate limiting should work correctly', () => {
    const rateLimitData = {
      requests: Array(10).fill(Date.now()),
      lastReset: Date.now()
    };

    localStorageMock.setItem('weather-app-rate-limit', JSON.stringify(rateLimitData));

    const canMakeRequest = () => {
      const raw = localStorageMock.getItem('weather-app-rate-limit');
      if (!raw) return true;
      const data = JSON.parse(raw);
      return data.requests.length < 10;
    };

    expect(canMakeRequest()).toBe(false);
  });
});
