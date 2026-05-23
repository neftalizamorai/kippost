'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

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
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          background: 'var(--bg)',
        }}
      >
        <div className="anim-fade-up delay-0" style={{ maxWidth: '360px', width: '100%', textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'var(--accent)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.875rem',
              fontWeight: 500,
              color: 'var(--text)',
              marginBottom: '0.75rem',
            }}
          >
            Revisa tu correo
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-crimson)',
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
            }}
          >
            Te enviamos un enlace de confirmación a{' '}
            <strong style={{ color: 'var(--text)' }}>{email}</strong>.
            Haz clic en él para activar tu cuenta.
          </p>
          <Link
            href="/login"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
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
          top: '-20%',
          right: '-15%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(ellipse, var(--accent-glow) 0%, transparent 65%)',
          zIndex: 0,
        }}
      />

      {/* Controls */}
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
          }}
        >
          ← Inicio
        </Link>
        <ThemeToggle />
      </div>

      {/* Card */}
      <div
        className="anim-fade-up delay-0"
        style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 10 }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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

        <h1
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.875rem',
            fontWeight: 500,
            color: 'var(--text)',
            textAlign: 'center',
            marginBottom: '0.375rem',
          }}
        >
          Crea tu espacio
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
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: '2px' }}
          >
            Inicia sesión
          </Link>
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {/* Username */}
          <div>
            <label className="kip-label">Tu dirección de blog</label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  padding: '0.625rem 0.75rem',
                  fontFamily: 'var(--font-syne)',
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  borderRight: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                /blog/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                placeholder="tunombre"
                style={{
                  flex: 1,
                  padding: '0.625rem 0.75rem',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-syne)',
                  fontSize: '0.8125rem',
                  color: 'var(--text)',
                  minWidth: 0,
                }}
              />
            </div>
            <p
              style={{
                marginTop: '0.375rem',
                fontFamily: 'var(--font-syne)',
                fontSize: '0.65rem',
                color: 'var(--text-tertiary)',
                letterSpacing: '0.02em',
              }}
            >
              Solo letras minúsculas, números, _ y - (3-30 chars)
            </p>
          </div>

          <div>
            <label className="kip-label">Nombre para mostrar</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Tu Nombre"
              className="kip-input"
            />
          </div>

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
              autoComplete="new-password"
              minLength={6}
              placeholder="Mínimo 6 caracteres"
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>
        </form>
      </div>
    </div>
  )
}
