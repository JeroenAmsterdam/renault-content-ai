import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/login'
  ) {
    return NextResponse.next()
  }

  // Check if user has client session
  const clientSession = request.cookies.get('client_session')

  if (!clientSession) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Add client_id to request headers for use in API routes
  const response = NextResponse.next()
  response.headers.set('x-client-id', clientSession.value)

  return response
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
