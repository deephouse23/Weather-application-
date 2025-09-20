// Simple test to see if the app starts at all

const { test, expect } = require('@playwright/test');

test('app starts without crashing', async ({ page }) => {
  // Set a longer timeout for this test
  test.setTimeout(60000);
  
  console.log('Attempting to load homepage...');
  
  // Try to go to the homepage
  const response = await page.goto('http://localhost:3000', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  
  console.log('Response status:', response?.status());
  
  // Check if we got a successful response
  expect(response?.status()).toBeLessThan(400);
  
  // Check if the page has some expected content
  const title = await page.title();
  console.log('Page title:', title);
  expect(title).toBeTruthy();
  
  // Wait a bit and check if page is still responsive
  await page.waitForTimeout(2000);
  
  // Try to find the search input (basic functionality check)
  const searchInput = page.locator('input[placeholder*="location"]');
  const inputCount = await searchInput.count();
  console.log('Found search inputs:', inputCount);
  
  console.log('✓ App started successfully!');
});
