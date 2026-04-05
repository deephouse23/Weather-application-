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

describe('Fix 2: postMessage origin validation', () => {
  const src = readFileSync(join(__dirname, '..', 'app', 'games', '[slug]', 'page.tsx'), 'utf-8');
  it('should check event.origin before processing messages', () => {
    expect(src).toContain('event.origin');
  });
});

describe('Fix 3: Supabase filter injection in games search', () => {
  const src = readFileSync(join(__dirname, '..', 'app', 'api', 'games', 'route.ts'), 'utf-8');
  it('should not interpolate raw search into .or() filter', () => {
    expect(src).not.toMatch(/\.or\(`[^`]*\$\{search\}[^`]*`\)/);
  });
});

describe('Fix 4: Admin access control on POST /api/games', () => {
  const src = readFileSync(join(__dirname, '..', 'app', 'api', 'games', 'route.ts'), 'utf-8');
  it('should use getUser() instead of getSession() for write operations', () => {
    expect(src).not.toContain('getSession()');
    expect(src).toContain('getUser()');
  });

  it('should check admin role via app_metadata to match JWT/RLS policy', () => {
    expect(src).toContain('app_metadata');
    expect(src).not.toMatch(/user_metadata\?\.role/);
  });
});

describe('Fix 5: CSP unsafe-eval removed', () => {
  const src = readFileSync(join(__dirname, '..', 'next.config.mjs'), 'utf-8');
  it('should not contain unsafe-eval in script-src', () => {
    // unsafe-eval allows arbitrary code execution via eval() — must be removed
    // unsafe-inline is kept because Next.js requires it for inline hydration scripts
    expect(src).not.toContain("'unsafe-eval'");
  });
});

describe('Fix 6: Stale session in scores route', () => {
  const src = readFileSync(join(__dirname, '..', 'app', 'api', 'games', '[slug]', 'scores', 'route.ts'), 'utf-8');
  it('should use getUser() instead of getSession()', () => {
    expect(src).not.toContain('getSession()');
    expect(src).toContain('getUser()');
  });
});

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
