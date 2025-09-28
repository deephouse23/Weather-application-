import { test, expect } from '@playwright/test';

test.skip('external example test (skipped)', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});
