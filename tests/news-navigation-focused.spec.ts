import { test, expect } from '@playwright/test';
import { setupStableApp } from './utils';

test.describe('NEWS Navigation Issue Debug', () => {
  test.beforeEach(async ({ page }) => {
    await setupStableApp(page);
  });
  test('direct NEWS page navigation test', async ({ page }) => {
    // Go directly to NEWS page
    await page.goto('/news');
    
    // Wait for header to render to confirm load
    await expect(page.locator('h1').filter({ hasText: /16-BIT WEATHER NEWS/i })).toBeVisible();
    
    console.log('Current URL after 5s:', await page.url());
    console.log('Page title:', await page.title());
    
    // Check if any errors occurred
    const errors = [];
    page.on('pageerror', msg => {
      errors.push(msg.message);
    });
    
    // Check for loading indicators
    const loadingElements = page.locator('text=/loading/i');
    const loadingCount = await loadingElements.count();
    console.log('Loading elements found:', loadingCount);
    
    // Try to click home link
    const homeLinks = page.locator('a[href="/"]');
    const homeLinkCount = await homeLinks.count();
    console.log('Home links found:', homeLinkCount);
    
    if (homeLinkCount > 0) {
      const homeLink = homeLinks.first();
      console.log('Attempting to click home link...');
      await homeLink.click();
      
      // Wait and see what URL we end up at
      await expect(page).toHaveURL('/');
      console.log('URL after clicking home:', await page.url());
    }
    
    if (errors.length > 0) {
      console.log('JavaScript errors found:', errors);
    }
  });

  test('test navigation from different pages', async ({ page }) => {
    // Start from home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Weather|16/i);
    console.log('Started at:', await page.url());
    
    // Navigate to ABOUT first (known working page)
    const aboutLink = page.locator('a[href="/about"]');
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      await expect(page).toHaveURL('/about');
      console.log('About page URL:', await page.url());
      
      // From ABOUT, try to go to NEWS
      const newsLink = page.locator('a[href="/news"]');
      if (await newsLink.count() > 0) {
        await newsLink.click();
        await expect(page).toHaveURL('/news');
        console.log('News page URL from ABOUT:', await page.url());
        
        // Try to go back to ABOUT
        const aboutLinkFromNews = page.locator('a[href="/about"]');
        if (await aboutLinkFromNews.count() > 0) {
          await aboutLinkFromNews.click();
          await expect(page).toHaveURL('/about');
          console.log('Back to ABOUT URL:', await page.url());
        }
      }
    }
  });
});