/**
 * Security tests for audit fixes (critical + high + medium + low severity)
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Fix 1: XSS — blog article rendering', () => {
  const src = readFileSync(join(__dirname, '..', 'app', 'blog', '[slug]', 'blog-article.tsx'), 'utf-8');
  it('should not contain dangerouslySetInnerHTML', () => {
    expect(src).not.toContain('dangerouslySetInnerHTML');
  });
});

// Fixes 2, 3, 4 covered the games surface (postMessage origin validation,
// Supabase filter injection on /api/games, admin auth on POST /api/games).
// All three were removed alongside the games feature itself.

describe('Fix 5: CSP unsafe-eval removed', () => {
  const src = readFileSync(join(__dirname, '..', 'next.config.mjs'), 'utf-8');
  it('should not contain unsafe-eval in script-src', () => {
    // unsafe-eval allows arbitrary code execution via eval() — must be removed
    // unsafe-inline is kept because Next.js requires it for inline hydration scripts
    expect(src).not.toContain("'unsafe-eval'");
  });
});

// Fix 6 covered the games scores route, also removed with the games feature.

describe('Fix 7: Info disclosure on cron endpoint', () => {
  const src = readFileSync(join(__dirname, '..', 'app', 'api', 'cron', 'keep-alive', 'route.ts'), 'utf-8');
  it('should not expose raw error.message in response body', () => {
    expect(src).not.toMatch(/Response\.json\(\s*\{[^}]*error:\s*error\.message/);
  });
});

describe('Fix 8: Open proxy params on NOAA WMS', () => {
  const src = readFileSync(join(__dirname, '..', 'app', 'api', 'weather', 'noaa-wms', 'route.ts'), 'utf-8');
  it('should whitelist allowed WMS parameters instead of forwarding all', () => {
    expect(src).toContain('ALLOWED_PARAMS');
    expect(src).not.toMatch(/searchParams\.forEach\(\(value, key\)/);
  });
});

describe('Fix 9: Test auth bypass restricted to localhost + NODE_ENV allowlist', () => {
  const middlewareSrc = readFileSync(join(__dirname, '..', 'lib', 'supabase', 'middleware.ts'), 'utf-8');
  const helperSrc = readFileSync(join(__dirname, '..', 'lib', 'playwright-test-mode.ts'), 'utf-8');
  it('should delegate to shared helper instead of inline bypass logic', () => {
    expect(middlewareSrc).toContain("import { isPlaywrightTestModeRequest } from '@/lib/playwright-test-mode'");
  });
  it('should use NODE_ENV allowlist (development|test) instead of blocklist (!== production)', () => {
    expect(helperSrc).toContain('ALLOWED_NODE_ENVS');
    expect(helperSrc).not.toMatch(/NODE_ENV\s*!==\s*['"]production['"]/);
  });
  it('should reject Vercel preview/production traffic', () => {
    expect(helperSrc).toContain('isVercelServingTraffic');
  });
});

describe('Fix 10: Rate limit IP source', () => {
  const src = readFileSync(join(__dirname, '..', 'app', 'api', 'news', 'route.ts'), 'utf-8');
  it('should prefer x-real-ip over x-forwarded-for for rate limiting', () => {
    // x-real-ip is set by the platform (Vercel) and harder to spoof
    expect(src).toMatch(/x-real-ip/);
  });
  it('should document the IP source choice', () => {
    expect(src).toMatch(/deployment platform/i);
  });
});

describe('Fix 11: Middleware auth for API routes', () => {
  const middlewareSrc = readFileSync(join(__dirname, '..', 'lib', 'supabase', 'middleware.ts'), 'utf-8');

  it('should include API routes in the middleware matcher (not exclude them)', () => {
    // The old matcher used negative lookahead (?!api|...) which excluded all /api/* routes.
    // The new matcher must NOT have api in the lookahead negation group.
    // Extract the matcher config and verify it excludes only static assets, not /api.
    const matcherMatch = middlewareSrc.match(/matcher:\s*\[\s*'([^']+)'/);
    expect(matcherMatch).not.toBeNull();
    const matcherPattern = matcherMatch![1];
    // The old pattern: '/((?!api|_next/static|...).*)'  — api is in the negative lookahead
    // The new pattern: '/((?!_next/static|...).*)'     — api is NOT in the negative lookahead
    expect(matcherPattern).not.toMatch(/\(\?!api[\|]/);
    // Verify api is NOT in the exclusion list of the negative lookahead
    expect(matcherPattern).toMatch(/\(\?!_next\/static/);
  });

  it('should define auth-required API routes list', () => {
    expect(middlewareSrc).toContain('AUTH_REQUIRED_API_ROUTES');
  });

  it('should require auth on /api/user routes', () => {
    expect(middlewareSrc).toContain('/api/user');
  });

  it('should require auth on /api/chat routes', () => {
    expect(middlewareSrc).toContain('/api/chat');
  });

  it('should define excluded API routes (own auth mechanism)', () => {
    expect(middlewareSrc).toContain('EXCLUDED_API_ROUTES');
  });

  it('should exclude /api/cron from middleware auth (uses CRON_SECRET Bearer token)', () => {
    expect(middlewareSrc).toContain('/api/cron');
  });

  it('should apply rate limiting to all API routes at middleware level', () => {
    expect(middlewareSrc).toContain('checkApiRateLimit');
    expect(middlewareSrc).toContain('API_RATE_LIMIT_MAX');
  });

  it('should return 401 JSON for auth-required API routes without session', () => {
    expect(middlewareSrc).toContain('AUTH_REQUIRED');
    expect(middlewareSrc).toMatch(/status:\s*401/);
  });

  it('should return 429 JSON for rate-limited API routes', () => {
    expect(middlewareSrc).toContain('RATE_LIMIT_EXCEEDED');
    expect(middlewareSrc).toMatch(/status:\s*429/);
  });
});
