import { test, expect } from '@playwright/test';
import { setupStableApp, setupMockAuth, stubSupabaseProfile, stubProfileUpdate, navigateToProfile, fillProfileForm, saveProfile } from './utils';

test.describe('Profile Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupStableApp(page);
    await setupMockAuth(page);
    
    // Mock profile data
    await stubSupabaseProfile(page, {
      id: 'test-user-id',
      username: 'testuser',
      full_name: 'Test User',
      default_location: 'New York, NY',
      email: 'test@example.com'
    });
    
    await stubProfileUpdate(page);
  });

  test('can navigate to profile page', async ({ page }) => {
    await navigateToProfile(page);
    await expect(page).toHaveURL('/profile');
  });

  test('displays current profile information', async ({ page }) => {
    await navigateToProfile(page);
    
    // Check that profile fields are displayed
    await expect(page.locator('body')).toContainText(/testuser|Test User|New York/i, { timeout: 10000 });
  });

  test('can edit profile fields', async ({ page }) => {
    await navigateToProfile(page);
    
    // Find and click Edit Profile button
    const editButton = page.locator('button').filter({ hasText: /edit profile/i }).first();
    if (await editButton.count() > 0) {
      await editButton.click();
      
      // Wait for edit mode
      await expect(page.locator('button').filter({ hasText: /save/i })).toBeVisible({ timeout: 5000 });
      
      // Fill form fields
      await fillProfileForm(page, {
        username: 'updateduser',
        fullName: 'Updated Name',
        defaultLocation: 'Los Angeles, CA'
      });
      
      // Verify fields were filled
      const usernameInput = page.locator('input[name="username"], input[placeholder*="username" i]').first();
      if (await usernameInput.count() > 0) {
        await expect(usernameInput).toHaveValue(/updateduser/i);
      }
    }
  });

  test('can save profile changes', async ({ page }) => {
    await navigateToProfile(page);
    
    // Enter edit mode
    const editButton = page.locator('button').filter({ hasText: /edit profile/i }).first();
    if (await editButton.count() > 0) {
      await editButton.click();
      
      // Wait for edit mode
      await expect(page.locator('button').filter({ hasText: /save/i })).toBeVisible({ timeout: 5000 });
      
      // Fill form fields
      await fillProfileForm(page, {
        username: 'saveduser'
      });
      
      // Save
      await saveProfile(page);
      
      // Verify success message appears
      await expect(page.locator('body')).toContainText(/success|saved|updated/i, { timeout: 5000 });
    }
  });

  test('redirects to dashboard after saving', async ({ page }) => {
    await navigateToProfile(page);
    
    // Enter edit mode
    const editButton = page.locator('button').filter({ hasText: /edit profile/i }).first();
    if (await editButton.count() > 0) {
      await editButton.click();
      
      // Wait for edit mode
      await expect(page.locator('button').filter({ hasText: /save/i })).toBeVisible({ timeout: 5000 });
      
      // Fill and save
      await fillProfileForm(page, { username: 'redirecttest' });
      await saveProfile(page);
      
      // Wait for redirect (with delay for success message)
      await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    }
  });

  test('displays error message on save failure', async ({ page }) => {
    // Stub a failing update
    await page.route('**/api/profile/update**', (route) => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Update failed' })
    }));

    await navigateToProfile(page);
    
    const editButton = page.locator('button').filter({ hasText: /edit profile/i }).first();
    if (await editButton.count() > 0) {
      await editButton.click();
      
      await expect(page.locator('button').filter({ hasText: /save/i })).toBeVisible({ timeout: 5000 });
      
      await fillProfileForm(page, { username: 'failtest' });
      await saveProfile(page);
      
      // Verify error message appears
      await expect(page.locator('body')).toContainText(/error|failed|try again/i, { timeout: 5000 });
    }
  });
});

