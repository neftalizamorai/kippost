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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'var(--bg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow */}
      <div
        className="pointer-events-none"
        style={{
          position: 'fixed',
          bottom: '-20%',
          right: '-10%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(ellipse, var(--accent-glow) 0%, transparent 65%)',
          zIndex: 0,
        }}
      />

      {/* Controls top-right */}
      <div
        style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
        >
          ← Inicio
        </Link>
        <ThemeToggle />
      </div>

      {/* Card */}
      <div
        className="anim-fade-up delay-0"
        style={{
          width: '100%',
          maxWidth: '380px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '2.25rem',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'var(--text)',
              textDecoration: 'none',
            }}
          >
            KipPost
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              marginTop: '0.875rem',
              justifyContent: 'center',
            }}
          >
            <div style={{ height: '1px', width: '36px', background: 'var(--border)' }} />
            <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '0.7rem', color: 'var(--accent)' }}>◆</span>
            <div style={{ height: '1px', width: '36px', background: 'var(--border)' }} />
          </div>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.875rem',
            fontWeight: 500,
            color: 'var(--text)',
            textAlign: 'center',
            marginBottom: '0.375rem',
            lineHeight: 1.2,
          }}
        >
          Bienvenido de vuelta
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          ¿No tienes cuenta?{' '}
          <Link
            href="/register"
            style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: '2px' }}
          >
            Regístrate gratis
          </Link>
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div>
            <label className="kip-label">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="tu@correo.com"
              className="kip-input"
            />
          </div>

          <div>
            <label className="kip-label">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="kip-input"
            />
          </div>

          {error && (
            <p
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '0.75rem',
                color: 'var(--error)',
                padding: '0.625rem 0.75rem',
                background: 'rgba(224, 112, 112, 0.08)',
                borderRadius: '3px',
                border: '1px solid rgba(224, 112, 112, 0.2)',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.375rem', padding: '0.75rem' }}
          >
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
