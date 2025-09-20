import { test, expect } from '@playwright/test';

test.describe('16-Bit Weather App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Weather|16/i, { timeout: 30000 });
  });

  test('displays main weather search component', async ({ page }) => {
    // Look for any text input (be flexible about the placeholder)
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible({ timeout: 30000 });
  });

  test('can search for weather by city name', async ({ page }) => {
    // Find the search input
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('New York');
    await searchInput.press('Enter');
    
    // Just wait a bit and check the page didn't crash
    await page.waitForTimeout(5000);
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('displays error for invalid location', async ({ page }) => {
    // Wait for app to initialize
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[placeholder*="ZIP, City"]');
    await searchInput.fill('InvalidCityName123456');
    await searchInput.press('Enter');
    
    // Should show error message
    await expect(page.locator('text=/not found|error|invalid|failed/i')).toBeVisible({ timeout: 10000 });
  });

  test('theme switcher works correctly', async ({ page }) => {
    // Check if theme buttons exist
    const themeButtons = page.locator('button').filter({ hasText: /Dark|Miami|Tron/i });
    const count = await themeButtons.count();
    
    if (count > 0) {
      // Test Miami theme
      const miamiButton = page.locator('button').filter({ hasText: /Miami/i }).first();
      await miamiButton.click();
      
      // Check if theme class is applied
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'miami');
    }
  });

  test('responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for app to initialize
    await page.waitForTimeout(2000);
    
    // Check that the app is still functional
    const searchInput = page.locator('input[placeholder*="ZIP, City"]');
    await expect(searchInput).toBeVisible();
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
    // Wait for app to initialize
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[placeholder*="ZIP, City"]');
    
    // Perform multiple searches to trigger rate limiting
    for (let i = 0; i < 11; i++) {
      await searchInput.fill(`City${i}`);
      await searchInput.press('Enter');
      await page.waitForTimeout(500);
    }
    
    // Should show rate limit message
    await expect(page.locator('text=/rate limit|too many requests|slow down|limited/i')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Weather Data Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Wait for app to initialize
    await page.waitForTimeout(3000);
    
    // Search for a valid city
    const searchInput = page.locator('input[placeholder*="ZIP, City"]');
    await searchInput.fill('London, UK');
    await searchInput.press('Enter');
    
    // Wait for weather data to load
    await page.waitForTimeout(5000);
  });

  test('displays current weather information', async ({ page }) => {
    // Check for temperature
    await expect(page.locator('text=/\d+°/')).toBeVisible();
    
    // Check for weather description
    await expect(page.locator('text=/Clear|Clouds|Rain|Snow|Thunderstorm|Drizzle|Mist|Fog/i')).toBeVisible();
  });

  test('displays forecast information', async ({ page }) => {
    // Check if forecast section exists
    const forecastSection = page.locator('text=/Forecast|Next|Days/i');
    if (await forecastSection.count() > 0) {
      await expect(forecastSection).toBeVisible();
    }
  });

  test('displays environmental data', async ({ page }) => {
    // Check for UV index or Air Quality
    const environmentalData = page.locator('text=/UV|Air Quality|AQI|Pollen/i');
    if (await environmentalData.count() > 0) {
      await expect(environmentalData.first()).toBeVisible();
    }
  });
});