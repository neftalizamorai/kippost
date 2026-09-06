import { NextResponse, type NextRequest } from 'next/server'

function isOwnHost(hostname: string): boolean {
  const appHost = process.env.NEXT_PUBLIC_APP_HOST ?? 'kippost.com'
  return (
    hostname === appHost ||
    hostname === `www.${appHost}` ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.vercel.app')
  )
}

function stripWww(hostname: string): string {
  return hostname.startsWith('www.') ? hostname.slice(4) : hostname
}

async function lookupCustomDomain(domain: string): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!base || !key) return null
  try {
    const res = await fetch(
      `${base}/rest/v1/profiles?select=username&custom_domain=eq.${encodeURIComponent(domain)}&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(3000),
      }
    )
    if (!res.ok) return null
    const rows: { username: string }[] = await res.json()
    return rows[0]?.username ?? null
  } catch {
    return null
  }
}

// Check session without instantiating the Supabase client — avoids any
// network call (token refresh) that causes MIDDLEWARE_INVOCATION_TIMEOUT.
function hasSession(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    c => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  )
}

export async function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname

  // Custom domain routing: requests from user-owned domains → rewrite to /blog/[username]/[path]
  if (!isOwnHost(hostname)) {
    const username = await lookupCustomDomain(stripWww(hostname))
    if (username) {
      const url = request.nextUrl.clone()
      url.pathname = `/blog/${username}${request.nextUrl.pathname}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
