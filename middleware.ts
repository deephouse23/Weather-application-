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
  // 2. Request header (set by Playwright tests)
  // 3. Cookie (set by Playwright tests)
  const testModeHeader = request.headers.get('x-playwright-test-mode')
  const testModeCookie = request.cookies.get('playwright-test-mode')
  // SECURITY: Only allow test mode bypass if the environment variable is explicitly set
  // This prevents users from spoofing headers in production to bypass auth
  const isTestEnv = process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE === 'true'
  const isTestMode = isTestEnv && (
    testModeHeader === 'true' ||
    (testModeCookie?.value === 'true'))

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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
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
