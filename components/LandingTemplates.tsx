'use client'

import { useState } from 'react'

export function LandingTemplates() {
  const [active, setActive] = useState<'minimal' | 'hero'>('minimal')

  return (
    <section className="py-16 px-6" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Elige tu estilo
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Dos templates para expresar quién eres. Cambia cuando quieras desde ajustes.
          </p>
        </div>

        {/* Template tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {(['minimal', 'hero'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className="px-5 py-1.5 text-sm rounded-full transition-all"
              style={
                active === t
                  ? { background: 'var(--text)', color: 'var(--bg)', fontWeight: 600 }
                  : { background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
              }
            >
              {t === 'minimal' ? 'Minimal' : 'Hero'}
            </button>
          ))}
        </div>

        {/* Browser mockup */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            border: '1px solid var(--border)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
          }}
        >
          {/* Browser chrome */}
          <div
            className="flex items-center gap-3 px-4 py-2.5"
            style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex gap-1.5 flex-shrink-0">
              <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
            </div>
            <div className="flex-1 flex justify-center">
              <div
                className="text-xs px-4 py-0.5 rounded"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text-tertiary)',
                  border: '1px solid var(--border)',
                  minWidth: '160px',
                  textAlign: 'center',
                }}
              >
                kippost.com/@{active === 'minimal' ? 'ana' : 'juan'}
              </div>
            </div>
          </div>

          {/* Preview content */}
          <div style={{ background: 'var(--bg)', minHeight: '300px' }}>
            {active === 'minimal' ? <MinimalPreview /> : <HeroPreview />}
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-tertiary)' }}>
          Personaliza textos, bio, redes sociales y más desde tu panel de ajustes.
        </p>
      </div>
    </section>
  )
}

function MinimalPreview() {
  return (
    <div
      className="max-w-lg mx-auto px-6 py-6 pointer-events-none select-none"
      style={{ fontSize: '11px' }}
    >
      {/* Top nav */}
      <div
        className="flex items-center justify-between mb-5 pb-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span style={{ color: 'var(--text)', fontWeight: 700, fontSize: '12px' }}>KipPost</span>
        <div className="flex gap-4" style={{ color: 'var(--text-secondary)' }}>
          <span>Inicio</span>
          <span>Archivo</span>
          <span>Sobre mí</span>
        </div>
      </div>

      {/* Profile */}
      <div className="flex items-start gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          A
        </div>
        <div>
          <div style={{ color: 'var(--text)', fontWeight: 700, fontSize: '13px' }}>Ana Martínez</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '1px' }}>@ana</div>
          <div className="mt-1.5" style={{ color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '260px' }}>
            Escritora y filósofa. Escribo sobre ideas que me obsesionan.
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        {[
          { title: 'La dificultad de empezar', date: '14 nov 2024', excerpt: 'Todo proyecto tiene un umbral invisible antes del primer paso...' },
          { title: 'Pensar en voz alta', date: '28 oct 2024', excerpt: 'Escribir es la mejor forma de descubrir lo que realmente piensas.' },
        ].map((p, i) => (
          <div key={i} className="py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-baseline justify-between gap-4">
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>{p.title}</span>
              <span style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>{p.date}</span>
            </div>
            <div className="mt-1" style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{p.excerpt}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HeroPreview() {
  return (
    <div
      className="max-w-lg mx-auto px-6 py-6 pointer-events-none select-none"
      style={{ fontSize: '11px' }}
    >
      {/* Profile hero */}
      <div className="mb-6">
        <div
          className="w-14 h-14 rounded-full mb-3 flex-shrink-0 flex items-center justify-center text-lg font-bold"
          style={{
            background: 'linear-gradient(135deg, #e8c96e 0%, #f5e0a0 100%)',
            color: '#8a6e1a',
          }}
        >
          J
        </div>
        <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Hey, I'm</div>
        <div style={{ color: 'var(--text)', fontSize: '20px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Juan García
        </div>
        <div
          className="pl-3 py-1.5"
          style={{ borderLeft: '2px solid var(--border)' }}
        >
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            "Diseñador y escritor apasionado por la comunicación visual y las ideas."
          </div>
        </div>
      </div>

      {/* Articles label */}
      <div
        className="mb-3 uppercase tracking-widest"
        style={{ color: 'var(--text-tertiary)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em' }}
      >
        My Latest Articles
      </div>

      {/* Article cards */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { title: 'El arte de simplificar', date: '12 nov 2024' },
          { title: 'Diseño como comunicación', date: '3 oct 2024' },
        ].map((p, i) => (
          <div
            key={i}
            className="p-3 rounded"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ color: 'var(--text)', fontWeight: 600, lineHeight: 1.35, marginBottom: '4px' }}>
              {p.title}
            </div>
            <div style={{ color: 'var(--text-tertiary)' }}>{p.date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
