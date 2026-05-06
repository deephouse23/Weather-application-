/**
 * Security tests for the Playwright test-mode bypass hardening.
 *
 * We test by manipulating process.env and constructing mock NextRequest
 * objects to verify all the security guards in isPlaywrightTestModeRequest()
 * and the startup warning function.
 */

/* eslint-disable @typescript-eslint/no-require-imports */

// We need to manage env vars carefully — save originals and restore after each test.
const originalEnv = { ...process.env };

// Helper to reset env between tests
function setEnv(vars: Record<string, string | undefined>) {
  // Clear all PLAYWRIGHT/CI/VERCEL vars first
  delete process.env.PLAYWRIGHT_TEST_MODE;
  delete process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE;
  delete process.env.NODE_ENV;
  delete process.env.CI;
  delete process.env.VERCEL;
  delete process.env.VERCEL_ENV;

  // Set the ones we want
  for (const [key, value] of Object.entries(vars)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }
}

// Minimal mock of NextRequest for testing
function makeMockRequest(options: {
  host?: string;
  origin?: string;
  headerTestMode?: boolean;
  cookieTestMode?: boolean;
}) {
  const headers = new Map<string, string>();
  if (options.host) headers.set('host', options.host);
  if (options.origin) headers.set('origin', options.origin);
  if (options.headerTestMode) headers.set('x-playwright-test-mode', 'true');

  const cookies = new Map<string, string>();
  if (options.cookieTestMode) cookies.set('playwright-test-mode', 'true');

  return {
    headers: {
      get: (name: string) => headers.get(name) ?? null,
    },
    cookies: {
      get: (name: string) => cookies.has(name) ? { value: cookies.get(name)! } : undefined,
    },
  } as any;
}

// We need to re-import the module after each env change to test the function,
// but Jest caches modules. Instead, we'll test the logic directly by
// calling the functions after manipulating process.env.

// Since the module auto-fires warnIfPlaywrightTestModeMisconfigured() on
// import (except in test), we set NODE_ENV=test before importing.
beforeEach(() => {
  // Reset to a safe baseline for each test
  setEnv({ NODE_ENV: 'test' });
});

afterEach(() => {
  // Restore all env vars
  process.env = { ...originalEnv };
});

describe('isPlaywrightTestModeRequest — NODE_ENV allowlist', () => {
  // We need to import after env is set. Since Jest caches modules,
  // we test by calling the function directly.
  // The module uses process.env.NODE_ENV at call time (not import time),
  // so we can manipulate it before each call.

  // Import once (cached) — the auto-fire is skipped because NODE_ENV=test
  let isPlaywrightTestModeRequest: typeof import('@/lib/playwright-test-mode')['isPlaywrightTestModeRequest'];

  beforeAll(() => {
    setEnv({ NODE_ENV: 'test' });
    const mod = require('@/lib/playwright-test-mode');
    isPlaywrightTestModeRequest = mod.isPlaywrightTestModeRequest;
  });

  it('should allow bypass when NODE_ENV=development and all conditions met', () => {
    setEnv({ NODE_ENV: 'development', PLAYWRIGHT_TEST_MODE: 'true' });
    const request = makeMockRequest({ host: 'localhost:3000' });
    expect(isPlaywrightTestModeRequest(request)).toBe(true);
  });

  it('should allow bypass when NODE_ENV=test and all conditions met', () => {
    setEnv({ NODE_ENV: 'test', PLAYWRIGHT_TEST_MODE: 'true' });
    const request = makeMockRequest({ host: 'localhost:3000' });
    expect(isPlaywrightTestModeRequest(request)).toBe(true);
  });

  it('should reject bypass when NODE_ENV=production', () => {
    setEnv({ NODE_ENV: 'production', PLAYWRIGHT_TEST_MODE: 'true' });
    const request = makeMockRequest({ host: 'localhost:3000' });
    expect(isPlaywrightTestModeRequest(request)).toBe(false);
  });

  it('should reject bypass when NODE_ENV is empty/unset', () => {
    setEnv({ PLAYWRIGHT_TEST_MODE: 'true' });
    delete process.env.NODE_ENV;
    const request = makeMockRequest({ host: 'localhost:3000' });
    expect(isPlaywrightTestModeRequest(request)).toBe(false);
  });

  it('should reject bypass when NODE_ENV is a non-allowed value like "staging"', () => {
    setEnv({ NODE_ENV: 'staging', PLAYWRIGHT_TEST_MODE: 'true' });
    const request = makeMockRequest({ host: 'localhost:3000' });
    expect(isPlaywrightTestModeRequest(request)).toBe(false);
  });
});

describe('isPlaywrightTestModeRequest — localhost guard', () => {
  let isPlaywrightTestModeRequest: typeof import('@/lib/playwright-test-mode')['isPlaywrightTestModeRequest'];

  beforeAll(() => {
    setEnv({ NODE_ENV: 'test' });
    const mod = require('@/lib/playwright-test-mode');
    isPlaywrightTestModeRequest = mod.isPlaywrightTestModeRequest;
  });

  it('should allow bypass from localhost', () => {
    setEnv({ NODE_ENV: 'development', PLAYWRIGHT_TEST_MODE: 'true' });
    const request = makeMockRequest({ host: 'localhost:3000' });
    expect(isPlaywrightTestModeRequest(request)).toBe(true);
  });

  it('should allow bypass from 127.0.0.1', () => {
    setEnv({ NODE_ENV: 'development', PLAYWRIGHT_TEST_MODE: 'true' });
    const request = makeMockRequest({ host: '127.0.0.1:3000' });
    expect(isPlaywrightTestModeRequest(request)).toBe(true);
  });

  it('should allow bypass from localhost origin', () => {
    setEnv({ NODE_ENV: 'development', PLAYWRIGHT_TEST_MODE: 'true' });
    const request = makeMockRequest({ origin: 'http://localhost:3000' });
    expect(isPlaywrightTestModeRequest(request)).toBe(true);
  });

  it('should reject bypass from remote host without CI', () => {
    setEnv({ NODE_ENV: 'development', PLAYWRIGHT_TEST_MODE: 'true' });
    const request = makeMockRequest({ host: 'staging.example.com' });
    expect(isPlaywrightTestModeRequest(request)).toBe(false);
  });
});

describe('isPlaywrightTestModeRequest — CI guard', () => {
  let isPlaywrightTestModeRequest: typeof import('@/lib/playwright-test-mode')['isPlaywrightTestModeRequest'];

  beforeAll(() => {
    setEnv({ NODE_ENV: 'test' });
    const mod = require('@/lib/playwright-test-mode');
    isPlaywrightTestModeRequest = mod.isPlaywrightTestModeRequest;
  });

  it('should allow bypass in CI with header from non-localhost', () => {
    setEnv({ NODE_ENV: 'test', PLAYWRIGHT_TEST_MODE: 'true', CI: 'true' });
    const request = makeMockRequest({ host: 'runner.example.com', headerTestMode: true });
    expect(isPlaywrightTestModeRequest(request)).toBe(true);
  });

  it('should allow bypass in CI with cookie from non-localhost', () => {
    setEnv({ NODE_ENV: 'test', PLAYWRIGHT_TEST_MODE: 'true', CI: 'true' });
    const request = makeMockRequest({ host: 'runner.example.com', cookieTestMode: true });
    expect(isPlaywrightTestModeRequest(request)).toBe(true);
  });

  it('should reject bypass in CI without header/cookie indicator', () => {
    setEnv({ NODE_ENV: 'test', PLAYWRIGHT_TEST_MODE: 'true', CI: 'true' });
    const request = makeMockRequest({ host: 'runner.example.com' });
    expect(isPlaywrightTestModeRequest(request)).toBe(false);
  });

  it('should reject bypass without CI flag from non-localhost', () => {
    setEnv({ NODE_ENV: 'test', PLAYWRIGHT_TEST_MODE: 'true' });
    delete process.env.CI;
    const request = makeMockRequest({ host: 'runner.example.com', headerTestMode: true });
    expect(isPlaywrightTestModeRequest(request)).toBe(false);
  });
});

describe('isPlaywrightTestModeRequest — Vercel guard', () => {
  let isPlaywrightTestModeRequest: typeof import('@/lib/playwright-test-mode')['isPlaywrightTestModeRequest'];

  beforeAll(() => {
    setEnv({ NODE_ENV: 'test' });
    const mod = require('@/lib/playwright-test-mode');
    isPlaywrightTestModeRequest = mod.isPlaywrightTestModeRequest;
  });

  it('should reject bypass on Vercel preview deploy (VERCEL=1, VERCEL_ENV=preview)', () => {
    setEnv({
      NODE_ENV: 'development',
      PLAYWRIGHT_TEST_MODE: 'true',
      VERCEL: '1',
      VERCEL_ENV: 'preview',
      CI: 'true',
    });
    const request = makeMockRequest({ host: 'preview.example.com', headerTestMode: true });
    expect(isPlaywrightTestModeRequest(request)).toBe(false);
  });

  it('should reject bypass on Vercel production deploy (VERCEL=1, VERCEL_ENV=production)', () => {
    setEnv({
      NODE_ENV: 'development',
      PLAYWRIGHT_TEST_MODE: 'true',
      VERCEL: '1',
      VERCEL_ENV: 'production',
      CI: 'true',
    });
    const request = makeMockRequest({ host: 'example.com', headerTestMode: true });
    expect(isPlaywrightTestModeRequest(request)).toBe(false);
  });

  it('should reject bypass on Vercel with missing VERCEL_ENV (defaults to serving traffic)', () => {
    setEnv({
      NODE_ENV: 'development',
      PLAYWRIGHT_TEST_MODE: 'true',
      VERCEL: '1',
      CI: 'true',
    });
    delete process.env.VERCEL_ENV;
    const request = makeMockRequest({ host: 'some.vercel.app', headerTestMode: true });
    expect(isPlaywrightTestModeRequest(request)).toBe(false);
  });

  it('should allow localhost bypass even on Vercel (local dev server)', () => {
    setEnv({
      NODE_ENV: 'development',
      PLAYWRIGHT_TEST_MODE: 'true',
      VERCEL: '1',
      VERCEL_ENV: 'preview',
    });
    // Localhost requests bypass the Vercel guard (they return true
    // before reaching the Vercel check in the function's control flow).
    const request = makeMockRequest({ host: 'localhost:3000' });
    expect(isPlaywrightTestModeRequest(request)).toBe(true);
  });
});

describe('isPlaywrightTestModeRequest — PLAYWRIGHT_TEST_MODE env var', () => {
  let isPlaywrightTestModeRequest: typeof import('@/lib/playwright-test-mode')['isPlaywrightTestModeRequest'];

  beforeAll(() => {
    setEnv({ NODE_ENV: 'test' });
    const mod = require('@/lib/playwright-test-mode');
    isPlaywrightTestModeRequest = mod.isPlaywrightTestModeRequest;
  });

  it('should accept NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE=true', () => {
    setEnv({ NODE_ENV: 'development', NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE: 'true' });
    const request = makeMockRequest({ host: 'localhost:3000' });
    expect(isPlaywrightTestModeRequest(request)).toBe(true);
  });

  it('should accept PLAYWRIGHT_TEST_MODE=true', () => {
    setEnv({ NODE_ENV: 'development', PLAYWRIGHT_TEST_MODE: 'true' });
    const request = makeMockRequest({ host: 'localhost:3000' });
    expect(isPlaywrightTestModeRequest(request)).toBe(true);
  });

  it('should reject when neither env var is set', () => {
    setEnv({ NODE_ENV: 'development' });
    delete process.env.PLAYWRIGHT_TEST_MODE;
    delete process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE;
    const request = makeMockRequest({ host: 'localhost:3000' });
    expect(isPlaywrightTestModeRequest(request)).toBe(false);
  });
});

describe('isPlaywrightTestModeAllowedEnv — client-safe helper', () => {
  let isPlaywrightTestModeAllowedEnv: typeof import('@/lib/playwright-test-mode')['isPlaywrightTestModeAllowedEnv'];

  beforeAll(() => {
    setEnv({ NODE_ENV: 'test' });
    const mod = require('@/lib/playwright-test-mode');
    isPlaywrightTestModeAllowedEnv = mod.isPlaywrightTestModeAllowedEnv;
  });

  it('should return true for NODE_ENV=development', () => {
    setEnv({ NODE_ENV: 'development' });
    expect(isPlaywrightTestModeAllowedEnv()).toBe(true);
  });

  it('should return true for NODE_ENV=test', () => {
    setEnv({ NODE_ENV: 'test' });
    expect(isPlaywrightTestModeAllowedEnv()).toBe(true);
  });

  it('should return false for NODE_ENV=production', () => {
    setEnv({ NODE_ENV: 'production' });
    expect(isPlaywrightTestModeAllowedEnv()).toBe(false);
  });

  it('should return false for NODE_ENV=staging', () => {
    setEnv({ NODE_ENV: 'staging' });
    expect(isPlaywrightTestModeAllowedEnv()).toBe(false);
  });

  it('should return false for empty NODE_ENV', () => {
    delete process.env.NODE_ENV;
    expect(isPlaywrightTestModeAllowedEnv()).toBe(false);
  });
});

describe('isPlaywrightTestModeAllowedEnv — hostname guard', () => {
  let isPlaywrightTestModeAllowedEnv: typeof import('@/lib/playwright-test-mode')['isPlaywrightTestModeAllowedEnv'];

  beforeAll(() => {
    setEnv({ NODE_ENV: 'test' });
    const mod = require('@/lib/playwright-test-mode');
    isPlaywrightTestModeAllowedEnv = mod.isPlaywrightTestModeAllowedEnv;
  });

  it('should allow localhost hostname when NODE_ENV=development', () => {
    setEnv({ NODE_ENV: 'development' });
    expect(isPlaywrightTestModeAllowedEnv('localhost')).toBe(true);
  });

  it('should allow 127.0.0.1 hostname when NODE_ENV=development', () => {
    setEnv({ NODE_ENV: 'development' });
    expect(isPlaywrightTestModeAllowedEnv('127.0.0.1')).toBe(true);
  });

  it('should allow [::1] hostname when NODE_ENV=development', () => {
    setEnv({ NODE_ENV: 'development' });
    expect(isPlaywrightTestModeAllowedEnv('[::1]')).toBe(true);
  });

  it('should reject non-localhost hostname even when NODE_ENV=development', () => {
    setEnv({ NODE_ENV: 'development' });
    expect(isPlaywrightTestModeAllowedEnv('staging.example.com')).toBe(false);
  });

  it('should reject non-localhost hostname even when NODE_ENV=test', () => {
    setEnv({ NODE_ENV: 'test' });
    expect(isPlaywrightTestModeAllowedEnv('preview.vercel.app')).toBe(false);
  });

  it('should fall back to NODE_ENV check when hostname is undefined', () => {
    setEnv({ NODE_ENV: 'development' });
    expect(isPlaywrightTestModeAllowedEnv(undefined)).toBe(true);
  });

  it('should fall back to NODE_ENV block when hostname is undefined and NODE_ENV=production', () => {
    setEnv({ NODE_ENV: 'production' });
    expect(isPlaywrightTestModeAllowedEnv(undefined)).toBe(false);
  });
});

describe('warnIfPlaywrightTestModeMisconfigured', () => {
  let warnIfPlaywrightTestModeMisconfigured: typeof import('@/lib/playwright-test-mode')['warnIfPlaywrightTestModeMisconfigured'];

  beforeAll(() => {
    setEnv({ NODE_ENV: 'test' });
    const mod = require('@/lib/playwright-test-mode');
    warnIfPlaywrightTestModeMisconfigured = mod.warnIfPlaywrightTestModeMisconfigured;
  });

  it('should throw when PLAYWRIGHT_TEST_MODE=true and NODE_ENV=production', () => {
    setEnv({ NODE_ENV: 'production', PLAYWRIGHT_TEST_MODE: 'true' });
    expect(() => warnIfPlaywrightTestModeMisconfigured()).toThrow(/SECURITY/);
  });

  it('should throw when PLAYWRIGHT_TEST_MODE=true on Vercel preview', () => {
    setEnv({
      NODE_ENV: 'development',
      PLAYWRIGHT_TEST_MODE: 'true',
      VERCEL: '1',
      VERCEL_ENV: 'preview',
    });
    expect(() => warnIfPlaywrightTestModeMisconfigured()).toThrow(/SECURITY.*VERCEL_ENV/);
  });

  it('should throw when PLAYWRIGHT_TEST_MODE=true on Vercel production', () => {
    setEnv({
      NODE_ENV: 'development',
      PLAYWRIGHT_TEST_MODE: 'true',
      VERCEL: '1',
      VERCEL_ENV: 'production',
    });
    expect(() => warnIfPlaywrightTestModeMisconfigured()).toThrow(/SECURITY.*VERCEL_ENV/);
  });

  it('should include VERCEL_ENV in the error message when set', () => {
    setEnv({
      NODE_ENV: 'development',
      PLAYWRIGHT_TEST_MODE: 'true',
      VERCEL: '1',
      VERCEL_ENV: 'preview',
    });
    try {
      warnIfPlaywrightTestModeMisconfigured();
      fail('Expected an error to be thrown');
    } catch (e: any) {
      expect(e.message).toContain('VERCEL_ENV="preview"');
    }
  });

  it('should NOT throw when NODE_ENV=development', () => {
    setEnv({ NODE_ENV: 'development', PLAYWRIGHT_TEST_MODE: 'true' });
    // Should warn but not throw
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    expect(() => warnIfPlaywrightTestModeMisconfigured()).not.toThrow();
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  it('should NOT throw when NODE_ENV=test', () => {
    setEnv({ NODE_ENV: 'test', PLAYWRIGHT_TEST_MODE: 'true' });
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    expect(() => warnIfPlaywrightTestModeMisconfigured()).not.toThrow();
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  it('should do nothing when PLAYWRIGHT_TEST_MODE is not set', () => {
    setEnv({ NODE_ENV: 'production' });
    delete process.env.PLAYWRIGHT_TEST_MODE;
    delete process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE;
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    expect(() => warnIfPlaywrightTestModeMisconfigured()).not.toThrow();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should log error (not throw) when NODE_ENV is unexpected but not production', () => {
    setEnv({ NODE_ENV: 'staging', PLAYWRIGHT_TEST_MODE: 'true' });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    expect(() => warnIfPlaywrightTestModeMisconfigured()).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

describe('middleware.ts — delegates to shared helper', () => {
  const src = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'lib', 'supabase', 'middleware.ts'),
    'utf-8'
  );

  it('should import isPlaywrightTestModeRequest from the shared module', () => {
    expect(src).toContain("import { isPlaywrightTestModeRequest } from '@/lib/playwright-test-mode'");
  });

  it('should not contain inline localhost regex bypass logic', () => {
    // The old code had an inline isLocalhost check with regex.
    // The shared module now owns that logic.
    expect(src).not.toMatch(/isLocalhost\s*=\s*\/\^/);
  });

  it('should use isPlaywrightTestModeRequest instead of inline isPlaywrightTestMode', () => {
    expect(src).toContain('isPlaywrightTestModeRequest(request)');
    expect(src).not.toMatch(/const isPlaywrightTestMode\s*=/);
  });
});

describe('protected-route.tsx — delegates to shared helper', () => {
  const src = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'lib', 'auth', 'protected-route.tsx'),
    'utf-8'
  );

  it('should import isPlaywrightTestModeAllowedEnv from the shared module', () => {
    expect(src).toContain("import { isPlaywrightTestModeAllowedEnv } from '@/lib/playwright-test-mode'");
  });

  it('should guard the env var check with isPlaywrightTestModeAllowedEnv()', () => {
    // The bypass must require both the NODE_ENV allowlist AND the env var.
    // This prevents activation on staging where NODE_ENV may not be "production".
    // Now also passes hostname for defense-in-depth.
    expect(src).toMatch(/isPlaywrightTestModeAllowedEnv/);
  });
});

describe('auth-context.tsx — hostname guard', () => {
  const src = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'lib', 'auth', 'auth-context.tsx'),
    'utf-8'
  );

  it('should pass window.location.hostname to isPlaywrightTestModeAllowedEnv', () => {
    // Client-side defense-in-depth: even if NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE
    // is baked into the bundle, the bypass won't activate for non-localhost hosts.
    expect(src).toMatch(/isPlaywrightTestModeAllowedEnv\(window\.location\.hostname\)/);
  });
});

describe('protected-route.tsx — hostname guard', () => {
  const src = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'lib', 'auth', 'protected-route.tsx'),
    'utf-8'
  );

  it('should pass window.location.hostname to isPlaywrightTestModeAllowedEnv (with SSR guard)', () => {
    expect(src).toMatch(/isPlaywrightTestModeAllowedEnv\(\s*typeof window.*window\.location\.hostname/);
  });
});

describe('theme-provider.tsx — hostname guard', () => {
  const src = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'components', 'theme-provider.tsx'),
    'utf-8'
  );

  it('should pass window.location.hostname to isPlaywrightTestModeAllowedEnv', () => {
    expect(src).toMatch(/isPlaywrightTestModeAllowedEnv\(window\.location\.hostname\)/);
  });
});

describe('weather-current.ts — hostname guard', () => {
  const src = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'lib', 'weather', 'weather-current.ts'),
    'utf-8'
  );

  it('should pass hostname (with SSR guard) to isPlaywrightTestModeAllowedEnv', () => {
    expect(src).toMatch(/isPlaywrightTestModeAllowedEnv\(\s*typeof window.*window\.location\.hostname/);
  });
});

describe('instrumentation.ts — startup security check', () => {
  const src = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'instrumentation.ts'),
    'utf-8'
  );

  it('should import warnIfPlaywrightTestModeMisconfigured from the shared module', () => {
    expect(src).toContain("import { warnIfPlaywrightTestModeMisconfigured } from './lib/playwright-test-mode'");
  });

  it('should call warnIfPlaywrightTestModeMisconfigured in register()', () => {
    expect(src).toContain('warnIfPlaywrightTestModeMisconfigured()');
  });
});

describe('next.config.mjs — build-time security check', () => {
  const src = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'next.config.mjs'),
    'utf-8'
  );

  it('should abort production builds if PLAYWRIGHT_TEST_MODE is set', () => {
    expect(src).toContain('BUILD ABORTED');
    expect(src).toMatch(/PLAYWRIGHT_TEST_MODE/);
  });
});