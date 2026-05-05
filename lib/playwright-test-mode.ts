import type { NextRequest } from 'next/server';

/**
 * NODE_ENV values that are permitted to activate the Playwright test-mode
 * bypass.  We use an explicit allowlist instead of a blocklist so that
 * unexpected / misconfigured environments (e.g. Vercel preview deploys with
 * NODE_ENV empty or "development") don't accidentally enable the bypass.
 */
const ALLOWED_NODE_ENVS = new Set(['development', 'test']);

/**
 * Client-safe check: is the current NODE_ENV permitted for Playwright bypass?
 * Useful in 'use client' components that can't import the server-only
 * isPlaywrightTestModeRequest() (which requires NextRequest).
 *
 * process.env.NODE_ENV is inlined at build time by webpack/Next.js, so this
 * is safe to call on the client.
 */
export function isPlaywrightTestModeAllowedEnv(): boolean {
  return ALLOWED_NODE_ENVS.has(process.env.NODE_ENV ?? '');
}

/**
 * Determines whether the current request should be treated as a Playwright
 * test-mode bypass.
 *
 * SECURITY RULES (any one falsy → entire check returns false):
 *   1. Environment must explicitly opt in via PLAYWRIGHT_TEST_MODE=true
 *   2. NODE_ENV must be "development" or "test" (explicit allowlist)
 *   3. Request must originate from localhost OR be in a trusted CI environment
 *      (CI environments are locked to header-based opt-in so they can't be
 *      triggered by external traffic).
 *
 * The localhost guard on non-CI requests means that even if the env var is
 * accidentally set on a staging/Vercel preview deploy, the bypass cannot be
 * triggered by remote clients.
 */
export function isPlaywrightTestModeRequest(request: NextRequest): boolean {
  const isExplicitTestEnv =
    process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE === 'true' ||
    process.env.PLAYWRIGHT_TEST_MODE === 'true';

  const isAllowedNodeEnv = ALLOWED_NODE_ENVS.has(process.env.NODE_ENV ?? '');

  // Without both flags, never allow bypass
  if (!isExplicitTestEnv || !isAllowedNodeEnv) {
    return false;
  }

  // Check request origin — localhost requests are safe (local dev / E2E runner)
  const host = request.headers.get('host') ?? '';
  const origin = request.headers.get('origin') ?? '';
  const isLocalhostRequest =
    /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host) ||
    /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(origin);

  if (isLocalhostRequest) {
    return true;
  }

  // CI environments can only activate bypass via an explicit header/cookie
  // AND only when CI is a real build/test system (GitHub Actions), NOT a
  // hosting platform like Vercel where VERCEL=1 is present on preview deploys
  // that serve real user traffic.
  const isCI = process.env.CI === 'true';

  // Explicitly exclude Vercel preview/production — these serve real traffic.
  // VERCEL_ENV is "production" | "preview" | "development" on Vercel.
  const isVercelServingTraffic =
    process.env.VERCEL === '1' &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV !== 'development');

  if (isVercelServingTraffic) {
    return false;
  }

  const hasTestIndicator =
    request.headers.get('x-playwright-test-mode') === 'true' ||
    request.cookies.get('playwright-test-mode')?.value === 'true';

  return isCI && hasTestIndicator;
}

/**
 * Loud warning if PLAYWRIGHT_TEST_MODE is enabled outside development/testing.
 * Call this once at module load (e.g. in instrumentation or next.config) so it
 * fires during startup — impossible to miss in logs.
 *
 * In production/preview deployments this throws to prevent the server from
 * starting with auth bypasses active.  In all other cases it logs a warning.
 */
export function warnIfPlaywrightTestModeMisconfigured(): void {
  const isTestMode =
    process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE === 'true' ||
    process.env.PLAYWRIGHT_TEST_MODE === 'true';

  if (!isTestMode) return;

  const env = process.env.NODE_ENV ?? 'undefined';
  const vercelEnv = process.env.VERCEL_ENV; // "production" | "preview" | "development"
  const allowed = env === 'development' || env === 'test';

  // Extra guard: even if NODE_ENV is development/test, block on Vercel
  // preview/production because those serve real traffic.
  const isVercelServingTraffic = vercelEnv === 'production' || vercelEnv === 'preview';

  if (!allowed || isVercelServingTraffic) {
    const msg =
      `[SECURITY] PLAYWRIGHT_TEST_MODE is enabled but NODE_ENV="${env}"` +
      (vercelEnv ? `, VERCEL_ENV="${vercelEnv}"` : '') +
      '. This should NEVER happen in production or preview deployments. ' +
      'Auth bypass is active — disable PLAYWRIGHT_TEST_MODE immediately.';

    // In production-like environments, throw to prevent server startup.
    // In unknown environments, log loudly but don't crash (e.g. local dev
    // with a stale .env).
    if (env === 'production' || isVercelServingTraffic) {
      throw new Error(msg);
    }
    console.error(msg);
  } else {
    console.warn(
      `[E2E] Playwright test mode active (NODE_ENV="${env}"). ` +
      'Auth bypasses are enabled for local/CI testing.'
    );
  }
}

// Auto-fire the warning on import, but only when NODE_ENV is not "test"
// (test environments manipulate env vars and expect the module to load cleanly).
// For test environments, call warnIfPlaywrightTestModeMisconfigured() explicitly
// after setting up env vars, or simply don't import this module at the top level.
if (process.env.NODE_ENV !== 'test') {
  warnIfPlaywrightTestModeMisconfigured();
}