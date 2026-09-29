'use client'

import { useState, useEffect } from 'react'
import TagInput from './TagInput'

export interface BlogSection {
  id: string
  name: string
}

interface Props {
  excerpt: string
  tags: string[]
  published: boolean
  unlisted: boolean
  pinned: boolean
  hideDate: boolean
  postSections: string[]
  pinnedSections: string[]
  blogSections: BlogSection[]
  onExcerptChange: (v: string) => void
  onTagsChange: (v: string[]) => void
  onPublishedChange: (v: boolean) => void
  onUnlistedChange: (v: boolean) => void
  onPinnedChange: (v: boolean) => void
  onHideDateChange: (v: boolean) => void
  onPostSectionsChange: (v: string[]) => void
  onPinnedSectionsChange: (v: string[]) => void
  onClose: () => void
  onDelete?: () => void
  deleting?: boolean
}

type Estado = 'draft' | 'public' | 'unlisted'

export default function PostSettingsPanel({
  excerpt, tags, published, unlisted, pinned, hideDate, postSections, pinnedSections, blogSections,
  onExcerptChange, onTagsChange, onPublishedChange, onUnlistedChange,
  onPinnedChange, onHideDateChange, onPostSectionsChange, onPinnedSectionsChange, onClose, onDelete, deleting,
}: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const estado: Estado = !published ? 'draft' : unlisted ? 'unlisted' : 'public'

  const setEstado = (e: Estado) => {
    if (e === 'draft') { onPublishedChange(false); onUnlistedChange(false) }
    else if (e === 'public') { onPublishedChange(true); onUnlistedChange(false) }
    else { onPublishedChange(true); onUnlistedChange(true) }
  }

  const toggleSection = (id: string) => {
    const inSection = postSections.includes(id)
    onPostSectionsChange(
      inSection ? postSections.filter(s => s !== id) : [...postSections, id]
    )
    // Remove section pin when unchecking
    if (inSection && pinnedSections.includes(id)) {
      onPinnedSectionsChange(pinnedSections.filter(s => s !== id))
    }
  }

  const togglePinnedSection = (id: string) => {
    onPinnedSectionsChange(
      pinnedSections.includes(id)
        ? pinnedSections.filter(s => s !== id)
        : [...pinnedSections, id]
    )
  }

  const ESTADO_OPTIONS: { label: string; value: Estado; desc: string }[] = [
    { label: 'Borrador', value: 'draft', desc: 'Solo visible para ti.' },
    { label: 'Publicado', value: 'public', desc: 'Aparece en Inicio.' },
    { label: 'No listado', value: 'unlisted', desc: 'Accesible por URL, no en Inicio.' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={handleClose}>
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{ background: 'rgba(0,0,0,0.2)', opacity: visible ? 1 : 0 }}
      />
      <div
        className="relative w-full max-w-xs h-full flex flex-col transition-transform duration-200 overflow-y-auto"
        style={{
          background: 'var(--bg-surface)',
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
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Visibilidad</p>
            <div className="flex flex-col gap-1.5">
              {ESTADO_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setEstado(opt.value)}
                  className="flex items-center gap-3 px-3 py-2 rounded border text-left transition-all"
                  style={{
                    borderColor: estado === opt.value ? 'var(--text)' : 'var(--border)',
                    background: estado === opt.value ? 'var(--text)' : 'transparent',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: estado === opt.value ? 'var(--bg)' : 'var(--text-tertiary)' }}
                  />
                  <div>
                    <p className="text-xs font-medium" style={{ color: estado === opt.value ? 'var(--bg)' : 'var(--text)' }}>
                      {opt.label}
                    </p>
                    <p className="text-xs" style={{ color: estado === opt.value ? 'rgba(128,128,128,0.7)' : 'var(--text-tertiary)' }}>
                      {opt.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Secciones */}
          {blogSections.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Secciones</p>
              <div className="flex flex-col gap-1.5">
                {blogSections.map(s => {
                  const inSection = postSections.includes(s.id)
                  const isPinned = pinnedSections.includes(s.id)
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={inSection}
                          onChange={() => toggleSection(s.id)}
                          className="w-3.5 h-3.5 rounded"
                          style={{ accentColor: 'var(--text)' }}
                        />
                        <span className="text-sm" style={{ color: 'var(--text)' }}>{s.name}</span>
                      </label>
                      {inSection && (
                        <button
                          type="button"
                          onClick={() => togglePinnedSection(s.id)}
                          title={isPinned ? 'Quitar pin de sección' : 'Fijar en esta sección'}
                          className="flex-shrink-0 hover:opacity-70 transition-opacity"
                          style={{ color: isPinned ? 'var(--text)' : 'var(--text-tertiary)' }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="17" x2="12" y2="22"/>
                            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                El post aparecerá en las secciones seleccionadas. Pin = primero en esa sección.
              </p>
            </div>
          )}

          {/* Extracto */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Extracto <span style={{ color: 'var(--text-tertiary)' }}>(opcional)</span>
            </label>
            <textarea
              value={excerpt}
              onChange={e => onExcerptChange(e.target.value)}
              rows={3}
              placeholder="Descripción breve del post…"
              className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none leading-relaxed focus:ring-2 focus:ring-[var(--text)]"
              style={{
                border: '1px solid var(--border)',
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

          {/* Anclar + Ocultar fecha */}
          <div className="flex flex-col gap-3">
            <label
              className="flex items-center gap-2 text-sm cursor-pointer select-none"
              style={{ color: pinned ? 'var(--text)' : 'var(--text-secondary)' }}
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

            <label
              className="flex items-center gap-2 text-sm cursor-pointer select-none"
              style={{ color: hideDate ? 'var(--text)' : 'var(--text-secondary)' }}
            >
              <input
                type="checkbox"
                checked={hideDate}
                onChange={e => onHideDateChange(e.target.checked)}
                className="rounded"
              />
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                {hideDate && <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor"/>}
              </svg>
              Ocultar fecha de publicación
            </label>
          </div>
        </div>

        {/* Eliminar */}
        {onDelete && (
          <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
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
