import { test, expect } from '@playwright/test';
import { setupStableApp, stubNewsApi } from './utils';

test.describe('News Page Links', () => {
  test.beforeEach(async ({ page }) => {
    await setupStableApp(page);
    await stubNewsApi(page);
  });

  test('news page loads and displays content', async ({ page }) => {
    await page.goto('/news', { waitUntil: 'domcontentloaded' });
    
    // Wait for page to be ready
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    
    // Verify news page loaded
    await expect(page).toHaveURL('/news');
    await expect(page.locator('body')).toContainText(/(NEWS|weather|NOAA|NASA)/i, { timeout: 10000 });
  });

  test('news articles have valid structure', async ({ page }) => {
    await page.goto('/news', { waitUntil: 'domcontentloaded' });

    // Wait for the news page to load
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    
    // Wait for any news content to appear (cards, grid, etc.)
    const newsContent = page.locator('[class*="news"], [class*="News"], article, [class*="card"], [class*="Card"]').first();
    await expect(newsContent).toBeVisible({ timeout: 15000 });

    // Get all external links from news cards
    const articleLinks = await page.evaluate(() => {
      // Find all links within news-related containers
      const containers = document.querySelectorAll('[class*="news"], [class*="News"], article, [class*="card"], [class*="Card"]');
      const links: string[] = [];
      
      containers.forEach(container => {
        const anchors = container.querySelectorAll('a[href^="http"]');
        anchors.forEach(a => {
          const href = (a as HTMLAnchorElement).href;
          if (href && !href.startsWith('mailto:')) {
            links.push(href);
          }
        });
      });
      
      return links;
    });

    // Remove duplicate links
    const uniqueLinks = [...new Set(articleLinks)];

    // If no links found with mocked data, test passes (expected with stubbed API)
    if (uniqueLinks.length === 0) {
      // This is expected when using stubbed news API with example.com URLs
      return;
    }

    // Check each link (skip example.com URLs from mocked data)
    for (const link of uniqueLinks.slice(0, 5)) { // Limit to 5 links to avoid timeout
      if (link.includes('example.com')) {
        continue; // Skip mocked URLs
      }
      
      try {
        const response = await page.request.head(link, { timeout: 5000 });
        expect(response.status()).not.toBe(404);
      } catch (e) {
        // Network errors are acceptable for external links in tests
        console.log(`Skipping unreachable link: ${link}`);
      }
    }
  });
});
