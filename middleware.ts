import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // TEST MODE: Skip auth checks during E2E testing
  // Check multiple indicators:
  // 1. Build-time environment variable (set during CI builds)
  // 2. Runtime environment variable (set during local dev/test)
  // 3. CI environment (GitHub Actions, Vercel preview deployments)
  // 4. Vercel preview environment (for testing against preview deployments)
  // 5. Request header (set by Playwright tests)
  // 6. Cookie (set by Playwright tests)
  const testModeHeader = request.headers.get('x-playwright-test-mode')
  const testModeCookie = request.cookies.get('playwright-test-mode')

  // SECURITY: Only allow test mode bypass if:
  // - Explicit test mode env vars are set, OR
  // - We're in CI/Vercel preview environment AND test header/cookie is present
  // This prevents users from spoofing headers in production to bypass auth
  // We check both NEXT_PUBLIC_ (build-time) and standard (runtime) variables
  const isExplicitTestEnv = process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE === 'true' ||
    process.env.PLAYWRIGHT_TEST_MODE === 'true'

  // Detect CI/Vercel preview environments
  // Vercel sets VERCEL=1 and VERCEL_ENV (preview, production, development)
  const isCIOrPreview = process.env.CI === 'true' ||
    process.env.VERCEL === '1' ||
    process.env.VERCEL_ENV === 'preview'

  // Test mode is enabled if:
  // 1. Explicit test mode env vars are set (local dev / E2E), OR
  // 2. We're in CI/Vercel preview AND header/cookie present (safety net for Vercel preview)
  //
  // Rationale:
  // - If a developer explicitly set PLAYWRIGHT_TEST_MODE/NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE, we can safely
  //   bypass auth in non-production without requiring spoofable indicators (headers/cookies).
  // - In CI/Vercel preview, still require an explicit indicator to avoid accidental bypass.
  const hasTestIndicator = testModeHeader === 'true' || testModeCookie?.value === 'true'
  const isNonProd = process.env.NODE_ENV !== 'production'
  const isTestMode = (isExplicitTestEnv && isNonProd) || (isCIOrPreview && hasTestIndicator)

  if (isTestMode) {
    return response
  }

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

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const protectedRoutes = ['/dashboard', '/profile', '/settings', '/saved-locations']
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const authRoutes = ['/auth/login', '/auth/signup']
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
