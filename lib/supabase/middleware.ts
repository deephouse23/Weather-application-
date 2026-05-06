import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from './types'
import { PLACEHOLDER_URL, PLACEHOLDER_ANON_KEY, throwIfPlaceholderProduction } from './constants'
import { isPlaywrightTestModeRequest } from '@/lib/playwright-test-mode'

/**
 * ============================================================================
 * API Route Authentication & Authorization Map
 * ============================================================================
 *
 * Routes fall into three categories:
 *
 * 1. AUTH-REQUIRED — must have a valid Supabase user session.
 *    Middleware rejects unauthenticated requests with 401 before the handler runs.
 *    (Handler may still do additional auth checks via Bearer tokens.)
 *
 * 2. EXCLUDED — have their own auth mechanism (e.g., CRON_SECRET Bearer token).
 *    Middleware skips these entirely — no rate limit, no session check.
 *
 * 3. PUBLIC — rate-limited but no auth required.
 *    Most weather data proxies fall here; they proxy public APIs.
 *    Origin validation is applied to non-CORS public routes.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Auth-required routes (middleware enforces Supabase session):
 * ────────────────────────────────────────────────────────────────────────────
 *   /api/user/*           — user preferences, saved data
 *   /api/chat             — AI chat (bearer token in handler)
 *   /api/locations        — user saved locations (bearer token in handler)
 *   /api/weather/precipitation — user-scoped precipitation (bearer token)
 * ────────────────────────────────────────────────────────────────────────────
 * Excluded routes (own auth mechanism, skip middleware entirely):
 * ────────────────────────────────────────────────────────────────────────────
 *   /api/cron/*           — CRON_SECRET Bearer token
 * ────────────────────────────────────────────────────────────────────────────
 * CORS-enabled public routes (explicit Access-Control-Allow-Origin: *):
 * ────────────────────────────────────────────────────────────────────────────
 *   /api/news/aggregate    /api/news
 *   /api/weather/iowa-nexrad*  /api/weather/noaa-wms
 *   /api/weather/radar/*
 * ────────────────────────────────────────────────────────────────────────────
 * High-cost public routes (stricter rate limit: 20 req/min):
 * ────────────────────────────────────────────────────────────────────────────
 *   /api/aviation/*       — external aviation APIs (METAR, PIREPs, etc.)
 *   /api/space-weather/*  — NASA/NOAA space weather APIs
 *   /api/gfs-image        — GFS model imagery (heavy computation)
 * ────────────────────────────────────────────────────────────────────────────
 * Standard public routes (60 req/min, origin validation applied):
 * ────────────────────────────────────────────────────────────────────────────
 *   All other /api/* routes not listed above
 * ============================================================================
 */

/**
 * API routes that require authentication (user-specific data).
 * These return 401 JSON if no valid Supabase session is found.
 * Defense-in-depth: even though some handlers also check auth independently,
 * middleware blocks unauthenticated requests before they reach the handler.
 */
const AUTH_REQUIRED_API_ROUTES = [
  '/api/user',
  '/api/chat',
  '/api/locations',
  '/api/weather/precipitation',
]

/**
 * API routes excluded from middleware auth checking.
 * These have their own authentication mechanism (e.g., Bearer tokens).
 */
const EXCLUDED_API_ROUTES = [
  '/api/cron', // Bearer token auth via CRON_SECRET
]

/**
 * High-cost API routes that proxy external services.
 * These get a tighter rate limit (20 req/min vs 60 req/min default)
 * to protect against expensive upstream API calls.
 */
const HIGH_COST_API_ROUTES = [
  '/api/aviation',
  '/api/space-weather',
  '/api/gfs-image',
]

/**
 * Public routes that explicitly set Access-Control-Allow-Origin: *.
 * These are exempt from origin validation because they're designed
 * for cross-origin access (embedding, sharing, etc.).
 */
const CORS_ENABLED_ROUTES = [
  '/api/news/aggregate',
  '/api/news',
  '/api/weather/iowa-nexrad',
  '/api/weather/iowa-nexrad-tiles',
  '/api/weather/noaa-wms',
  '/api/weather/radar',
]

function isAuthRequiredApiRoute(pathname: string): boolean {
  return AUTH_REQUIRED_API_ROUTES.some(route => pathname.startsWith(route))
}

function isExcludedApiRoute(pathname: string): boolean {
  return EXCLUDED_API_ROUTES.some(route => pathname.startsWith(route))
}

function isHighCostApiRoute(pathname: string): boolean {
  return HIGH_COST_API_ROUTES.some(route => pathname.startsWith(route))
}

function isCorsEnabledRoute(pathname: string): boolean {
  return CORS_ENABLED_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * In-memory rate limiter for API routes at the middleware level.
 * Lightweight alternative to the Supabase-backed rate limiter used at route level.
 * Uses a sliding window with IP-based identification.
 *
 * Note: This resets on cold starts (serverless), so the Supabase-backed
 * rate limiter at route level serves as the persistent enforcement layer.
 * This middleware layer provides immediate protection against rapid-fire requests
 * before the route handler is even reached.
 */
const apiRateLimits = new Map<string, { count: number; resetTime: number }>()
const API_RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const API_RATE_LIMIT_MAX = 60 // 60 requests per minute (standard)
const HIGH_COST_RATE_LIMIT_MAX = 20 // 20 requests per minute (high-cost routes)
const CLEANUP_INTERVAL = 5 * 60 * 1000 // Clean up every 5 minutes
let lastCleanup = Date.now()

function checkApiRateLimit(request: NextRequest, pathname: string): { allowed: boolean; retryAfter: number; limit: number } {
  // Periodic cleanup of stale entries
  const now = Date.now()
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [key, entry] of apiRateLimits) {
      if (now > entry.resetTime) {
        apiRateLimits.delete(key)
      }
    }
    lastCleanup = now
  }

  // Get client IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'anonymous'

  // Use separate rate limit buckets for high-cost routes
  const isHighCost = isHighCostApiRoute(pathname)
  const maxRequests = isHighCost ? HIGH_COST_RATE_LIMIT_MAX : API_RATE_LIMIT_MAX
  const key = isHighCost ? `api-hc:${ip}` : `api:${ip}`

  const existing = apiRateLimits.get(key)

  if (!existing || now > existing.resetTime) {
    // New window
    apiRateLimits.set(key, { count: 1, resetTime: now + API_RATE_LIMIT_WINDOW_MS })
    return { allowed: true, retryAfter: 0, limit: maxRequests }
  }

  if (existing.count >= maxRequests) {
    const retryAfter = Math.ceil((existing.resetTime - now) / 1000)
    return { allowed: false, retryAfter, limit: maxRequests }
  }

  existing.count++
  return { allowed: true, retryAfter: 0, limit: maxRequests }
}

function isValidOrigin(request: NextRequest): boolean {
  // In development, allow all origins for ease of testing
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Allow requests with no origin/referer (e.g., curl, native apps, server-side)
  // This is intentional — browser requests always send origin on cross-origin,
  // but API clients and server-side fetches may not.
  if (!origin && !referer) {
    return true
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://16bitweather.com'
  const allowedOrigins = [baseUrl]

  // Also allow Vercel deployment URLs
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    allowedOrigins.push(`https://${vercelUrl}`)
  }

  // Check origin header
  if (origin) {
    return allowedOrigins.some(allowed => origin.startsWith(allowed))
  }

  // Check referer header
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      return allowedOrigins.some(allowed => refererUrl.origin.startsWith(allowed))
    } catch {
      return false
    }
  }

  return true
}

export async function middleware(request: NextRequest) {
  // Skip auth checks in Playwright test mode (E2E tests)
  // SECURITY: Delegated to shared helper which enforces NODE_ENV allowlist,
  // localhost origin check, and excludes Vercel preview/production traffic.
  if (isPlaywrightTestModeRequest(request)) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Handle API routes
  if (pathname.startsWith('/api')) {
    // Skip excluded API routes (e.g., cron with Bearer token auth)
    if (isExcludedApiRoute(pathname)) {
      return NextResponse.next()
    }

    // Apply rate limiting to ALL API routes at middleware level
    const rateCheck = checkApiRateLimit(request, pathname)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Try again in ${rateCheck.retryAfter} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfter),
            'X-RateLimit-Limit': String(rateCheck.limit),
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    // Origin validation for public API routes (not CORS-enabled)
    // CORS-enabled routes explicitly allow cross-origin access.
    // Auth-required routes block anyway without cookies, so origin check is redundant.
    if (
      !isAuthRequiredApiRoute(pathname) &&
      !isCorsEnabledRoute(pathname)
    ) {
      if (!isValidOrigin(request)) {
        return NextResponse.json(
          { error: 'Forbidden', code: 'INVALID_ORIGIN' },
          { status: 403 }
        )
      }
    }

    // Auth-required API routes: verify user session
    if (isAuthRequiredApiRoute(pathname)) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_ANON_KEY

      throwIfPlaceholderProduction(supabaseUrl, supabaseKey, 'middleware')

      const requestHeaders = new Headers(request.headers)
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })

      const supabase = createServerClient<Database>(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet: any) {
              cookiesToSet.forEach(({ name, value, options }: any) => {
                response.cookies.set(name, value, options)
                const existingCookies = requestHeaders.get('cookie')
                const newCookieValue = `${name}=${value}`
                requestHeaders.set(
                  'cookie',
                  existingCookies ? `${existingCookies}; ${newCookieValue}` : newCookieValue
                )
              })
            },
          },
        }
      )

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (!user || error) {
        return NextResponse.json(
          { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
          { status: 401 }
        )
      }

      return response
    }

    // Public API routes: rate limited but no auth required
    return NextResponse.next()
  }

  // Non-API routes: existing page-level auth logic
  const requestHeaders = new Headers(request.headers)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_ANON_KEY
  
  // In production, throw if placeholder credentials are detected
  // In development, just warn
  throwIfPlaceholderProduction(supabaseUrl, supabaseKey, 'middleware')

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any) {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            response.cookies.set(name, value, options)
            const existingCookies = requestHeaders.get('cookie')
            const newCookieValue = `${name}=${value}`
            requestHeaders.set(
              'cookie',
              existingCookies ? `${existingCookies}; ${newCookieValue}` : newCookieValue
            )
          })
        },
      },
    }
  )

  // Use getUser() instead of getSession() for server-side verification
  // getUser() makes an API call to verify the token, while getSession() just reads cookies
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  const protectedRoutes = ['/dashboard', '/profile', '/settings', '/saved-locations']
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && (!user || error)) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const authRoutes = ['/auth/login', '/auth/signup']
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isAuthRoute && user && !error) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Include API routes alongside all other non-static routes.
    // Previously, API routes were excluded (negative lookahead: (?!api|...))
    // which left 40+ endpoints with zero middleware-level protection.
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}