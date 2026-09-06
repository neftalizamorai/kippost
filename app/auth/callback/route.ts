import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const meta = data.user.user_metadata

      if (meta?.username) {
        // Email/password signup — username passed explicitly in signUp options
        await supabase.from('profiles').upsert({
          id: data.user.id,
          username: meta.username,
          name: meta.name || meta.username,
        })
      } else {
        // OAuth provider (Google, etc.) — ensure profile exists
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle()

        if (!existing) {
          // First OAuth login — generate username from Google name/email
          const rawName = (meta?.full_name || meta?.name || '').trim()
          const emailPrefix = (data.user.email || '').split('@')[0]
          const base = (rawName || emailPrefix)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .slice(0, 28) || 'user'

          let username = base
          for (let i = 1; i <= 99; i++) {
            const { data: taken } = await supabase
              .from('profiles').select('id').eq('username', username).maybeSingle()
            if (!taken) break
            username = `${base}${i}`
          }

          await supabase.from('profiles').insert({
            id: data.user.id,
            username,
            name: rawName || emailPrefix,
            avatar_url: meta?.avatar_url || null,
          })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
