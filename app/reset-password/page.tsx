'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Handle both hash-based (implicit) and code-based (PKCE) recovery flows
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('No se pudo cambiar la contraseña. El enlace puede haber expirado.')
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>✓ Contraseña actualizada</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Redirigiendo al dashboard...</p>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Verificando enlace...</p>
          <p className="text-xs mt-3" style={{ color: 'var(--text-tertiary)' }}>
            Si la página no carga,{' '}
            <Link href="/forgot-password" className="hover:underline" style={{ color: 'var(--text)' }}>
              solicita un nuevo enlace
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Nueva contraseña</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Elige una contraseña nueva para tu cuenta.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text)' }}>
              Nueva contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-3 py-2 text-sm rounded border outline-none transition-all focus:ring-1 focus:ring-[var(--text)]"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text)' }}>
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full px-3 py-2 text-sm rounded border outline-none transition-all focus:ring-1 focus:ring-[var(--text)]"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="Repite la contraseña"
            />
          </div>

          {error && <p className="text-sm" style={{ color: '#e03e3e' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium rounded hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            {loading ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
