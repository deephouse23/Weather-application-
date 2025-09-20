# Testing Guide for 16-Bit Weather Application

## Overview

This application uses a multi-layered testing approach:
- **Unit Tests**: Jest + React Testing Library for component and function testing
- **E2E Tests**: Playwright for end-to-end browser testing
- **CI/CD**: GitHub Actions for automated testing on every push and PR

## Quick Start

### Running Tests Locally

**Windows:**
```cmd
run-tests.cmd
```

**Mac/Linux:**
```bash
./run-tests.sh
```

**Using npm scripts:**
```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

## Environment Setup

### 1. Test Environment Variables

The application now handles missing Supabase credentials gracefully. Tests use placeholder values defined in `.env.test`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key-for-testing
NEXT_PUBLIC_OPENWEATHER_API_KEY=test-api-key
```

### 2. Local Testing

Before running tests locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install --with-deps
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm run test:e2e
   ```

## GitHub Actions Setup

### Required Secrets

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

**Optional but Recommended:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_OPENWEATHER_API_KEY` - Your OpenWeatherMap API key

**For Vercel Deployment Tests:**
- `VERCEL_TOKEN` - Your Vercel authentication token
- `VERCEL_PROJECT_ID` - Your Vercel project ID
- `VERCEL_ORG_ID` - Your Vercel organization ID

If these secrets are not set, the tests will use placeholder values and skip authentication-related features.

### Workflow Files

1. **`.github/workflows/e2e-local.yml`** - Runs on every push/PR, builds locally
2. **`.github/workflows/playwright.yml`** - Runs on PRs, tests against Vercel preview
3. **`.github/workflows/e2e-preview.yml`** - Runs after Vercel deployment

## Troubleshooting

### Common Issues

#### 1. Supabase Client Errors

**Problem:** `Error: Your project's URL and Key are required to create a Supabase client!`

**Solution:** The middleware and Supabase clients have been updated to handle missing environment variables. Make sure you've pulled the latest changes.

#### 2. Tests Timing Out

**Problem:** `Error: Timed out waiting 120000ms from config.webServer`

**Solution:** 
- Ensure the build completes successfully: `npm run build`
- Check if port 3000 is available
- Increase timeout in `playwright.config.ts` if needed

#### 3. Missing Environment Variables in CI

**Problem:** Tests fail in GitHub Actions due to missing API keys

**Solution:** Either:
- Add the secrets to your GitHub repository (recommended)
- Or rely on the placeholder values (tests will skip features requiring real APIs)

### Running Specific Tests

```bash
# Run a specific test file
npx playwright test tests/weather-app.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in a specific browser
npx playwright test --project=chromium

# Run only tests matching a pattern
npx playwright test -g "weather search"
```

## Test Coverage

### Unit Tests (Jest)
- Weather API functions
- Location services
- Cache services
- Air quality utilities
- Component rendering
- User interactions
- Error handling
- Accessibility

### E2E Tests (Playwright)
- Weather search functionality
- Theme switching
- Navigation
- Rate limiting
- Responsive design
- Error states
- Environmental data display

## Best Practices

1. **Always test locally before pushing** - Use `run-tests.cmd` or `run-tests.sh`
2. **Keep tests independent** - Each test should be able to run in isolation
3. **Use meaningful test names** - Describe what the test verifies
4. **Mock external services** - Don't rely on real APIs in unit tests
5. **Test error cases** - Ensure the app handles failures gracefully

## Debugging Failed Tests

### Local Debugging

1. **View test report:**
   ```bash
   npx playwright show-report
   ```

2. **Run in debug mode:**
   ```bash
   npm run test:e2e:debug
   ```

3. **Use Playwright UI:**
   ```bash
   npm run test:e2e:ui
   ```

### CI Debugging

1. Check the GitHub Actions logs
2. Download test artifacts (playwright-report) from the Actions tab
3. Review screenshots and traces in the artifacts

## Adding New Tests

### Unit Test Template

```typescript
// __tests__/my-feature.test.tsx
import { describe, test, expect } from '@jest/globals';

describe('MyFeature', () => {
  test('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### E2E Test Template

```typescript
// tests/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('MyFeature', () => {
  test('should do something', async ({ page }) => {
    // Navigate
    await page.goto('/');
    
    // Interact
    await page.click('button#my-button');
    
    // Assert
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

## Continuous Improvement

- Monitor test execution times
- Keep test coverage above 70%
- Review and update tests when features change
- Add visual regression tests for UI consistency
- Consider performance testing for critical paths

## Support

If you encounter issues not covered here:
1. Check the [Playwright documentation](https://playwright.dev/)
2. Review the [Jest documentation](https://jestjs.io/)
3. Open an issue in the GitHub repository
