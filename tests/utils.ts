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
  // Set up route mocking BEFORE any navigation
  // Mock Supabase auth.getSession() response - this is critical for middleware
  await page.route('**/auth/v1/token**', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: userId,
          email: 'test@example.com',
          aud: 'authenticated',
          role: 'authenticated',
        }
      })
    });
  });

  // Mock Supabase auth.getUser() response
  await page.route('**/auth/v1/user**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      user: {
        id: userId,
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
      }
    })
  }));

  // Mock Supabase auth.getSession() endpoint (used by middleware)
  // This is critical - middleware calls this server-side
  await page.route('**/auth/v1/**', (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    
    // Handle GET /auth/v1/user - get current user
    if (url.pathname.includes('/user') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: userId,
            email: 'test@example.com',
            aud: 'authenticated',
            role: 'authenticated',
          }
        })
      });
    }
    
    // Handle any session-related requests (middleware calls getSession)
    if (url.pathname.includes('/session') || url.pathname.includes('/token') || url.searchParams.has('grant_type')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: userId,
            email: 'test@example.com',
            aud: 'authenticated',
            role: 'authenticated',
          }
        })
      });
    }
    
    route.continue();
  });

  // Mock Supabase client responses via localStorage (must be done before page loads)
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

  // Set auth cookies for middleware BEFORE navigation
  // These cookies are read by the server-side middleware
  try {
    // Use localhost for CI/local development
    const domain = 'localhost';
    
    await page.context().addCookies([{
      name: 'sb-access-token',
      value: 'mock-access-token',
      domain: domain,
      path: '/',
    }, {
      name: 'sb-refresh-token',
      value: 'mock-refresh-token',
      domain: domain,
      path: '/',
    }, {
      // Supabase SSR also uses these cookie names
      name: `sb-${domain}-auth-token`,
      value: JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
        token_type: 'bearer',
      }),
      domain: domain,
      path: '/',
    }]);
  } catch (e) {
    // If cookies can't be set, continue - route mocking should handle it
    // But this might cause middleware failures
  }
  
  // Wait a bit to ensure init scripts and cookies are ready
  await page.waitForTimeout(200);
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
  // Set theme in localStorage first (for persistence)
  await page.addInitScript((data) => {
    localStorage.setItem('weather-edu-theme', data.theme);
    localStorage.setItem('weather-theme', data.theme);
  }, { theme });
  
  // Apply theme directly to the document (works after page load)
  await page.evaluate((themeName) => {
    const root = document.documentElement;
    const body = document.body;
    
    // All possible theme classes
    const allThemes = [
      'dark', 'miami', 'tron', 'atari2600', 'monochromeGreen',
      '8bitClassic', '16bitSnes', 'synthwave84', 'tokyoNight',
      'dracula', 'cyberpunk', 'matrix'
    ];
    
    // Remove all theme classes
    allThemes.forEach(t => {
      root.classList.remove(t);
      body.classList.remove(`theme-${t}`);
      root.classList.remove(`theme-${t}`);
    });
    
    // Apply new theme
    root.setAttribute('data-theme', themeName);
    root.classList.add(themeName);
    body.classList.add(`theme-${themeName}`);
    
    // Save to localStorage
    try {
      localStorage.setItem('weather-edu-theme', themeName);
      localStorage.setItem('weather-theme', themeName);
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Force style recalculation
    const display = root.style.display;
    root.style.display = 'none';
    root.offsetHeight; // Trigger reflow
    root.style.display = display;
    
    // Also dispatch a storage event to notify theme provider if it's listening
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'weather-edu-theme',
        newValue: themeName,
        storageArea: localStorage
      }));
    } catch (e) {
      // Ignore if StorageEvent not supported
    }
  }, theme);
  
  // Wait for theme to be applied and any theme provider effects to complete
  await page.waitForTimeout(300);
  
  // Verify theme was applied (retry if needed)
  let attempts = 0;
  while (attempts < 3) {
    const currentTheme = await getCurrentTheme(page);
    if (currentTheme === theme) {
      break;
    }
    // Re-apply if theme wasn't set correctly
    await page.evaluate((themeName) => {
      document.documentElement.setAttribute('data-theme', themeName);
      document.documentElement.classList.add(themeName);
      document.body.classList.add(`theme-${themeName}`);
    }, theme);
    await page.waitForTimeout(100);
    attempts++;
  }
}

export async function getCurrentTheme(page: Page): Promise<string> {
  return await page.evaluate(() => {
    // Check data-theme attribute first (most reliable)
    const dataTheme = document.documentElement.getAttribute('data-theme');
    if (dataTheme) return dataTheme;
    
    // Check localStorage
    const storedTheme = localStorage.getItem('weather-edu-theme') || 
                       localStorage.getItem('weather-theme');
    if (storedTheme) return storedTheme;
    
    // Check body classes
    const bodyClasses = document.body.className;
    const themeMatch = bodyClasses.match(/theme-(\w+)/);
    if (themeMatch) return themeMatch[1];
    
    // Default fallback
    return 'dark';
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
  // Wait for radar container to exist
  const radarContainer = page.locator('[data-radar-container]').first();
  try {
    await radarContainer.waitFor({ timeout: 10000, state: 'attached' });
  } catch (e) {
    // If radar container doesn't exist, check for map elements
    const mapElement = page.locator('[class*="map"], [class*="Map"], [class*="radar"], [class*="Radar"]').first();
    if (await mapElement.count() === 0) {
      return false;
    }
    // Check visibility of map element
    const isVisible = await mapElement.isVisible().catch(() => false);
    return isVisible;
  }
  
  // Check if radar container is visible
  const isVisible = await radarContainer.isVisible().catch(() => false);
  if (!isVisible) {
    return false;
  }
  
  // Check if radar container has proper z-index or is not obscured
  const visibility = await radarContainer.evaluate((el) => {
    const style = window.getComputedStyle(el);
    const zIndex = style.zIndex;
    const backdropFilter = style.backdropFilter;
    const opacity = style.opacity;
    const display = style.display;
    const visibility = style.visibility;
    
    // Element is visible if:
    // 1. z-index is high enough OR auto (which means it's in normal flow)
    // 2. backdrop-filter is none (not obscured by theme overlays)
    // 3. opacity > 0
    // 4. display !== 'none'
    // 5. visibility !== 'hidden'
    const hasGoodZIndex = zIndex === 'auto' || parseInt(zIndex) >= 10000;
    const hasNoBackdropFilter = backdropFilter === 'none' || backdropFilter === '';
    const isOpaque = parseFloat(opacity) > 0;
    const isDisplayed = display !== 'none';
    const isVisible = visibility !== 'hidden';
    
    return hasGoodZIndex && hasNoBackdropFilter && isOpaque && isDisplayed && isVisible;
  });
  
  return visibility;
}

// ═══════════════════════════════════════════════════════════
//   PROFILE HELPERS
//   ═══════════════════════════════════════════════════════════

export async function navigateToProfile(page: Page): Promise<void> {
  // Note: setupMockAuth() MUST be called BEFORE calling this function
  // It should be called in beforeEach or before navigation
  
  // Navigate to profile page
  await page.goto('/profile', { waitUntil: 'networkidle' });
  
  // Wait for any redirects or auth checks to complete
  await page.waitForTimeout(500);
  
  // Check if redirected to login
  const url = page.url();
  if (url.includes('/auth/login')) {
    // Wait a bit more for auth context to initialize
    await page.waitForTimeout(1000);
    const finalUrl = page.url();
    
    if (finalUrl.includes('/auth/login')) {
      // Still on login page - this indicates auth mocking failed
      throw new Error(
        'Profile page redirected to login - authentication not properly mocked.\n' +
        `Final URL: ${finalUrl}\n` +
        'Make sure setupMockAuth() is called in beforeEach BEFORE calling navigateToProfile().'
      );
    }
  }
  
  // Wait for profile page to fully load (auth context initialization)
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



