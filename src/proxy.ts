import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Lightweight token decode for proxy (avoid importing jsonwebtoken on edge)
function decodeJwtPayload(token: string): { userId?: string; role?: string; email?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    // Basic expiry check
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/health']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow public API read operations (GET on groups, faculty, domains)
  if (
    request.method === 'GET' &&
    (pathname.startsWith('/api/groups') ||
      pathname.startsWith('/api/faculty') ||
      pathname.startsWith('/api/domains') ||
      pathname.startsWith('/api/analytics') ||
      pathname.startsWith('/api/search'))
  ) {
    return NextResponse.next()
  }

  // Check token for protected routes
  const token = request.cookies.get('token')?.value

  if (!token) {
    // Redirect UI routes to login
    if (!pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Return 401 for API routes
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    )
  }

  try {
    const payload = decodeJwtPayload(token)
    if (!payload?.userId) throw new Error('Invalid token')
    const headers = new Headers(request.headers)
    headers.set('x-user-id', payload.userId)
    headers.set('x-user-role', payload.role ?? '')
    headers.set('x-user-email', payload.email ?? '')
    return NextResponse.next({ request: { headers } })
  } catch {
    // Invalid token
    if (!pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
