import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LandingTemplates } from '@/components/LandingTemplates'

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    title: 'Editor rico',
    desc: 'Escribe con un editor moderno que soporta imágenes, tablas, código y más. Sin distracciones.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: 'Tu URL propia',
    desc: 'Publica en kippost.com/@tú. Una dirección limpia y memorable que es tuya para siempre.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1" fill="currentColor"/>
      </svg>
    ),
    title: 'RSS incluido',
    desc: 'Feed RSS generado automáticamente para que tus lectores te sigan con su lector favorito.',
  },
]

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-8 py-4 sticky top-0 z-40"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}
      >
        <span className="text-base font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
          KipPost
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm px-3 py-1.5 rounded border transition-colors hover:bg-[var(--bg-hover)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="text-sm px-3 py-1.5 rounded font-medium hover:opacity-90"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            Comenzar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
        <div
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full mb-6"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#28c840' }} />
          Gratis, siempre
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5" style={{ color: 'var(--text)' }}>
          Tu blog personal,<br />sin ruido.
        </h1>
        <p className="text-lg max-w-sm mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Escribe y publica en tu propio espacio. Sin suscripciones, sin correos, solo tú y tus lectores.
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            href="/register"
            className="text-sm font-medium px-6 py-2.5 rounded hover:opacity-90 transition-opacity"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            Crea tu blog gratis →
          </Link>
          <Link
            href="/login"
            className="text-sm px-5 py-2.5 rounded transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* Template showcase */}
      <LandingTemplates />

      {/* Features */}
      <section className="py-16 px-6" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{f.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="py-20 px-6 text-center"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>
          Empieza hoy, gratis.
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          Tu espacio de escritura está a un click de distancia.
        </p>
        <Link
          href="/register"
          className="text-sm font-medium px-8 py-3 rounded hover:opacity-90 transition-opacity"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          Crear mi blog →
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs" style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border)' }}>
        KipPost · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
