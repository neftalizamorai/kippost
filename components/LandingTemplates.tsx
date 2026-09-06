'use client'

import { useState } from 'react'
import Link from 'next/link'

export function LandingInteractive() {
  const [handle, setHandle] = useState('')
  const [mode, setMode] = useState<'Lector' | 'Editor'>('Lector')
  const handleShown = handle.trim() === '' ? 'ana' : handle.replace(/\s+/g, '').toLowerCase()
  const registerHref = handle.trim() ? `/register?handle=${encodeURIComponent(handleShown)}` : '/register'

  return (
    <>
      {/* Handle input row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '4px', padding: '0 0 0 12px', background: 'var(--bg)' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>kippost.com/@</span>
          <input
            type="text"
            value={handle}
            onChange={e => setHandle(e.target.value)}
            placeholder="tunombre"
            spellCheck={false}
            style={{ fontFamily: 'inherit', fontSize: '14px', color: 'var(--text)', border: 'none', outline: 'none', padding: '9px 12px 9px 1px', width: '130px', background: 'transparent' }}
          />
        </div>
        <Link
          href={registerHref}
          className="hover:opacity-90 transition-opacity"
          style={{ fontSize: '14px', fontWeight: 500, color: 'var(--bg)', background: 'var(--text)', padding: '10px 18px', borderRadius: '4px', whiteSpace: 'nowrap' }}
        >
          Reservarla
        </Link>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '14px 0 0' }}>
        Gratis. Sin tarjeta. Puedes escribir el primer post en dos minutos.
      </p>

      {/* Browser preview */}
      <div style={{ marginTop: '72px', width: '100%', maxWidth: '860px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', textAlign: 'left' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', margin: 0 }}>
            Así lo ve quien te lee
          </p>
          <div style={{ display: 'flex', gap: '2px', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px' }}>
            {(['Lector', 'Editor'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="transition-colors"
                style={{
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  border: 'none',
                  borderRadius: '2px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  background: mode === m ? 'var(--bg-hover)' : 'transparent',
                  color: mode === m ? 'var(--text)' : 'var(--text-secondary)',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden', textAlign: 'left' }}>
          {/* Browser chrome */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '9999px', border: '1px solid var(--border)', display: 'inline-block' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '9999px', border: '1px solid var(--border)', display: 'inline-block' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '9999px', border: '1px solid var(--border)', display: 'inline-block' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '8px' }}>
              kippost.com/@{handleShown}
            </span>
          </div>

          {mode === 'Lector' ? <ReaderView /> : <EditorView />}
        </div>
      </div>
    </>
  )
}

function ReaderView() {
  return (
    <div style={{ padding: '56px 24px 64px' }}>
      <div style={{ maxWidth: '34em', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9999px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>
            A
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: 'var(--text)' }}>Ana Ruiz</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Notas sobre casas, plantas y mudanzas</p>
          </div>
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.3, margin: '0 0 8px', color: 'var(--text)' }}>
          Sobre volver a casa después de mucho tiempo
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 32px' }}>12 de mayo · 6 min</p>
        <p style={{ fontSize: '17px', lineHeight: 1.75, margin: '0 0 20px', color: 'var(--text)' }}>
          La casa de mis padres huele igual que hace veinte años y eso me desarma cada vez. No es nostalgia exactamente. Es más bien la sensación de que una parte de mí se quedó aquí esperando, ordenada, sin gastarse.
        </p>
        <p style={{ fontSize: '17px', lineHeight: 1.75, margin: '0 0 24px', color: 'var(--text)' }}>
          Escribo esto en la mesa de la cocina, con el mismo mantel de hule. Mi madre pasa por detrás y no pregunta qué hago.
        </p>
        <blockquote style={{ margin: '0 0 24px', paddingLeft: '16px', borderLeft: '3px solid var(--border)', color: 'var(--text-secondary)', fontSize: '17px', lineHeight: 1.75 }}>
          Volver no es retroceder. Es comprobar que el sitio sigue ahí sin ti.
        </blockquote>
        <p style={{ fontSize: '17px', lineHeight: 1.75, margin: 0, color: 'var(--text)' }}>
          Al final me llevé dos cosas: una foto de mi abuela en la playa y el bote de canela que ya no usa nadie.
        </p>
        <div style={{ marginTop: '48px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Escrito por Ana Ruiz</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            <svg width="10" height="10" viewBox="0 0 24 24">
              <rect x="3" y="6" width="18" height="2.6" rx="1" fill="currentColor" />
              <rect x="3" y="11" width="18" height="2.6" rx="1" fill="currentColor" />
              <rect x="3" y="16" width="10" height="2.6" rx="1" fill="currentColor" />
            </svg>
            Publicado con KipPost
          </span>
        </div>
      </div>
    </div>
  )
}

function EditorView() {
  return (
    <div style={{ padding: '56px 24px 64px' }}>
      <div style={{ maxWidth: '34em', margin: '0 auto' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.3, margin: '0 0 24px', color: 'var(--text)' }}>
          Sobre volver a casa después de mucho tiempo
        </h2>
        <p style={{ fontSize: '17px', lineHeight: 1.75, margin: '0 0 20px', color: 'var(--text)' }}>
          La casa de mis padres huele igual que hace veinte años y eso me desarma cada vez.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '17px', color: 'var(--text)' }}>/</span>
          <span style={{ width: '1px', height: '20px', background: 'var(--text)', display: 'inline-block' }} />
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: '4px', width: '260px', overflow: 'hidden', background: 'var(--bg)' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', margin: 0, padding: '10px 12px 6px' }}>
            Bloques
          </p>
          {[
            { label: 'Encabezado', icon: <span style={{ fontSize: '13px', color: 'var(--text-secondary)', width: '16px', display: 'inline-block' }}>H2</span>, active: true },
            { label: 'Lista', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
            { label: 'Imagen', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg> },
            { label: 'Cita', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 7h4v6a4 4 0 0 1-4 4"/><path d="M15 7h4v6a4 4 0 0 1-4 4"/></svg> },
            { label: 'Tabla', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="10" y1="10" x2="10" y2="20"/></svg> },
            { label: 'Divisor', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="12" x2="20" y2="12"/></svg> },
            { label: 'Embed', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12 19"/></svg> },
          ].map(({ label, icon, active }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '7px 12px',
                background: active ? 'var(--bg-hover)' : undefined,
                color: 'var(--text-secondary)',
              }}
            >
              {icon}
              <span style={{ fontSize: '14px', color: 'var(--text)' }}>{label}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '16px 0 0' }}>
          Nada de esto está en pantalla hasta que escribes &ldquo;/&rdquo;.
        </p>
      </div>
    </div>
  )
}
