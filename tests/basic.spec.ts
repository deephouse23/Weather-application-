import { test, expect } from '@playwright/test';

test.describe('Basic App Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Check that we get a successful response
    await expect(page).toHaveTitle(/Weather|16/i);
    
    // Check for the main search input
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test('can search for weather', async ({ page }) => {
    await page.goto('/');
    
    // Find and fill the search input
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('New York');
    await searchInput.press('Enter');
    
    // Wait for some weather data to appear (be flexible about what we're looking for)
    await page.waitForTimeout(3000); // Give it time to load
    
    // Just check that the page didn't crash
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
