import { test, expect } from '@playwright/test';
import { setupStableApp } from './utils';

test.describe('NEWS Page Production Issues', () => {
  test.beforeEach(async ({ page }) => {
    await setupStableApp(page);
  });

  test('check for hydration and rendering issues', async ({ page }) => {
    // Monitor console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Monitor network failures
    const networkErrors: string[] = [];
    page.on('requestfailed', request => {
      networkErrors.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    // Navigate to NEWS page
    await page.goto('/news', { waitUntil: 'domcontentloaded' });
    
    // Wait for page to stabilize
    await expect(page.locator('h1').filter({ hasText: /16-BIT WEATHER NEWS/i })).toBeVisible({ timeout: 10000 });
    
    // Check for React hydration mismatches
    const hydrationErrors = consoleErrors.filter(error => 
      error.includes('hydration') || 
      error.includes('mismatch') || 
      error.includes('server') ||
      error.includes('client')
    );
    
    // Should not have hydration errors
    expect(hydrationErrors.length).toBe(0);
    
    // Check if page is actually rendered
    const mainContent = await page.locator('body').textContent();
    expect(mainContent).toContain('16-BIT');
    
    // Test navigation performance
    const startTime = Date.now();
    const homeLink = page.locator('a[href="/"]').first();
    await homeLink.click();
    
    // Check how long navigation takes
    await page.waitForURL('/', { timeout: 10000 });
    const navigationTime = Date.now() - startTime;
    
    // Navigation should be fast
    expect(navigationTime).toBeLessThan(6000);
  });

  test('check for blocking event listeners or infinite loops', async ({ page }) => {
    // Navigate to NEWS page
    await page.goto('/news', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').filter({ hasText: /16-BIT WEATHER NEWS/i })).toBeVisible({ timeout: 10000 });
    
    // Check for excessive re-renders by monitoring DOM mutations
    const mutationCount = await page.evaluate(() => {
      let count = 0;
      const observer = new MutationObserver(() => {
        count++;
      });
      
      observer.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      });
      
      // Wait 3 seconds and count mutations
      return new Promise<number>(resolve => {
        setTimeout(() => {
          observer.disconnect();
          resolve(count);
        }, 3000);
      });
    });
    
    // Excessive mutations (>100) might indicate infinite re-renders
    expect(mutationCount).toBeLessThan(100);
  });
});