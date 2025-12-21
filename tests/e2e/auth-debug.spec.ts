import { test, expect } from '@playwright/test';

test.describe('Auth Button Debugging', () => {
    test('login button should be visible and navigate to login page when unauthenticated', async ({ page }) => {
        // Navigate to home page
        await page.goto('/');

        // Ensure we are logged out (clear storage if needed, though incognito should be fresh)
        await page.evaluate(() => {
            window.localStorage.removeItem('supabase.auth.token');
        });

        // Select the login button
        const loginBtn = page.getByRole('link', { name: /LOGIN/i });
        const spinner = page.locator('.animate-spin');
        const userBtn = page.getByText('USER');

        if (await spinner.count() > 0) {
            console.log('Spinner is visible');
        }
        if (await userBtn.count() > 0) {
            console.log('User button is visible');
        }
        if (await loginBtn.count() === 0) {
            console.log('Login button NOT found');
            // console.log(await page.content()); // Too verbose for now
        }

        // Check visibility
        await expect(loginBtn).toBeVisible({ timeout: 5000 });

        // Check if it's clickable and navigates
        await loginBtn.click();
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('login button on About page should be visible and work', async ({ page }) => {
        // Navigate to About page (where we added Nav recently)
        await page.goto('/about');

        const loginBtn = page.getByRole('link', { name: /LOGIN/i });
        await expect(loginBtn).toBeVisible({ timeout: 10000 });

        await loginBtn.click();
        await expect(page).toHaveURL(/\/auth\/login/);
    });
});
