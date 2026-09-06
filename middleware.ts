import { createServerClient, type CookieOptions } from '@supabase/ssr'
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
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    )
    if (!res.ok) return null
    const rows: { username: string }[] = await res.json()
    return rows[0]?.username ?? null
  } catch {
    return null
  }
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

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getSession reads the cookie locally — no network round-trip, safe for middleware redirects.
  // Pages and API routes call getUser() server-side for full token verification.
  const { data: { session } } = await supabase.auth.getSession()
  const path = request.nextUrl.pathname

  if (!session && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
