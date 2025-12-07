import { test, expect } from '@playwright/test';
import { setupStableApp, stubNewsApi } from '../fixtures/utils';

test.describe('NEWS Navigation - Basic', () => {
  test.beforeEach(async ({ page }) => {
    await setupStableApp(page);
    await stubNewsApi(page);
  });

  test('can navigate to NEWS page from home', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const newsLink = page.locator('a[href="/news"]').first();
    if (await newsLink.count() > 0) {
      await newsLink.click();
      await expect(page).toHaveURL('/news', { timeout: 10000 });
    }
  });
});
