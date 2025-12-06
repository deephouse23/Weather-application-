# Playwright Test Maintenance Guide

## Quick Reference

### Running Tests

```bash
# Run all tests
npx playwright test

# Run with visible browser (debugging)
npx playwright test --headed

# Run specific test file
npx playwright test tests/news-links.spec.ts

# Run with verbose output
npx playwright test --reporter=list

# Run multiple times to check for flakiness
npx playwright test --repeat-each=3

# Generate HTML report
npx playwright test --reporter=html
npx playwright show-report
```

---

## Test Files Overview

| File | Purpose | Status |
|------|---------|--------|
| `news-links.spec.ts` | Validates news article links | FIXED - Updated selectors |
| `news-navigation-focused.spec.ts` | Basic news page navigation | Should pass |
| `news-page.spec.ts` | News page smoke test | Should pass |
| `weather-app.spec.ts` | Core weather functionality | Should pass |
| `profile.spec.ts` | User profile management | May need auth timing adjustments |
| `radar.spec.ts` | Weather radar map tests | Should pass |
| `themes.spec.ts` | Theme switching/persistence | Should pass |

---

## Common Issues & Fixes

### 1. Selector Not Found
**Symptom:** Test times out waiting for element
**Fix:** Update selector to match current DOM structure or add data-testid

### 2. Timing Issues
**Symptom:** Flaky tests that sometimes pass
**Fix:** Add proper waits:
```typescript
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible({ timeout: 15000 });
```

### 3. Auth Mock Failures
**Symptom:** Redirected to login unexpectedly
**Fix:** Ensure `setupMockAuth()` is called before navigation

### 4. External Link Failures
**Symptom:** 404 or network errors on link checks
**Fix:** Skip external URLs or use mocked responses

---

## Data-TestId Attributes

These data-testid attributes are confirmed to exist:

- `location-search-input` - Weather search input
- `temperature-value` - Current temperature display
- `global-error` - Error message container

### Recommended Additions

Add to components for better test coverage:

```tsx
// NewsCard.tsx
<Card data-testid={`news-article-${item.id}`}>

// NewsGrid.tsx
<div data-testid="news-grid">

// Weather map
<div data-testid="radar-container" data-radar-container>
```

---

## CI/CD Considerations

### Playwright Config Optimizations

```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 60000,           // 60s per test
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  expect: {
    timeout: 15000,         // 15s for assertions
  },
});
```

### Environment Variables

Ensure these are set in CI:
- `PLAYWRIGHT_TEST_MODE=true`
- `NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE=true`

---

## Test Utilities (tests/utils.ts)

Key helpers available:

- `setupStableApp(page)` - Initialize app with mocked APIs
- `stubNewsApi(page)` - Mock news feed responses
- `setupMockAuth(page)` - Mock authentication
- `setTheme(page, theme)` - Apply theme
- `navigateToMapPage(page)` - Navigate to radar map
- `waitForRadarToLoad(page)` - Wait for map initialization

---

## Maintenance Schedule

- **Before each PR:** Run `npx playwright test`
- **Weekly:** Run with `--repeat-each=3` to catch flakes
- **Monthly:** Review and clean up skipped tests
- **After major UI changes:** Audit data-testid coverage
