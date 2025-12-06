/**
 * Optimized Middleware with Session Caching
 *
 * Performance Enhancements:
 * 1. In-memory session cache to reduce database roundtrips
 * 2. Early returns for static assets and API routes
 * 3. Conditional session validation only for protected routes
 * 4. Reduced cookie processing overhead
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// In-memory session cache (edge-compatible)
const sessionCache = new Map<string, { session: any; timestamp: number }>()
const SESSION_CACHE_TTL = 60 * 1000 // 1 minute cache

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/settings', '/saved-locations']

// Auth routes that redirect if already logged in
const AUTH_ROUTES = ['/auth/login', '/auth/signup']

// Static and API routes that don't need auth checking
const SKIP_AUTH_PATTERNS = [
  '/_next/static',
  '/_next/image',
  '/favicon',
  '/api/weather',
  '/api/news',
  '/api/extremes',
  '/sitemap',
  '/robots',
]

/**
 * Check if path should skip auth middleware
 */
function shouldSkipAuth(pathname: string): boolean {
  return SKIP_AUTH_PATTERNS.some((pattern) => pathname.startsWith(pattern))
}

/**
 * Check if path is a protected route
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
}

/**
 * Check if path is an auth route
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route))
}

/**
 * Get session from cache or fetch from Supabase
 */
async function getSession(supabase: any, sessionKey: string) {
  // Check cache first
  const cached = sessionCache.get(sessionKey)
  if (cached && Date.now() - cached.timestamp < SESSION_CACHE_TTL) {
    return cached.session
  }

  // Fetch from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Cache the result
  if (session) {
    sessionCache.set(sessionKey, { session, timestamp: Date.now() })

    // Cleanup old entries (simple LRU-like behavior)
    if (sessionCache.size > 100) {
      const firstKey = sessionCache.keys().next().value
      if (firstKey !== undefined) {
        sessionCache.delete(firstKey)
      }
    }
  }

  return session
}

/**
 * Create session cache key from cookies
 */
function createSessionKey(cookies: Map<string, string>): string {
  // Use access token as cache key
  const accessToken = cookies.get('sb-access-token')
  return accessToken || 'anonymous'
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Early return for static assets and specific API routes
  if (shouldSkipAuth(pathname)) {
    return NextResponse.next()
  }

  const requestHeaders = new Headers(request.headers)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Check if this route needs auth checking
  const needsAuthCheck = isProtectedRoute(pathname) || isAuthRoute(pathname)

  // Skip session fetching if not needed
  if (!needsAuthCheck) {
    return response
  }

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Create session cache key
  const cookieMap = new Map(request.cookies.getAll().map((c) => [c.name, c.value]))
  const sessionKey = createSessionKey(cookieMap)

  // Get session (from cache or Supabase)
  const session = await getSession(supabase, sessionKey)

  // Handle protected routes
  if (isProtectedRoute(pathname) && !session) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Handle auth routes (redirect if already logged in)
  if (isAuthRoute(pathname) && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
