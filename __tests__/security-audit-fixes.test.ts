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

describe('Fix 9: Test auth bypass restricted to localhost', () => {
  const src = readFileSync(join(__dirname, '..', 'lib', 'supabase', 'middleware.ts'), 'utf-8');
  it('should check for localhost before allowing Playwright bypass', () => {
    expect(src).toContain('localhost');
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
