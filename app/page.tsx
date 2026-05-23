import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg)', position: 'relative' }}
    >
      {/* Atmospheric glow */}
      <div
        className="pointer-events-none"
        style={{
          position: 'fixed',
          top: '-15%',
          left: '-5%',
          width: '55%',
          height: '65%',
          background: 'radial-gradient(ellipse at top left, var(--accent-glow) 0%, transparent 65%)',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header
        className="anim-fade-in delay-0"
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 2.5rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.5rem',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: 'var(--text)',
          }}
        >
          KipPost
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />
          <Link href="/login" className="btn-ghost">
            Entrar
          </Link>
          <Link href="/register" className="btn-primary">
            Comenzar →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '2rem 2.5rem 4rem',
          maxWidth: '1100px',
        }}
      >
        {/* Pre-label */}
        <p
          className="anim-fade-up delay-1"
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '2.5rem',
          }}
        >
          Plataforma de escritura personal
        </p>

        {/* Headline line 1 */}
        <div style={{ overflow: 'hidden' }}>
          <h1
            className="anim-fade-up delay-2"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(3.25rem, 6.5vw, 6.5rem)',
              fontWeight: 300,
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
              color: 'var(--text)',
            }}
          >
            Tu voz,
          </h1>
        </div>

        {/* Headline line 2 */}
        <div style={{ overflow: 'hidden', marginTop: '0.1em' }}>
          <h1
            className="anim-fade-up delay-3"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(3.25rem, 6.5vw, 6.5rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              paddingLeft: 'clamp(2rem, 5vw, 6rem)',
            }}
          >
            sin ruido.
          </h1>
        </div>

        {/* Ornament */}
        <div
          className="anim-fade-up delay-4"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '3rem',
            marginBottom: '2.5rem',
            maxWidth: '260px',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '0.8rem',
              color: 'var(--accent)',
              flexShrink: 0,
            }}
          >
            ◆
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Body */}
        <p
          className="anim-fade-up delay-5"
          style={{
            fontFamily: 'var(--font-crimson)',
            fontSize: '1.1875rem',
            lineHeight: 1.8,
            color: 'var(--text-secondary)',
            maxWidth: '420px',
          }}
        >
          Escribe y publica en tu propio espacio. Sin suscripciones, sin algoritmos, sin correos. Solo tú y tus lectores.
        </p>

        {/* CTA */}
        <div className="anim-fade-up delay-6" style={{ marginTop: '2.5rem' }}>
          <Link href="/register" className="btn-primary">
            Crea tu blog gratis
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="anim-fade-in delay-6"
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 2.5rem',
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '0.65rem',
            letterSpacing: '0.06em',
            color: 'var(--text-tertiary)',
          }}
        >
          © {new Date().getFullYear()} KipPost
        </span>
        <span
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '0.65rem',
            letterSpacing: '0.06em',
            color: 'var(--text-tertiary)',
          }}
        >
          Hecho para escritores
        </span>
      </footer>
    </div>
  )
}
