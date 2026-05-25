'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <Link href="/" className="block text-lg font-semibold mb-8 hover:opacity-70 transition-opacity" style={{ color: 'var(--text)' }}>
          KipPost
        </Link>

        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Iniciar sesión</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="hover:underline" style={{ color: 'var(--text)' }}>
            Regístrate
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text)' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 text-sm rounded border outline-none transition-all focus:ring-1 focus:ring-[var(--text)]"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text)' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 text-sm rounded border outline-none transition-all focus:ring-1 focus:ring-[var(--text)]"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: '#e03e3e' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium rounded hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>

          <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/forgot-password" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
