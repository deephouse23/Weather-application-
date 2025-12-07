import { test, expect } from '@playwright/test';
import { setupStableApp, stubNewsApi } from '../fixtures/utils';

test.describe('NEWS Page - Basic Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupStableApp(page);
    await stubNewsApi(page);
  });

  test('NEWS page loads', async ({ page }) => {
    await page.goto('/news', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL('/news', { timeout: 10000 });
    // Just verify page loads - don't check specific content
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });
});
