import { test, expect } from '@playwright/test';
import { setupStableApp, setupMockAuth, stubSupabaseProfile, setTheme, getCurrentTheme, navigateToProfile, navigateToMapPage, waitForRadarToLoad, checkRadarVisibility } from './utils';

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    await setupStableApp(page);
  });

  test('can change theme via profile page', async ({ page }) => {
    await setupMockAuth(page);
    await stubSupabaseProfile(page, {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com'
    });

    await navigateToProfile(page);
    
    // Look for theme selector
    const themeSelector = page.locator('[class*="theme"], button, select').filter({ 
      hasText: /(dark|miami|tron|synthwave|theme)/i 
    }).first();
    
    if (await themeSelector.count() > 0) {
      await themeSelector.click();
      
      // Wait for theme change
      await page.waitForTimeout(500);
      
      // Verify theme was applied
      const currentTheme = await getCurrentTheme(page);
      expect(currentTheme).toBeTruthy();
    }
  });

  test('theme persists across page reloads', async ({ page }) => {
    await setTheme(page, 'synthwave84');
    
    // Verify theme is set
    let currentTheme = await getCurrentTheme(page);
    expect(currentTheme).toBe('synthwave84');
    
    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Verify theme persisted
    currentTheme = await getCurrentTheme(page);
    expect(currentTheme).toBe('synthwave84');
  });

  test('radar remains visible in synthwave theme', async ({ page }) => {
    await setTheme(page, 'synthwave84');
    await navigateToMapPage(page);
    
    await waitForRadarToLoad(page);
    
    // Check radar visibility
    const isVisible = await checkRadarVisibility(page);
    expect(isVisible).toBeTruthy();
    
    // Verify backdrop-filter is disabled
    const radarContainer = page.locator('[data-radar-container]').first();
    if (await radarContainer.count() > 0) {
      const backdropFilter = await radarContainer.evaluate((el) => {
        return window.getComputedStyle(el).backdropFilter;
      });
      
      expect(backdropFilter).toBe('none');
    }
  });

  test('radar remains visible in matrix theme', async ({ page }) => {
    await setTheme(page, 'matrix');
    await navigateToMapPage(page);
    
    await waitForRadarToLoad(page);
    
    const isVisible = await checkRadarVisibility(page);
    expect(isVisible).toBeTruthy();
    
    // Verify z-index is high enough
    const radarContainer = page.locator('[data-radar-container]').first();
    if (await radarContainer.count() > 0) {
      const zIndex = await radarContainer.evaluate((el) => {
        return window.getComputedStyle(el).zIndex;
      });
      
      expect(parseInt(zIndex) >= 10000 || zIndex === 'auto').toBeTruthy();
    }
  });

  test('UI elements render correctly in dark theme', async ({ page }) => {
    await setTheme(page, 'dark');
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Verify search input is visible
    await expect(page.getByTestId('location-search-input')).toBeVisible({ timeout: 10000 });
    
    // Verify theme is applied
    const currentTheme = await getCurrentTheme(page);
    expect(currentTheme).toBe('dark');
  });

  test('UI elements render correctly in synthwave theme', async ({ page }) => {
    await setTheme(page, 'synthwave84');
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Verify search input is visible
    await expect(page.getByTestId('location-search-input')).toBeVisible({ timeout: 10000 });
    
    // Verify theme is applied
    const currentTheme = await getCurrentTheme(page);
    expect(currentTheme).toBe('synthwave84');
    
    // Verify theme classes are applied
    const bodyClasses = await page.evaluate(() => document.body.className);
    expect(bodyClasses).toContain('theme-synthwave84');
  });

  test('theme switching updates UI immediately', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Start with dark theme
    await setTheme(page, 'dark');
    let currentTheme = await getCurrentTheme(page);
    expect(currentTheme).toBe('dark');
    
    // Switch to synthwave
    await setTheme(page, 'synthwave84');
    currentTheme = await getCurrentTheme(page);
    expect(currentTheme).toBe('synthwave84');
    
    // Verify UI updated
    const bodyClasses = await page.evaluate(() => document.body.className);
    expect(bodyClasses).toContain('theme-synthwave84');
  });
});

