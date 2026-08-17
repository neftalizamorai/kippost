'use client'

import { useState, useEffect } from 'react'
import TagInput from './TagInput'

interface Props {
  excerpt: string
  tags: string[]
  published: boolean
  pinned: boolean
  onExcerptChange: (v: string) => void
  onTagsChange: (v: string[]) => void
  onPublishedChange: (v: boolean) => void
  onPinnedChange: (v: boolean) => void
  onClose: () => void
  onDelete?: () => void
  deleting?: boolean
}

export default function PostSettingsPanel({
  excerpt, tags, published, pinned,
  onExcerptChange, onTagsChange, onPublishedChange, onPinnedChange,
  onClose, onDelete, deleting,
}: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={handleClose}>
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{ background: 'rgba(0,0,0,0.2)', opacity: visible ? 1 : 0 }}
      />
      <div
        className="relative w-full max-w-xs h-full flex flex-col transition-transform duration-200 overflow-y-auto"
        style={{
          background: 'var(--bg)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Ajustes del post</h2>
          <button
            onClick={handleClose}
            className="hover:opacity-60 transition-opacity"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 px-5 py-5 flex flex-col gap-6">
          {/* Estado */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Estado</p>
            <div className="flex gap-2">
              {[
                { label: 'Borrador', value: false },
                { label: 'Publicado', value: true },
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => onPublishedChange(opt.value)}
                  className="flex-1 text-xs py-1.5 rounded border transition-all"
                  style={{
                    borderColor: published === opt.value ? 'var(--text)' : 'var(--border)',
                    background: published === opt.value ? 'var(--text)' : 'transparent',
                    color: published === opt.value ? 'var(--bg)' : 'var(--text-secondary)',
                    fontWeight: published === opt.value ? 600 : 400,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
              {published ? 'Visible en tu blog público.' : 'Solo visible para ti.'}
            </p>
          </div>

          {/* Extracto */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Extracto{' '}
              <span style={{ color: 'var(--text-tertiary)' }}>(opcional)</span>
            </label>
            <textarea
              value={excerpt}
              onChange={e => onExcerptChange(e.target.value)}
              rows={3}
              placeholder="Descripción breve del post…"
              className="w-full text-sm rounded border px-3 py-2 outline-none resize-none leading-relaxed"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text)',
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Aparece en el listado y en redes sociales.
            </p>
          </div>

          {/* Etiquetas */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Etiquetas
            </label>
            <TagInput tags={tags} onChange={onTagsChange} />
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Enter o coma para añadir</p>
          </div>

          {/* Anclar */}
          <label
            className="flex items-center gap-2 text-sm cursor-pointer select-none"
            style={{ color: pinned ? 'var(--text)' : 'var(--text-secondary)' }}
            title="Aparece como enlace en la barra de navegación del blog"
          >
            <input
              type="checkbox"
              checked={pinned}
              onChange={e => onPinnedChange(e.target.checked)}
              className="rounded"
            />
            <svg
              width="11" height="11" viewBox="0 0 24 24"
              fill={pinned ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <line x1="12" y1="17" x2="12" y2="22"/>
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
            </svg>
            Anclar en navegación
          </label>
        </div>

        {/* Eliminar */}
        {onDelete && (
          <div
            className="px-5 py-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <button
              onClick={onDelete}
              disabled={deleting}
              className="w-full text-xs px-4 py-2 rounded border transition-colors hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
              style={{ borderColor: '#e03e3e', color: '#e03e3e' }}
            >
              {deleting ? 'Eliminando…' : 'Eliminar post'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
