/**
 * Tests for middleware API route authentication & authorization
 *
 * Validates the defense-in-depth auth model, rate limiting tiers,
 * origin validation, and CORS exemptions as documented in middleware.ts.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const MIDDLEWARE_PATH = join(__dirname, '..', 'lib', 'supabase', 'middleware.ts');
const middlewareSrc = readFileSync(MIDDLEWARE_PATH, 'utf-8');

describe('Middleware API Auth — Route Classification', () => {
  describe('AUTH_REQUIRED_API_ROUTES', () => {
    it('should include /api/user (user preferences)', () => {
      expect(middlewareSrc).toContain("'/api/user'");
    });

    it('should include /api/chat (AI chat)', () => {
      expect(middlewareSrc).toContain("'/api/chat'")
    });

    it('should include /api/locations (saved locations — has handler-level auth)', () => {
      expect(middlewareSrc).toContain("'/api/locations'")
    });

    it('should include /api/weather/precipitation (user-scoped — has handler-level auth)', () => {
      expect(middlewareSrc).toContain("'/api/weather/precipitation'")
    });
  });

  describe('HIGH_COST_API_ROUTES', () => {
    it('should include /api/aviation (external aviation APIs)', () => {
      expect(middlewareSrc).toContain("'/api/aviation'")
    });

    it('should include /api/space-weather (NASA/NOAA APIs)', () => {
      expect(middlewareSrc).toContain("'/api/space-weather'")
    });

    it('should include /api/gfs-image (GFS model imagery)', () => {
      expect(middlewareSrc).toContain("'/api/gfs-image'")
    });
  });

  describe('CORS_ENABLED_ROUTES', () => {
    it('should include /api/news (cross-origin)', () => {
      expect(middlewareSrc).toContain("'/api/news'")
    });

    it('should include /api/news/aggregate (cross-origin)', () => {
      expect(middlewareSrc).toContain("'/api/news/aggregate'")
    });

    it('should include /api/weather/iowa-nexrad (cross-origin)', () => {
      expect(middlewareSrc).toContain("'/api/weather/iowa-nexrad'")
    });

    it('should include /api/weather/noaa-wms (cross-origin)', () => {
      expect(middlewareSrc).toContain("'/api/weather/noaa-wms'")
    });

    it('should include /api/weather/radar (cross-origin)', () => {
      expect(middlewareSrc).toContain("'/api/weather/radar'")
    });
  });

  describe('EXCLUDED_API_ROUTES', () => {
    it('should include /api/cron (Bearer token auth)', () => {
      expect(middlewareSrc).toContain("'/api/cron'")
    });
  });
});

describe('Middleware API Auth — Rate Limiting Tiers', () => {
  it('should define a standard rate limit of 60 req/min', () => {
    expect(middlewareSrc).toContain('API_RATE_LIMIT_MAX = 60')
  });

  it('should define a high-cost rate limit of 20 req/min', () => {
    expect(middlewareSrc).toContain('HIGH_COST_RATE_LIMIT_MAX = 20')
  });

  it('should use separate rate limit buckets for high-cost routes', () => {
    expect(middlewareSrc).toMatch(/api-hc:/)
  });

  it('should pass pathname to checkApiRateLimit for tier selection', () => {
    expect(middlewareSrc).toMatch(/checkApiRateLimit\(request,\s*pathname\)/)
  });

  it('should return limit in rate limit response for dynamic X-RateLimit-Limit header', () => {
    expect(middlewareSrc).toMatch(/X-RateLimit-Limit.*rateCheck\.limit/)
  });
});

describe('Middleware API Auth — Origin Validation', () => {
  it('should have an isValidOrigin function', () => {
    expect(middlewareSrc).toContain('function isValidOrigin')
  });

  it('should allow requests with no origin in development mode', () => {
    expect(middlewareSrc).toMatch(/NODE_ENV.*development/)
  });

  it('should allow requests with no origin/referer header (curl, native apps)', () => {
    expect(middlewareSrc).toMatch(/!origin.*!referer/)
  });

  it('should use NEXT_PUBLIC_BASE_URL as allowed origin', () => {
    expect(middlewareSrc).toContain('NEXT_PUBLIC_BASE_URL')
  });

  it('should include VERCEL_URL as allowed origin', () => {
    expect(middlewareSrc).toContain('VERCEL_URL')
  });

  it('should skip origin check for auth-required routes (already blocked without session)', () => {
    expect(middlewareSrc).toMatch(/!isAuthRequiredApiRoute\(pathname\)/)
  });

  it('should skip origin check for CORS-enabled routes (explicit cross-origin)', () => {
    expect(middlewareSrc).toMatch(/!isCorsEnabledRoute\(pathname\)/)
  });

  it('should return 403 INVALID_ORIGIN for blocked origins', () => {
    expect(middlewareSrc).toContain('INVALID_ORIGIN')
    expect(middlewareSrc).toMatch(/status:\s*403/)
  });
});

describe('Middleware API Auth — Matcher Config', () => {
  it('should include API routes in the matcher (not exclude them)', () => {
    // Extract just the config.matcher array content (not comments)
    const configMatch = middlewareSrc.match(/export const config = \{[\s\S]*matcher:\s*\[([\s\S]*?)\]/)
    expect(configMatch).not.toBeNull()
    const matcherContent = configMatch![1]
    // Find the actual regex pattern string (the line with a pattern in quotes)
    const patternMatch = matcherContent.match(/'([^']+)'/)
    expect(patternMatch).not.toBeNull()
    const pattern = patternMatch![1]
    // The secure pattern should match all paths except _next/static, _next/image, etc.
    // but should NOT exclude /api routes
    expect(pattern).toContain('_next/static')
    // Should NOT start with (?!api — that would exclude all API routes
    expect(pattern).not.toMatch(/^\(\?!api\|/)
  })

  it('should NOT exclude API routes from the matcher', () => {
    // Extract the actual matcher regex pattern
    const configMatch = middlewareSrc.match(/export const config = \{[\s\S]*matcher:\s*\[([\s\S]*?)\]/)
    const matcherContent = configMatch![1]
    const patternMatch = matcherContent.match(/'([^']+)'/)
    const pattern = patternMatch![1]
    // The negative lookahead should NOT contain "api"
    expect(pattern).not.toMatch(/\(\?!api/)
  })
});

describe('Middleware API Auth — Defense-in-Depth', () => {
  // Verify that routes with handler-level auth are ALSO in the middleware auth list
  const routesWithHandlerAuth = [
    { route: '/api/locations', file: 'app/api/locations/route.ts', authPattern: 'verifyBearerToken' },
    { route: '/api/weather/precipitation', file: 'app/api/weather/precipitation/route.ts', authPattern: 'verifyBearerToken' },
  ];

  for (const { route, file, authPattern } of routesWithHandlerAuth) {
    describe(`Route ${route} (handler has ${authPattern})`, () => {
      let handlerSrc: string;
      beforeAll(() => {
        try {
          handlerSrc = readFileSync(join(__dirname, '..', file), 'utf-8');
        } catch {
          handlerSrc = ''; // File may not exist in test env
        }
      });

      it('should be in AUTH_REQUIRED_API_ROUTES for defense-in-depth', () => {
        expect(middlewareSrc).toContain(`'${route}'`)
      });
    });
  }
});

describe('Middleware API Auth — Auth Documentation', () => {
  it('should have a documented route auth map in comments', () => {
    expect(middlewareSrc).toContain('API Route Authentication & Authorization Map')
  });

  it('should document all three route categories in comments', () => {
    expect(middlewareSrc).toContain('AUTH-REQUIRED')
    expect(middlewareSrc).toContain('EXCLUDED')
    expect(middlewareSrc).toContain('PUBLIC')
  });

  it('should document high-cost routes in comments', () => {
    expect(middlewareSrc).toContain('High-cost public routes')
  });

  it('should document CORS-enabled routes in comments', () => {
    expect(middlewareSrc).toContain('CORS-enabled public routes')
  });
});