import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/about', '/cloud-types', '/weather-systems', '/fun-facts', '/games', '/debug']

  // Check if the path is public
  const isPublicPath = publicPaths.includes(path)

  // For now, allow access - authentication will be handled on the client side
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For protected routes, allow access for now
  // Authentication will be handled by the client-side components
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 