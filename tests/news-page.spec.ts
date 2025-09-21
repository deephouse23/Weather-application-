import { test, expect } from '@playwright/test';
import { setupStableApp } from './utils';

test.describe('NEWS Page Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupStableApp(page);
  });
  test('can navigate to NEWS page and back to other pages', async ({ page }) => {
    // Start on home page
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Navigate to NEWS page
    const newsLink = page.locator('a[href="/news"]');
    await expect(newsLink).toBeVisible();
    await newsLink.click();
    
    // Verify we're on NEWS page
    await expect(page).toHaveURL('/news');
    await expect(page.locator('h1').filter({ hasText: /16-BIT NEWS/i })).toBeVisible();
    
    // Wait for page to load completely
    await page.waitForTimeout(3000);
    
    // Test navigation back to HOME
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    
    // Verify we can navigate back to home
    await expect(page).toHaveURL('/');
    await page.waitForTimeout(2000);
    
    // Test navigation to other pages from NEWS
    await page.goto('/news');
    await page.waitForTimeout(3000);
    
    // Test ABOUT navigation
    const aboutLink = page.locator('a[href="/about"]');
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      await expect(page).toHaveURL('/about');
      await page.waitForTimeout(1000);
    }
    
    // Test GAMES navigation
    await page.goto('/news');
    await page.waitForTimeout(3000);
    const gamesLink = page.locator('a[href="/games"]');
    if (await gamesLink.count() > 0) {
      await gamesLink.click();
      await expect(page).toHaveURL('/games');
    }
  });

  test('NEWS page headline links work correctly', async ({ page }) => {
    await page.goto('/news');
    await page.waitForTimeout(3000);
    
    // Check that headline links exist and are clickable
    const headlineLinks = page.locator('a[target="_blank"]').filter({ hasText: /weather|alerts|climate/i });
    const linkCount = await headlineLinks.count();
    
    if (linkCount > 0) {
      // Test first headline link
      const firstLink = headlineLinks.first();
      await expect(firstLink).toBeVisible();
      
      // Verify it has proper attributes
      await expect(firstLink).toHaveAttribute('target', '_blank');
      await expect(firstLink).toHaveAttribute('rel', 'noopener noreferrer');
      
      // Verify it has a valid href
      const href = await firstLink.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    }
  });

  test('NEWS page loads without blocking navigation', async ({ page }) => {
    // Navigate to NEWS page
    await page.goto('/news');
    
    // Wait for initial load
    await page.waitForTimeout(1000);
    
    // Immediately try to navigate away - this should not be blocked
    const homeLink = page.locator('a[href="/"]');
    await homeLink.click();
    
    // Should successfully navigate without getting stuck
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('NEWS page displays all required sections', async ({ page }) => {
    await page.goto('/news');
    await page.waitForTimeout(3000);
    
    // Check for main sections
    await expect(page.locator('h1').filter({ hasText: /16-BIT NEWS/i })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: /WEATHER ALERTS/i })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: /ENVIRONMENTAL/i })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: /CLIMATE/i })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: /LATEST HEADLINES/i })).toBeVisible();
  });
});