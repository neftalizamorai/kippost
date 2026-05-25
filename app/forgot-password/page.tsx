'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError('No pudimos enviar el correo. Verifica la dirección e intenta de nuevo.')
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm text-center">
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Revisa tu correo</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Enviamos un enlace de recuperación a <strong>{email}</strong>.
          </p>
          <Link href="/login" className="block mt-6 text-sm hover:underline" style={{ color: 'var(--text)' }}>
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-lg font-semibold mb-8 hover:opacity-70 transition-opacity" style={{ color: 'var(--text)' }}>
          KipPost
        </Link>

        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Recuperar contraseña</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text)' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 text-sm rounded border outline-none transition-all focus:ring-1 focus:ring-[var(--text)]"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="tu@correo.com"
            />
          </div>

          {error && <p className="text-sm" style={{ color: '#e03e3e' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium rounded hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        <p className="text-sm mt-5" style={{ color: 'var(--text-secondary)' }}>
          <Link href="/login" className="hover:underline" style={{ color: 'var(--text)' }}>
            ← Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
