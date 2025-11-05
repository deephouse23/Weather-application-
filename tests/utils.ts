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

// ═══════════════════════════════════════════════════════════
//   AUTHENTICATION HELPERS
//   ═══════════════════════════════════════════════════════════

export async function setupMockAuth(page: Page, userId: string = 'test-user-id'): Promise<void> {
  // Mock Supabase client responses
  await page.addInitScript((data) => {
    // Mock user session in localStorage (Supabase format)
    // Use a generic key format that Supabase client will recognize
    const session = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: data.userId,
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    };
    
    // Store in multiple possible Supabase localStorage keys
    // Supabase uses different key formats depending on version
    const possibleKeys = [
      'sb-auth-token',
      'supabase.auth.token',
      `sb-${window.location.hostname}-auth-token`,
    ];
    
    possibleKeys.forEach(key => {
      try {
        window.localStorage.setItem(key, JSON.stringify(session));
      } catch (e) {
        // Ignore errors
      }
    });
  }, { userId });

  // Mock Supabase auth.getUser() response
  await page.route('**/auth/v1/user**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      user: {
        id: userId,
        email: 'test@example.com',
      }
    })
  }));

  // Mock Supabase auth.getSession() response
  await page.route('**/auth/v1/**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/user')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: userId,
            email: 'test@example.com',
          }
        })
      });
    }
    route.continue();
  });
}

export async function stubSupabaseProfile(page: Page, profile: any): Promise<void> {
  // Mock Supabase profiles table queries
  await page.route('**/rest/v1/profiles**', async (route) => {
    const request = route.request();
    const method = request.method();
    
    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([profile])
      });
    }
    
    if (method === 'PATCH') {
      const url = new URL(request.url());
      const params = url.searchParams;
      const select = params.get('select');
      
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ ...profile, ...request.postDataJSON() }])
      });
    }
    
    route.continue();
  });

  // Mock preferences API
  await page.route('**/api/user/preferences**', (route) => {
    const method = route.request().method();
    
    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          preferences: {
            user_id: profile.id || 'test-user-id',
            auto_location: true,
            temperature_unit: 'fahrenheit',
            theme: 'dark'
          }
        })
      });
    }
    
    if (method === 'PUT') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          preferences: {
            user_id: profile.id || 'test-user-id',
            auto_location: true,
            temperature_unit: 'fahrenheit',
            theme: 'dark'
          }
        })
      });
    }
    
    route.continue();
  });
}

export async function stubProfileUpdate(page: Page): Promise<void> {
  // Mock Supabase profiles update
  await page.route('**/rest/v1/profiles**', async (route) => {
    const request = route.request();
    if (request.method() === 'PATCH') {
      const body = request.postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ 
          id: 'test-user-id', 
          ...body,
          updated_at: new Date().toISOString() 
        }])
      });
    }
    route.continue();
  });

  // Mock preferences update API
  await page.route('**/api/user/preferences**', async (route) => {
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          preferences: {
            user_id: 'test-user-id',
            ...body,
            updated_at: new Date().toISOString()
          }
        })
      });
    }
    route.continue();
  });
}

// ═══════════════════════════════════════════════════════════
//   THEME HELPERS
//   ═══════════════════════════════════════════════════════════

export async function setTheme(page: Page, theme: string): Promise<void> {
  await page.addInitScript((data) => {
    document.documentElement.setAttribute('data-theme', data.theme);
    document.body.className = `theme-${data.theme}`;
    localStorage.setItem('theme', data.theme);
  }, { theme });
}

export async function getCurrentTheme(page: Page): Promise<string> {
  return await page.evaluate(() => {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  });
}

// ═══════════════════════════════════════════════════════════
//   RADAR MAP HELPERS
//   ═══════════════════════════════════════════════════════════

export async function navigateToMapPage(page: Page): Promise<void> {
  await page.goto('/map', { waitUntil: 'domcontentloaded' });
  // Wait for map container to be visible
  await page.locator('[data-radar-container]').waitFor({ timeout: 10000 }).catch(() => {
    // If data-radar-container not found, wait for map to load
    return page.locator('[class*="map"], [class*="Map"]').first().waitFor({ timeout: 10000 });
  });
}

export async function waitForRadarToLoad(page: Page): Promise<void> {
  // Wait for radar container or map element
  await page.locator('[data-radar-container], [class*="map"], [class*="Map"]').first().waitFor({ timeout: 15000 });
}

export async function checkRadarVisibility(page: Page): Promise<boolean> {
  const radarContainer = page.locator('[data-radar-container]').first();
  if (await radarContainer.count() === 0) {
    return false;
  }
  
  // Check if radar container is visible and has proper z-index
  const zIndex = await radarContainer.evaluate((el) => {
    return window.getComputedStyle(el).zIndex;
  });
  
  return parseInt(zIndex) >= 10000 || zIndex === 'auto';
}

// ═══════════════════════════════════════════════════════════
//   PROFILE HELPERS
//   ═══════════════════════════════════════════════════════════

export async function navigateToProfile(page: Page): Promise<void> {
  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  // Wait for profile page to load or handle redirect
  // Check if redirected to login or if profile loaded
  const url = page.url();
  if (url.includes('/auth/login')) {
    // If redirected to login, that's a test failure scenario
    throw new Error('Profile page redirected to login - authentication not properly mocked');
  }
  // Wait for either profile content or loading state
  await page.waitForTimeout(1000);
}

export async function fillProfileForm(page: Page, fields: { username?: string; fullName?: string; defaultLocation?: string }): Promise<void> {
  if (fields.username) {
    const usernameInput = page.locator('input[name="username"], input[placeholder*="username" i]').first();
    if (await usernameInput.count() > 0) {
      await usernameInput.fill(fields.username);
    }
  }
  
  if (fields.fullName) {
    const fullNameInput = page.locator('input[name="fullName"], input[name="full_name"], input[placeholder*="full name" i]').first();
    if (await fullNameInput.count() > 0) {
      await fullNameInput.fill(fields.fullName);
    }
  }
  
  if (fields.defaultLocation) {
    const locationInput = page.locator('input[name="defaultLocation"], input[name="default_location"], input[placeholder*="location" i]').first();
    if (await locationInput.count() > 0) {
      await locationInput.fill(fields.defaultLocation);
    }
  }
}

export async function saveProfile(page: Page): Promise<void> {
  const saveButton = page.locator('button').filter({ hasText: /save/i }).first();
  await saveButton.click();
  // Wait for save to complete
  await page.waitForTimeout(500);
}



