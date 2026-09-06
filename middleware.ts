import { NextResponse, type NextRequest } from 'next/server'

// Check session without instantiating the Supabase client — avoids any
// network call (token refresh) that causes MIDDLEWARE_INVOCATION_TIMEOUT.
function hasSession(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    c => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  )
}

export function middleware(request: NextRequest) {
  // Rewrite /@username/* → /blog/username/*
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith('/@')) {
    const url = request.nextUrl.clone()
    url.pathname = '/blog/' + pathname.slice(2)
    return NextResponse.rewrite(url)
  }

  const loggedIn = hasSession(request)

  if (!loggedIn && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (loggedIn && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
