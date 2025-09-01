import { test, expect } from '@playwright/test';

test('Debug: Capture app structure', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');
  
  // Wait for the page to load
  await page.waitForTimeout(3000);
  
  // Take a screenshot
  await page.screenshot({ path: 'test-results/app-screenshot.png', fullPage: true });
  
  // Get page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Get all input elements
  const inputs = await page.locator('input').all();
  console.log('Found', inputs.length, 'input elements');
  
  for (let i = 0; i < inputs.length; i++) {
    const placeholder = await inputs[i].getAttribute('placeholder');
    const type = await inputs[i].getAttribute('type');
    const name = await inputs[i].getAttribute('name');
    const id = await inputs[i].getAttribute('id');
    console.log(`Input ${i}: type="${type}", placeholder="${placeholder}", name="${name}", id="${id}"`);
  }
  
  // Get all buttons
  const buttons = await page.locator('button').all();
  console.log('Found', buttons.length, 'button elements');
  
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    console.log(`Button ${i}: "${text?.trim()}"`);
  }
  
  // Get main content
  const mainContent = await page.locator('main').textContent();
  console.log('Main content preview:', mainContent?.substring(0, 200));
  
  // Check for any error messages
  const bodyText = await page.locator('body').textContent();
  if (bodyText?.includes('error') || bodyText?.includes('Error')) {
    console.log('Found error text in body');
  }
});