# CI Failure Analysis - PR #133

**Date:** November 16, 2025
**Branch:** `fix/playwright-tests`
**Status:** ❌ Tests failing in CI (passing locally with issues)

---

## Failure Summary

Both Playwright test workflows failed after ~11-12 minutes:

| Workflow | Status | Duration |
|----------|--------|----------|
| Playwright Tests (Minimal) | ❌ FAIL | 11m48s |
| e2e-local-prod | ❌ FAIL | 11m40s |

**Other checks:**
- ✅ GitGuardian Security - PASS
- ✅ Vercel Deploy - PASS

---

## Root Cause Analysis

### Problem: Middleware Test Mode Not Working in CI

The middleware test mode bypass (`PLAYWRIGHT_TEST_MODE`) is configured incorrectly:

**Current Implementation:**
```typescript
// playwright.config.ts
webServer: {
  command: process.env.CI ? 'npm run start' : 'npm run dev',
  env: {
    PLAYWRIGHT_TEST_MODE: 'true', // ❌ Only available to webServer process
  },
}
```

**Issue:**
- The `env` object in `webServer` only sets the variable for the Playwright webServer wrapper
- When `npm run start` executes, Next.js doesn't see this environment variable
- Middleware checks still block protected routes → tests fail

---

## Solutions

### Option 1: Set ENV in GitHub Actions Workflow (RECOMMENDED)

Update `.github/workflows/playwright.yml`:

```yaml
- name: Run Playwright tests
  env:
    PLAYWRIGHT_TEST_MODE: 'true'  # Add this
  run: npx playwright test
```

**Pros:**
- Cleanest solution
- Explicit test mode declaration in CI
- Works for all commands (build, start, dev)

**Cons:**
- Requires workflow file changes

---

### Option 2: Prefix Command with ENV Variable

```typescript
// playwright.config.ts
webServer: {
  command: process.env.CI
    ? 'PLAYWRIGHT_TEST_MODE=true npm run start'  // Set inline
    : 'PLAYWRIGHT_TEST_MODE=true npm run dev',
}
```

**Pros:**
- No workflow changes needed
- Works immediately

**Cons:**
- Doesn't work on Windows (Git Bash may handle it)
- Less explicit

---

### Option 3: Use .env.test File

Create `.env.test`:
```
PLAYWRIGHT_TEST_MODE=true
```

Update `playwright.config.ts`:
```typescript
webServer: {
  command: process.env.CI
    ? 'NODE_ENV=test npm run start'
    : 'NODE_ENV=test npm run dev',
}
```

Update `next.config.mjs` to load `.env.test`.

**Pros:**
- Cross-platform
- Cleaner separation

**Cons:**
- More complex setup
- Need to ensure `.env.test` is loaded

---

## Recommended Fix (Quick)

**Update playwright.config.ts:**

```typescript
webServer: hasExternalBaseUrl
  ? undefined
  : {
      command: process.env.CI
        ? 'cross-env PLAYWRIGHT_TEST_MODE=true npm run start'
        : 'cross-env PLAYWRIGHT_TEST_MODE=true npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
```

**Install cross-env:**
```bash
npm install --save-dev cross-env
```

**Why cross-env?**
- Works on all platforms (Windows, Linux, macOS)
- Simple and reliable
- Industry standard for cross-platform env vars

---

## Alternative: Check for CI Environment

Instead of a separate test mode, detect CI automatically:

```typescript
// middleware.ts
const isTestMode = process.env.CI === 'true' ||
                   process.env.PLAYWRIGHT_TEST_MODE === 'true' ||
                   request.cookies.get('playwright-test-mode')?.value === 'true'
```

**Pros:**
- Works immediately in all CI environments
- No configuration changes needed

**Cons:**
- Less explicit
- Could accidentally disable auth in CI if not careful

---

## Test Failure Details (Estimated)

Based on timing and configuration:

### Likely Failures:
1. **Profile Tests** (6 tests) - 401/redirect to /auth/login
2. **Theme Tests** (2-3 tests) - Can't access /profile to change themes
3. **Possibly Radar Tests** - If they navigate to protected routes

### Likely Passing:
1. **Weather App Tests** - Public pages
2. **News Tests** - Public pages
3. **Radar Tests** - If they use public pages

---

## Next Actions

### Immediate (to fix CI):

**Option A: Quick Fix (5 minutes)**
1. Install cross-env: `npm install --save-dev cross-env`
2. Update playwright.config.ts with cross-env command
3. Commit and push
4. Wait for CI (~12 minutes)

**Option B: Workflow Fix (10 minutes)**
1. Check if `.github/workflows/playwright.yml` exists
2. Add `PLAYWRIGHT_TEST_MODE: 'true'` to env section
3. Commit and push
4. Wait for CI

**Option C: Auto-detect CI (2 minutes)**
1. Update middleware.ts to check `process.env.CI`
2. Commit and push
3. Wait for CI

---

## Long-term Recommendations

1. **Add E2E test environment file** - `.env.test` with test-specific configs
2. **Separate test database** - Don't use production Supabase in tests
3. **Mock external services** - Complete mocking of all APIs (already doing this)
4. **Add test coverage reporting** - Track which tests pass/fail over time

---

## Local vs CI Differences

| Aspect | Local | CI |
|--------|-------|-----|
| ENV variable propagation | Works | Doesn't work |
| Test mode | Sometimes works | Fails |
| Build artifacts | `.next` directory | Clean build |
| Timing | Faster | Slower |

---

## Risk Assessment

**Risk of Test Mode Bypass:**
- 🟢 **LOW** - Only activates when explicit env var set
- 🟢 **LOW** - Production doesn't set `PLAYWRIGHT_TEST_MODE`
- 🟢 **LOW** - Middleware still checks for valid session in production
- 🟡 **MEDIUM** - If someone sets CI=true in production, auth bypassed

**Mitigation:**
- Never set `PLAYWRIGHT_TEST_MODE` or `CI=true` in production `.env`
- Add explicit check: `if (process.env.NODE_ENV === 'production') return`
- Monitor for unauthorized access

---

## Estimated Fix Time

| Solution | Implementation | Testing | Total |
|----------|----------------|---------|-------|
| cross-env | 5 min | 12 min | 17 min |
| Workflow env | 10 min | 12 min | 22 min |
| Auto-detect CI | 2 min | 12 min | 14 min |

**Recommended:** Auto-detect CI (fastest, safest)

---

## Summary

**Problem:** Middleware test mode bypass not working in CI
**Cause:** Environment variable not propagating to Next.js application
**Solution:** Update middleware to detect CI environment OR use cross-env
**Impact:** 37 tests likely failing due to auth redirects
**ETA to fix:** 14-22 minutes

---

**Next Step:** Choose solution and implement

