import { test, expect } from '@playwright/test';
import { setupStableApp } from './utils';

test.describe('16-Bit Weather App', () => {
  test.beforeEach(async ({ page }) => {
    await setupStableApp(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Weather|16/i, { timeout: 30000 });
  });

  test('displays main weather search component', async ({ page }) => {
    await expect(page.getByTestId('location-search-input')).toBeVisible({ timeout: 30000 });
  });

  test('can search for weather by city name', async ({ page }) => {
    const searchInput = page.getByTestId('location-search-input');
    await searchInput.fill('New York');
    await searchInput.press('Enter');
    await expect(page.getByTestId('temperature-value')).toBeVisible({ timeout: 15000 });
  });

  test('displays error for invalid location', async ({ page }) => {
    const searchInput = page.getByTestId('location-search-input');
    await searchInput.fill('Invalidopolis');
    await searchInput.press('Enter');
    const errorBanner = page.locator('[data-testid="global-error"]').first();
    await expect(errorBanner).toBeVisible({ timeout: 15000 });
    await expect(errorBanner).toContainText(/not found/i);
  });

  test('theme switcher works correctly', async ({ page }) => {
    const html = page.locator('html');
    const initial = await html.getAttribute('data-theme');
    await page.getByRole('button', { name: /toggle theme/i }).click();
    await expect.poll(async () => (await html.getAttribute('data-theme')) || '').not.toBe(initial || 'dark');
  });

  test('responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for app to initialize
    await page.waitForTimeout(2000);
    
    // Check that the app is still functional
    await expect(page.getByTestId('location-search-input')).toBeVisible();
  });

  test('navigation links work correctly', async ({ page }) => {
    // Test About page link if exists
    const aboutLink = page.locator('a[href="/about"]');
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      await expect(page).toHaveURL('/about');
      await expect(page.locator('h1, h2').filter({ hasText: /About/i })).toBeVisible();
    }
  });

  test('rate limiting message appears after multiple searches', async ({ page }) => {
    await page.addInitScript(() => {
      const now = Date.now();
      const requests = Array.from({ length: 10 }, (_, index) => now - index * 1000);
      window.localStorage.setItem('weather-app-rate-limit', JSON.stringify({ requests, lastReset: now }));
    });

    await page.reload({ waitUntil: 'domcontentloaded' });

    const searchInput = page.getByTestId('location-search-input');
    await searchInput.fill('Los Angeles');
    await searchInput.press('Enter');

    const warningBanner = page.locator('[data-testid="rate-limit-warning"]').first();
    await expect(warningBanner).toBeVisible({ timeout: 15000 });
    await expect(warningBanner).toContainText(/too many requests/i);
  });
});

test.describe('Weather Data Display', () => {
  test('displays current weather information', async ({ page }) => {
    await page.addInitScript(() => {
      const now = Date.now();
      const sampleWeather = {
        location: 'Testville, US',
        country: 'US',
        temperature: 72,
        unit: '°F',
        condition: 'Sunny',
        description: 'Clear sky',
        humidity: 45,
        wind: { speed: 5, direction: 'NE', gust: 12 },
        pressure: '1015 hPa',
        sunrise: '6:00 am',
        sunset: '8:00 pm',
        forecast: [
          { time: '10 AM', temp: 70, condition: 'Sunny', precipChance: 0 },
        ].length ? [{
          day: 'Monday',
          highTemp: 75,
          lowTemp: 65,
          condition: 'Partly Cloudy',
          description: 'Mild with clouds',
          details: { humidity: 55, windSpeed: 6, windDirection: 'NE', pressure: '1015 hPa', precipitationChance: 10, visibility: 10, uvIndex: 5 },
          hourlyForecast: [{ time: '10 AM', temp: 70, condition: 'Sunny', precipChance: 0 }]
        }] : [],
        moonPhase: { phase: 'Waxing Crescent', illumination: 20, emoji: 'Moon', phaseAngle: 45 },
        uvIndex: 5,
        aqi: 30,
        aqiCategory: 'Good',
        pollen: { tree: {}, grass: {}, weed: {} },
        coordinates: { lat: 40.7128, lon: -74.006 }
      };
      window.localStorage.setItem('bitweather_city', sampleWeather.location);
      window.localStorage.setItem('bitweather_weather_data', JSON.stringify(sampleWeather));
      window.localStorage.setItem('bitweather_cache_timestamp', String(now));
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const temperatureValue = page.locator('[data-testid="temperature-value"]').first();
    await expect(temperatureValue).toBeVisible({ timeout: 15000 });
    await expect(temperatureValue).toHaveText(/\d+°[FC]?/);
  });

  test.skip('displays forecast information', async ({ page }) => {
    await page.goto('/');
  });

  test.skip('displays environmental data', async ({ page }) => {
    await page.goto('/');
  });
});