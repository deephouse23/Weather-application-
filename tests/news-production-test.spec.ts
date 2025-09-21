import { test, expect } from '@playwright/test';
import { setupStableApp } from './utils';

test.describe('NEWS Page Production Issues', () => {
  test.beforeEach(async ({ page }) => {
    await setupStableApp(page);
  });
  test('check for hydration and rendering issues', async ({ page }) => {
    // Monitor console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Monitor network failures
    const networkErrors = [];
    page.on('requestfailed', request => {
      networkErrors.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    // Navigate to NEWS page
    await page.goto('/news');
    
    // Wait for potential hydration issues
    await page.waitForTimeout(5000);
    
    console.log('Console errors:', consoleErrors);
    console.log('Network errors:', networkErrors);
    
    // Check for React hydration mismatches
    const hydrationErrors = consoleErrors.filter(error => 
      error.includes('hydration') || 
      error.includes('mismatch') || 
      error.includes('server') ||
      error.includes('client')
    );
    
    if (hydrationErrors.length > 0) {
      console.log('Hydration issues detected:', hydrationErrors);
    }
    
    // Check if page is actually rendered
    const mainContent = await page.locator('body').textContent();
    console.log('Page loaded successfully:', mainContent?.includes('16-BIT NEWS'));
    
    // Test immediate navigation (the critical issue)
    const startTime = Date.now();
    const homeLink = page.locator('a[href="/"]').first();
    await homeLink.click();
    
    // Check how long navigation takes
    await page.waitForURL('/', { timeout: 10000 });
    const navigationTime = Date.now() - startTime;
    console.log('Navigation time (ms):', navigationTime);
    
    // Navigation should be fast in CI/build; allow more headroom in dev
    expect(navigationTime).toBeLessThan(6000);
  });

  test('check for blocking event listeners or infinite loops', async ({ page }) => {
    // Navigate to NEWS page
    await page.goto('/news');
    await page.waitForTimeout(2000);
    
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
      return new Promise(resolve => {
        setTimeout(() => {
          observer.disconnect();
          resolve(count);
        }, 3000);
      });
    });
    
    console.log('DOM mutations in 3 seconds:', mutationCount);
    
    // Excessive mutations (>100) might indicate infinite re-renders
    if (mutationCount > 100) {
      console.log('WARNING: Excessive DOM mutations detected, possible infinite re-render');
    }
  });
});