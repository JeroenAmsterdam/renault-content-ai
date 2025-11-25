import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('🔐 Middleware hit:', request.nextUrl.pathname)

  // Skip auth in development
  if (process.env.NODE_ENV === 'development') {
    console.log('   → Skipped (development)')
    return NextResponse.next()
  }

  // Skip for static files
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    console.log('   → Skipped (static file)')
    return NextResponse.next()
  }

  // Check for authorization header
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    console.log('   → Blocked (no auth header)')
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Lebowski Labs"',
      },
    })
  }

  // Verify credentials
  try {
    const auth = authHeader.split(' ')[1]
    const [username, password] = Buffer.from(auth, 'base64').toString().split(':')

    const validPassword = process.env.SITE_PASSWORD || 'lebowski2025'

    if (password === validPassword) {
      console.log('   → Allowed (authenticated)')
      return NextResponse.next()
    }
  } catch (error) {
    // Invalid auth header format
    console.log('   → Blocked (invalid auth format)')
  }

  // Auth failed
  console.log('   → Blocked (invalid credentials)')
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Lebowski Labs"',
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
