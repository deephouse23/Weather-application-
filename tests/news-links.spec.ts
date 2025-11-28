import { test, expect } from '@playwright/test';
import { setupStableApp } from './utils';

test.describe('News Page Links', () => {
  test.beforeEach(async ({ page }) => {
    await setupStableApp(page);
  });

  test('should not have broken links', async ({ page }) => {
    await page.goto('/news', { waitUntil: 'domcontentloaded' });

    // Wait for the news articles to load
    await page.waitForSelector('[data-testid^="news-article-"]');

    // Get all news article links
    const articleLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('[data-testid^="news-article-"] a'));
      return links.map(link => (link as HTMLAnchorElement).href);
    });

    // Remove duplicate links
    const uniqueLinks = [...new Set(articleLinks)];

    // Check each link
    for (const link of uniqueLinks) {
      if (link.startsWith('mailto:')) {
        continue;
      }
      
      const response = await page.request.head(link);
      expect(response.status()).not.toBe(404);
    }
  });
});
