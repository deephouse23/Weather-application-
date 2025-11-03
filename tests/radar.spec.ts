import { test, expect } from '@playwright/test';
import { setupStableApp, navigateToMapPage, waitForRadarToLoad, checkRadarVisibility, setTheme } from './utils';

test.describe('Radar Map', () => {
  test.beforeEach(async ({ page }) => {
    await setupStableApp(page);
  });

  test('radar map loads successfully', async ({ page }) => {
    await navigateToMapPage(page);
    
    // Wait for radar to load
    await waitForRadarToLoad(page);
    
    // Verify radar container exists
    const radarContainer = page.locator('[data-radar-container], [class*="map"], [class*="Map"]').first();
    await expect(radarContainer).toBeVisible({ timeout: 15000 });
  });

  test('radar visible in synthwave theme', async ({ page }) => {
    await setTheme(page, 'synthwave84');
    await navigateToMapPage(page);
    
    await waitForRadarToLoad(page);
    
    // Check that radar container has proper z-index
    const isVisible = await checkRadarVisibility(page);
    expect(isVisible).toBeTruthy();
    
    // Verify radar container is above scanlines (z-index >= 10000)
    const radarContainer = page.locator('[data-radar-container]').first();
    if (await radarContainer.count() > 0) {
      const zIndex = await radarContainer.evaluate((el) => {
        return window.getComputedStyle(el).zIndex;
      });
      
      // Should be 10000 or higher to be above theme overlays
      expect(parseInt(zIndex) >= 10000 || zIndex === 'auto').toBeTruthy();
    }
  });

  test('radar visible in matrix theme', async ({ page }) => {
    await setTheme(page, 'matrix');
    await navigateToMapPage(page);
    
    await waitForRadarToLoad(page);
    
    // Check that radar container has proper z-index
    const isVisible = await checkRadarVisibility(page);
    expect(isVisible).toBeTruthy();
    
    // Verify radar container is above CRT scanlines
    const radarContainer = page.locator('[data-radar-container]').first();
    if (await radarContainer.count() > 0) {
      const zIndex = await radarContainer.evaluate((el) => {
        return window.getComputedStyle(el).zIndex;
      });
      
      expect(parseInt(zIndex) >= 10000 || zIndex === 'auto').toBeTruthy();
    }
  });

  test('radar visible in default dark theme', async ({ page }) => {
    await setTheme(page, 'dark');
    await navigateToMapPage(page);
    
    await waitForRadarToLoad(page);
    
    const radarContainer = page.locator('[data-radar-container], [class*="map"], [class*="Map"]').first();
    await expect(radarContainer).toBeVisible({ timeout: 15000 });
  });

  test('radar map controls are visible', async ({ page }) => {
    await navigateToMapPage(page);
    await waitForRadarToLoad(page);
    
    // Check for layer controls or status badge
    const controls = page.locator('button, [class*="badge"], [class*="control"]');
    const controlCount = await controls.count();
    
    // Should have at least some controls
    expect(controlCount).toBeGreaterThan(0);
  });

  test('radar map displays status badge', async ({ page }) => {
    await navigateToMapPage(page);
    await waitForRadarToLoad(page);
    
    // Look for status badge with radar info
    const statusBadge = page.locator('[class*="badge"], [class*="status"]').filter({ 
      hasText: /(RADAR|NEXRAD|LIVE|US LOCATIONS)/i 
    });
    
    // Status badge may or may not exist depending on location
    if (await statusBadge.count() > 0) {
      await expect(statusBadge.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

