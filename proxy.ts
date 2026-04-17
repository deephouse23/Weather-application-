import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isPlaywrightTestModeRequest } from '@/lib/playwright-test-mode'

/**
 * Build a Content-Security-Policy for this request.
 *
 * - Prod: nonce-based `script-src` with `'strict-dynamic'`. Vercel overlay
 *   scripts are excluded. Next.js picks up the `x-nonce` request header and
 *   stamps it onto framework hydration `<script>` tags automatically.
 * - Non-prod: relaxed so the Vercel overlay/toolbar and `unsafe-eval` used by
 *   dev tooling continue to work.
 */
function buildCspHeader(nonce: string, isProd: boolean): string {
  const scriptSrc = isProd
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://vercel.com https://va.vercel-scripts.com`

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.openweathermap.org https://pollen.googleapis.com https://www.google.com https://*.supabase.co https://*.sentry.io https://vitals.vercel-insights.com https://mesonet.agron.iastate.edu https://tile.openstreetmap.org" +
      (isProd ? '' : ' https://vercel.live https://vercel.com'),
    "worker-src 'self' blob:",
    "frame-src 'self'" + (isProd ? '' : ' https://vercel.live'),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    ...(isProd ? ['upgrade-insecure-requests'] : []),
  ].join('; ')
}

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)

  // Per-request CSP nonce. Next.js reads `x-nonce` from request headers and
  // applies it to framework hydration scripts; setting it on the request
  // headers is load-bearing.
  const nonce = crypto.randomUUID().replace(/-/g, '')
  const isProd = process.env.NODE_ENV === 'production'
  const csp = buildCspHeader(nonce, isProd)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('Content-Security-Policy', csp)

  // TEST MODE: Skip auth checks during E2E (same rules as API routes — see lib/playwright-test-mode.ts)

  if (isPlaywrightTestModeRequest(request)) {
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
