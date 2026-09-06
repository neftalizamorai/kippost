'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2a10.34 10.34 0 0 0-.16-1.84H9v3.48h4.84A4.14 4.14 0 0 1 12.07 13v2.26h2.88a8.68 8.68 0 0 0 2.69-6.06z" fill="#4285F4"/>
      <path d="M9 18a8.59 8.59 0 0 0 5.96-2.18l-2.88-2.26a5.4 5.4 0 0 1-8.08-2.85H1.06v2.34A9 9 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.95H1.06A9 9 0 0 0 0 9a9 9 0 0 0 1.06 4.05l2.9-2.34z" fill="#FBBC05"/>
      <path d="M9 3.58a4.86 4.86 0 0 1 3.44 1.35l2.58-2.58A8.64 8.64 0 0 0 9 0 9 9 0 0 0 1.06 4.95l2.9 2.34A5.36 5.36 0 0 1 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleGoogleRegister = async () => {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
      setError('El username solo puede tener letras minúsculas, números, _ y - (3-30 caracteres).')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user && data.session) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        username,
        name,
      })

      if (profileError && profileError.code !== '23505') {
        setError(profileError.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Revisa tu correo</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Te enviamos un enlace de confirmación a <strong>{email}</strong>. Haz clic en él para activar tu cuenta.
          </p>
          <Link href="/login" className="block mt-6 text-sm hover:underline" style={{ color: 'var(--text)' }}>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
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

        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Crea tu cuenta</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="hover:underline" style={{ color: 'var(--text)' }}>
            Inicia sesión
          </Link>
        </p>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 text-sm font-medium rounded border hover:opacity-80 transition-opacity disabled:opacity-50 mb-5"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          <GoogleIcon />
          {googleLoading ? 'Redirigiendo...' : 'Continuar con Google'}
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>o con correo</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text)' }}>
              Username
            </label>
            <div className="flex items-center rounded border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--text)]" style={{ borderColor: 'var(--border)' }}>
              <span className="px-3 py-2 text-sm border-r" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                kippost.com/@
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                className="flex-1 px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--bg)', color: 'var(--text)' }}
                placeholder="tunombre"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text)' }}>
              Nombre para mostrar
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded border outline-none transition-all focus:ring-1 focus:ring-[var(--text)]"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="Tu Nombre"
            />
          </div>

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
              autoComplete="new-password"
              minLength={6}
              className="w-full px-3 py-2 text-sm rounded border outline-none transition-all focus:ring-1 focus:ring-[var(--text)]"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="Mínimo 6 caracteres"
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
