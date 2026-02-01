import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from './types'
import { PLACEHOLDER_URL, PLACEHOLDER_ANON_KEY, warnIfPlaceholder } from './constants'

export async function middleware(request: NextRequest) {
  // Skip auth checks in Playwright test mode (E2E tests)
  // SECURITY: Only allow bypass when explicitly enabled via env var AND not in production
  const isPlaywrightTestMode =
    process.env.PLAYWRIGHT_TEST_MODE === 'true' &&
    process.env.NODE_ENV !== 'production' &&
    request.cookies.get('playwright-test-mode')?.value === 'true'
  
  if (isPlaywrightTestMode) {
    return NextResponse.next()
  }

  const requestHeaders = new Headers(request.headers)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_ANON_KEY
  
  // Warn developers when using placeholder credentials
  warnIfPlaceholder(supabaseUrl, supabaseKey, 'middleware')

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
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
