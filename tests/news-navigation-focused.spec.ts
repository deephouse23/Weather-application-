import { test, expect } from '@playwright/test';
import { setupStableApp } from './utils';

test.describe('NEWS Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupStableApp(page);
  });

  test('direct NEWS page navigation works', async ({ page }) => {
    // Go directly to NEWS page
    await page.goto('/news', { waitUntil: 'domcontentloaded' });
    
    // Wait for header to render to confirm load
    await expect(page.locator('h1').filter({ hasText: /16-BIT WEATHER NEWS/i })).toBeVisible({ timeout: 10000 });
    
    // Verify we're on NEWS page
    await expect(page).toHaveURL('/news');
    
    // Check if any errors occurred
    const errors: string[] = [];
    page.on('pageerror', msg => {
      errors.push(msg.message);
    });
    
    // Try to click home link
    const homeLinks = page.locator('a[href="/"]');
    const homeLinkCount = await homeLinks.count();
    
    expect(homeLinkCount).toBeGreaterThan(0);
    
    if (homeLinkCount > 0) {
      const homeLink = homeLinks.first();
      await homeLink.click();
      
      // Wait and see what URL we end up at
      await expect(page).toHaveURL('/', { timeout: 10000 });
    }
    
    // Should not have errors
    expect(errors.length).toBe(0);
  });

  test('navigation between pages works correctly', async ({ page }) => {
    // Start from home page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Weather|16/i);
    
    // Navigate to ABOUT first (known working page)
    const aboutLink = page.locator('a[href="/about"]');
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      await expect(page).toHaveURL('/about', { timeout: 10000 });
      
      // From ABOUT, try to go to NEWS
      const newsLink = page.locator('a[href="/news"]');
      if (await newsLink.count() > 0) {
        await newsLink.click();
        await expect(page).toHaveURL('/news', { timeout: 10000 });
        
        // Try to go back to ABOUT
        const aboutLinkFromNews = page.locator('a[href="/about"]');
        if (await aboutLinkFromNews.count() > 0) {
          await aboutLinkFromNews.click();
          await expect(page).toHaveURL('/about', { timeout: 10000 });
        }
      }
    }
  });
});