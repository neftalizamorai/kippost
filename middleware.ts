import { NextResponse, type NextRequest } from 'next/server'

// Check session without instantiating the Supabase client — avoids any
// network call (token refresh) that causes MIDDLEWARE_INVOCATION_TIMEOUT.
function hasSession(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    c => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  )
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Rewrite /@username/* → /blog/username/*
  if (pathname.startsWith('/@')) {
    const url = request.nextUrl.clone()
    url.pathname = '/blog/' + pathname.slice(2)
    return NextResponse.rewrite(url)
  }

  // Protect /dashboard: redirect to login if no session cookie.
  // Do NOT redirect /login or /register — would cause a redirect loop
  // when the session cookie is stale (cookie exists but token is expired;
  // the dashboard layout calls getUser() and redirects back to /login).
  if (!hasSession(request) && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
