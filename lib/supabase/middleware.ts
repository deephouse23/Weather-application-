import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from './types'
import { PLACEHOLDER_URL, PLACEHOLDER_ANON_KEY, throwIfPlaceholderProduction } from './constants'
import { isPlaywrightTestModeRequest } from '@/lib/playwright-test-mode'

/**
 * API routes that require authentication (user-specific data).
 * These return 401 JSON if no valid session is found.
 */
const AUTH_REQUIRED_API_ROUTES = [
  '/api/user',
  '/api/chat',
]

/**
 * API routes excluded from middleware auth checking.
 * These have their own authentication mechanism (e.g., Bearer tokens).
 */
const EXCLUDED_API_ROUTES = [
  '/api/cron', // Bearer token auth via CRON_SECRET
]

function isAuthRequiredApiRoute(pathname: string): boolean {
  return AUTH_REQUIRED_API_ROUTES.some(route => pathname.startsWith(route))
}

function isExcludedApiRoute(pathname: string): boolean {
  return EXCLUDED_API_ROUTES.some(route => pathname.startsWith(route))
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
const API_RATE_LIMIT_MAX = 60 // 60 requests per minute
const CLEANUP_INTERVAL = 5 * 60 * 1000 // Clean up every 5 minutes
let lastCleanup = Date.now()

function checkApiRateLimit(request: NextRequest): { allowed: boolean; retryAfter: number } {
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
  const key = `api:${ip}`

  const existing = apiRateLimits.get(key)

  if (!existing || now > existing.resetTime) {
    // New window
    apiRateLimits.set(key, { count: 1, resetTime: now + API_RATE_LIMIT_WINDOW_MS })
    return { allowed: true, retryAfter: 0 }
  }

  if (existing.count >= API_RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((existing.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  existing.count++
  return { allowed: true, retryAfter: 0 }
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
    const rateCheck = checkApiRateLimit(request)
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
            'X-RateLimit-Limit': String(API_RATE_LIMIT_MAX),
            'Cache-Control': 'no-store',
          },
        }
      )
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