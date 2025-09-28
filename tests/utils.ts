import { Page, expect } from '@playwright/test';

type StubOptions = {
  cityName?: string;
  country?: string;
  lat?: number;
  lon?: number;
  tempF?: number;
  humidity?: number;
  pressure?: number;
  conditionMain?: string;
  conditionDescription?: string;
};

const defaultOptions: Required<StubOptions> = {
  cityName: 'New York',
  country: 'US',
  lat: 40.7128,
  lon: -74.006,
  tempF: 72,
  humidity: 45,
  pressure: 1015,
  conditionMain: 'Clear',
  conditionDescription: 'clear sky',
};

export async function stubWeatherApis(page: Page, opts: StubOptions = {}): Promise<void> {
  const o = { ...defaultOptions, ...opts };

  // Geocoding: ZIP returns object, direct returns array
  await page.route('**/api/weather/geocoding**', async (route) => {
    const url = route.request().url();
    const isZip = url.includes('zip=');
    const params = new URL(url).searchParams;
    const q = params.get('q') || '';

    // Negative case: Invalidopolis -> []
    if (/Invalidopolis/i.test(q)) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }

    if (isZip) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ name: o.cityName, lat: o.lat, lon: o.lon, country: o.country })
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { name: o.cityName, lat: o.lat, lon: o.lon, country: o.country, state: 'NY' }
      ])
    });
  });

  // Current weather
  await page.route('**/api/weather/current**', async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        name: o.cityName,
        sys: { country: o.country, sunrise: 1710000000, sunset: 1710040000 },
        timezone: -14400,
        main: { temp: o.tempF, humidity: o.humidity, pressure: o.pressure },
        weather: [{ main: o.conditionMain, description: o.conditionDescription }],
        wind: { speed: 5, deg: 45 },
      })
    });
  });

  // One Call 3.0 aggregate (used by the app search flow)
  await page.route('**/api/weather/onecall**', async (route) => {
    const now = Math.floor(Date.now() / 1000);
    const daily = Array.from({ length: 5 }, (_, i) => ({
      dt: now + i * 86400,
      temp: { max: o.tempF + 3, min: o.tempF - 3 },
      weather: [{ main: o.conditionMain, description: o.conditionDescription }],
      humidity: o.humidity,
      wind_speed: 5,
      wind_deg: 45,
      pressure: o.pressure,
      clouds: 10,
      pop: 0,
      uvi: 5,
    }));
    const hourly = Array.from({ length: 24 }, (_, i) => ({
      dt: now + i * 3600,
      temp: o.tempF,
      humidity: o.humidity,
      wind_speed: 5,
      wind_deg: 45,
      pressure: o.pressure,
      clouds: 10,
      pop: 0,
      weather: [{ main: o.conditionMain, description: o.conditionDescription }],
    }));
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'America/New_York',
        timezone_offset: -4 * 3600,
        current: {
          dt: now,
          temp: o.tempF,
          humidity: o.humidity,
          wind_speed: 5,
          wind_deg: 45,
          wind_gust: 12,
          pressure: o.pressure,
          sunrise: now - 6 * 3600,
          sunset: now + 6 * 3600,
          weather: [{ main: o.conditionMain, description: o.conditionDescription }],
          uvi: 5,
        },
        daily,
        hourly,
      })
    })
  })

  // Forecast: Provide several 3h slices so processDailyForecast can build days
  await page.route('**/api/weather/forecast**', async (route) => {
    const now = Math.floor(Date.now() / 1000);
    const list = Array.from({ length: 8 }, (_, i) => ({
      dt: now + i * 3 * 3600,
      main: {
        temp: o.tempF,
        temp_min: o.tempF - 5,
        temp_max: o.tempF + 5,
        humidity: o.humidity,
        pressure: o.pressure,
      },
      weather: [{ main: o.conditionMain, description: o.conditionDescription }],
      wind: { speed: 5, deg: 45 },
      clouds: { all: 10 },
      pop: 0,
    }));

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ list })
    });
  });

  // UV
  await page.route('**/api/weather/uv**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ uvi: 5 })
  }));

  // Pollen
  await page.route('**/api/weather/pollen**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ tree: {}, grass: {}, weed: {} })
  }));

  // Air quality
  await page.route('**/api/weather/air-quality**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ aqi: 30, category: 'Good' })
  }));
}

export async function seedFreshWeatherCache(page: Page, opts: StubOptions = {}): Promise<void> {
  const o = { ...defaultOptions, ...opts };
  const sampleWeather = {
    location: `${o.cityName}, ${o.country}`,
    country: o.country,
    temperature: o.tempF,
    unit: '°F',
    condition: o.conditionMain,
    description: o.conditionDescription,
    humidity: o.humidity,
    wind: { speed: 5, direction: 'NE', gust: 12 },
    pressure: `${o.pressure} hPa`,
    sunrise: '6:00 am',
    sunset: '8:00 pm',
    forecast: [
      {
        day: 'Monday',
        highTemp: o.tempF + 3,
        lowTemp: o.tempF - 3,
        condition: 'Sunny',
        description: 'Clear sky',
        details: {
          humidity: o.humidity,
          windSpeed: 5,
          windDirection: 'NE',
          pressure: `${o.pressure} hPa`,
          precipitationChance: 0,
          visibility: 10,
          uvIndex: 5,
        },
        hourlyForecast: [ { time: '10 AM', temp: o.tempF, condition: 'Sunny', precipChance: 0 } ],
      },
    ],
    moonPhase: { phase: 'Waxing Crescent', illumination: 20, emoji: 'Moon', phaseAngle: 45 },
    uvIndex: 5,
    aqi: 30,
    aqiCategory: 'Good',
    pollen: { tree: {}, grass: {}, weed: {} },
    coordinates: { lat: o.lat, lon: o.lon },
  };

  await page.addInitScript((data) => {
    const now = Date.now();
    window.localStorage.setItem('bitweather_city', data.sampleWeather.location);
    window.localStorage.setItem('bitweather_weather_data', JSON.stringify(data.sampleWeather));
    window.localStorage.setItem('bitweather_cache_timestamp', String(now));
  }, { sampleWeather });
}

export async function setupStableApp(page: Page, opts: StubOptions = {}): Promise<void> {
  await seedFreshWeatherCache(page, opts);
  await stubWeatherApis(page, opts);
}

export async function expectHomeLoaded(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page).toHaveTitle(/Weather|16/i);
  await expect(page.getByTestId('location-search-input')).toBeVisible({ timeout: 15000 });
}



