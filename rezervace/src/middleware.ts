import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

// Public booking API — musí být volatelné cross-origin z venom šablon
// (i po přepnutí šablony na custom doménu). Žádné cookies → wildcard je OK.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Veřejné booking API: CORS + preflight ──────────────────────────────
  // Záměrně JEN čtení nabídky a vytvoření rezervace. Přihlašovací (/api/auth)
  // a párovací (/api/connect) endpointy zůstávají bez CORS — volají se buď
  // ze stejné domény, nebo ze serveru webu, takže cizí prohlížeč na ně nemá.
  const isPublicBookingApi =
    pathname.startsWith('/api/users/') ||
    pathname.startsWith('/api/bookings') ||
    pathname.startsWith('/api/inquiries') ||
    pathname.startsWith('/api/waitlist') ||
    pathname.startsWith('/api/reviews') ||
    pathname.startsWith('/api/coupons/validate') ||
    pathname.startsWith('/api/vouchers/validate')

  if (isPublicBookingApi) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
    }
    const response = NextResponse.next()
    for (const [k, v] of Object.entries(CORS_HEADERS)) {
      response.headers.set(k, v)
    }
    return response
  }

  // ── Ochrana /admin/* ───────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      await jwtVerify(token, SECRET)
      return NextResponse.next()
    } catch {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
