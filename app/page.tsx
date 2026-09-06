import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LandingInteractive } from '@/components/LandingTemplates'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px', lineHeight: '1.5', WebkitFontSmoothing: 'antialiased' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '12px 24px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" style={{ display: 'block' }}>
            <rect x="3" y="6" width="18" height="2.6" rx="1" fill="var(--text)" />
            <rect x="3" y="11" width="18" height="2.6" rx="1" fill="var(--text)" />
            <rect x="3" y="16" width="10" height="2.6" rx="1" fill="var(--text)" />
          </svg>
          <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em' }}>KipPost</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link
            href="/login"
            className="hover:bg-[var(--bg-hover)] transition-colors"
            style={{ fontSize: '14px', color: 'var(--text-secondary)', padding: '5px 10px', borderRadius: '4px' }}
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="hover:opacity-90 transition-opacity"
            style={{ fontSize: '14px', fontWeight: 500, color: 'var(--bg)', background: 'var(--text)', padding: '6px 12px', borderRadius: '4px' }}
          >
            Crear mi blog
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '96px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: '1.15', margin: '0 0 18px', maxWidth: '16em' }}>
          Un sitio tranquilo para escribir.
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: '0 0 36px', maxWidth: '30em', lineHeight: '1.6' }}>
          Tu blog vive en una dirección que es tuya. Llega quien tú invitas, con el link que tú mandas. Sin algoritmo que decida, sin anuncios, sin nadie a quien seguirle el ritmo.
        </p>
        <LandingInteractive />
      </section>

      {/* Facts */}
      <section style={{ padding: '72px 24px 0' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
          {[
            { title: 'Tu dirección, para siempre', desc: 'kippost.com/@tunombre, o tu propio dominio cuando quieras. El link que mandas hoy sigue funcionando en diez años.' },
            { title: 'Los defaults ya están bien', desc: 'Publicar no pide decisiones: ni plantilla, ni portada, ni etiquetas. Si un día las quieres, están.' },
            { title: 'RSS y nada más', desc: 'Quien quiera seguirte lo hace con su lector. No pedimos correos a tus lectores ni les mandamos nada.' },
          ].map((f, i) => (
            <div key={i}>
              <p style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 6px' }}>{f.title}</p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '72px 24px 96px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', borderTop: '1px solid var(--border)', paddingTop: '56px', textAlign: 'center' }}>
          <p style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            Empieza con una página en blanco.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 28px' }}>Es todo lo que hace falta.</p>
          <Link
            href="/register"
            className="hover:opacity-90 transition-opacity"
            style={{ display: 'inline-block', fontSize: '14px', fontWeight: 500, color: 'var(--bg)', background: 'var(--text)', padding: '11px 22px', borderRadius: '4px' }}
          >
            Crear mi blog
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '18px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-tertiary)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24">
            <rect x="3" y="6" width="18" height="2.6" rx="1" fill="currentColor" />
            <rect x="3" y="11" width="18" height="2.6" rx="1" fill="currentColor" />
            <rect x="3" y="16" width="10" height="2.6" rx="1" fill="currentColor" />
          </svg>
          <span style={{ fontSize: '12px' }}>KipPost · 2026</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {[['Privacidad', '/privacidad'], ['Ayuda', '/ayuda'], ['RSS', '/rss']].map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-[var(--text-secondary)] transition-colors" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              {label}
            </Link>
          ))}
        </div>
      </footer>

    </div>
  )
}
