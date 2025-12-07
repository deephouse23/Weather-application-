import { test, expect } from '@playwright/test';
import { setupStableApp, setupMockAuth, stubSupabaseProfile } from '../fixtures/utils';

test.describe('Authentication - Sign Out', () => {
    test.beforeEach(async ({ page }) => {
        // 1. Setup app
        await setupStableApp(page);

        // 2. Setup Mock Auth (Logged In State)
        await setupMockAuth(page);
        await stubSupabaseProfile(page, {
            id: 'test-user-id',
            username: 'testuser',
            full_name: 'Test User'
        });

        // 3. Go to Dashboard (requires auth)
        await page.goto('/dashboard');
        await page.waitForTimeout(1000);
    });

    test('successfully signs out and updates UI immediately', async ({ page }) => {
        // Verify we are logged in first
        await expect(page.locator('button').filter({ hasText: /testuser/i })).toBeVisible();

        // Click User Menu -> Sign Out
        await page.locator('button').filter({ hasText: /testuser/i }).click();
        const signOutButton = page.locator('button').filter({ hasText: /sign out/i });
        await expect(signOutButton).toBeVisible();

        // Override the auth mock TO SIMULATE SERVER-SIDE LOGOUT
        // This ensures that when the app reloads/checks session, it gets a "not authenticated" response
        await page.route('**/auth/v1/**', async (route) => {
            const url = route.request().url();
            // Allow logout endpoint to succeed
            if (url.includes('/logout')) {
                return route.fulfill({ status: 200, body: '{}' });
            }
            // All other auth requests (getSession, getUser, etc.) return 401
            return route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'not_authenticated', error_description: 'Not authenticated' })
            });
        });

        // CRITICAL: Add init script to clear localStorage on reload
        // setupMockAuth adds an init script that RESTORES the session on every load
        // We must counteract this to test the "logged out" state persistency
        await page.addInitScript(() => {
            Object.keys(window.localStorage).forEach(key => {
                if (key.startsWith('sb-') || key.includes('supabase')) {
                    window.localStorage.removeItem(key);
                }
            });
        });

        // Perform Sign Out
        await signOutButton.click();

        // CRITICAL: Expect Immediate Redirect to Home
        await expect(page).toHaveURL('/', { timeout: 10000 });

        // CRITICAL: Expect UI to update immediately (Login button appears)
        await expect(page.locator('a[href="/auth/login"]')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('button').filter({ hasText: /testuser/i })).not.toBeVisible();

        // CRITICAL: Expect Protected Route to be inaccessible
        await page.goto('/dashboard');
        // Should be redirected back to login or home
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
    });
});
