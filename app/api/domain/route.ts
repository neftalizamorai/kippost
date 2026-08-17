import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function sanitizeDomain(raw: string): string {
  return raw.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0]
}

function vercelHeaders() {
  return {
    'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

const VERCEL_API = 'https://api.vercel.com'
const PROJECT_ID = process.env.VERCEL_PROJECT_ID

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })

  if (!process.env.VERCEL_TOKEN || !PROJECT_ID) {
    return NextResponse.json({ ok: false, error: 'Configuración de servidor incompleta' }, { status: 500 })
  }

  const body = await request.json()
  const domain = sanitizeDomain(body.domain ?? '')
  if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    return NextResponse.json({ ok: false, error: 'Dominio inválido' }, { status: 400 })
  }

  // Add domain to Vercel project
  const vercelRes = await fetch(`${VERCEL_API}/v10/projects/${PROJECT_ID}/domains`, {
    method: 'POST',
    headers: vercelHeaders(),
    body: JSON.stringify({ name: domain }),
  })

  const vercelData = await vercelRes.json()

  // 409 = domain already exists in the project — treat as success
  if (!vercelRes.ok && vercelRes.status !== 409) {
    const msg = vercelData?.error?.message ?? 'Error al registrar dominio en Vercel'
    return NextResponse.json({ ok: false, error: msg }, { status: 502 })
  }

  // Save to Supabase
  const { error: dbError } = await supabase
    .from('profiles')
    .update({ custom_domain: domain })
    .eq('id', user.id)

  if (dbError) {
    // Unique violation — another user has this domain
    if (dbError.code === '23505') {
      return NextResponse.json({ ok: false, error: 'Este dominio ya está siendo usado por otra cuenta.' }, { status: 409 })
    }
    return NextResponse.json({ ok: false, error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    verified: vercelData.verified ?? false,
    verification: vercelData.verification ?? [],
  })
}

export async function DELETE() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })

  if (!process.env.VERCEL_TOKEN || !PROJECT_ID) {
    return NextResponse.json({ ok: false, error: 'Configuración de servidor incompleta' }, { status: 500 })
  }

  // Get current domain
  const { data: profile } = await supabase
    .from('profiles')
    .select('custom_domain')
    .eq('id', user.id)
    .single()

  const domain = profile?.custom_domain
  if (domain) {
    // Remove from Vercel (ignore errors — domain may have already been removed)
    await fetch(`${VERCEL_API}/v9/projects/${PROJECT_ID}/domains/${encodeURIComponent(domain)}`, {
      method: 'DELETE',
      headers: vercelHeaders(),
    })
  }

  // Clear in Supabase
  await supabase
    .from('profiles')
    .update({ custom_domain: null })
    .eq('id', user.id)

  return NextResponse.json({ ok: true })
}
