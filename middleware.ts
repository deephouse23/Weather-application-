import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  // Skip Supabase auth in tests or when env is not configured
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isTestRuntime = process.env.PLAYWRIGHT_TEST === '1' || process.env.NODE_ENV === 'test'

  let session: { user: unknown } | null = null
  if (SUPABASE_URL && SUPABASE_ANON && !isTestRuntime) {
    const supabase = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON,
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

    const result = await supabase.auth.getSession()
    session = result.data.session
  }

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
