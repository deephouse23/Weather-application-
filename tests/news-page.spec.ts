import { test, expect } from '@playwright/test';
import { setupStableApp, stubNewsApi } from './utils';

test.describe('NEWS Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupStableApp(page);
    await stubNewsApi(page);
  });

  test('NEWS page loads and displays content correctly', async ({ page }) => {
    // Navigate directly to NEWS page
    await page.goto('/news', { waitUntil: 'domcontentloaded' });

    // Verify we're on NEWS page
    await expect(page).toHaveURL('/news', { timeout: 10000 });

    // Verify main headline is visible
    await expect(page.locator('h1').filter({ hasText: /16-BIT WEATHER NEWS/i })).toBeVisible({ timeout: 10000 });

    // Verify subtitle is present
    await expect(page.locator('p').filter({ hasText: /Real-time weather news/i })).toBeVisible();
  });

  test('NEWS page search and filter UI is functional', async ({ page }) => {
    await page.goto('/news', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').filter({ hasText: /16-BIT WEATHER NEWS/i })).toBeVisible({ timeout: 10000 });

    // Check for search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Check for category tabs
    const allTab = page.locator('button').filter({ hasText: /^ALL$/i });
    await expect(allTab).toBeVisible();

    // Check for refresh button
    const refreshButton = page.locator('button[title*="Refresh"]');
    await expect(refreshButton).toBeVisible();
  });

  test('NEWS page navigation links are present', async ({ page }) => {
    await page.goto('/news', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').filter({ hasText: /16-BIT WEATHER NEWS/i })).toBeVisible({ timeout: 10000 });

    // Check for home link in navigation
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();

    // Check that the link has valid href
    await expect(homeLink).toHaveAttribute('href', '/');
  });

  test('NEWS page displays news section headers', async ({ page }) => {
    await page.goto('/news', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').filter({ hasText: /16-BIT WEATHER NEWS/i })).toBeVisible({ timeout: 10000 });

    // Wait for news content to load (with generous timeout for API calls)
    await page.waitForTimeout(3000);

    // Check for news section header (either "LATEST NEWS", "X ARTICLES FOUND", or "FEATURED STORY")
    const newsHeaders = page.locator('h2');
    const headerCount = await newsHeaders.count();

    // Should have at least one h2 header (news section or featured story)
    expect(headerCount).toBeGreaterThan(0);

    // Verify at least one news-related header exists
    const newsHeader = page.locator('h2').filter({ hasText: /(LATEST NEWS|ARTICLES? FOUND|FEATURED STORY)/i });
    await expect(newsHeader.first()).toBeVisible({ timeout: 10000 });
  });
});