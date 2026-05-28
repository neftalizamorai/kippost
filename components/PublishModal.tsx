'use client'

import { useState } from 'react'
import TagInput from './TagInput'

export interface ModalData {
  excerpt: string
  tags: string[]
  pinned: boolean
  published: boolean
}

interface Props {
  initialExcerpt: string
  initialTags: string[]
  initialPinned: boolean
  initialPublished: boolean
  saving: boolean
  onClose: () => void
  onConfirm: (data: ModalData) => void
}

export default function PublishModal({
  initialExcerpt, initialTags, initialPinned, initialPublished,
  saving, onClose, onConfirm,
}: Props) {
  const [excerpt, setExcerpt] = useState(initialExcerpt)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [pinned, setPinned] = useState(initialPinned)
  const [published, setPublished] = useState(initialPublished)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.35)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-5"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
        }}
      >
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Ajustes del post
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            Revisa antes de guardar
          </p>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Extracto{' '}
            <span style={{ color: 'var(--text-tertiary)' }}>(opcional)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Descripción breve del post…"
            className="w-full text-sm rounded border px-3 py-2 outline-none resize-none leading-relaxed"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text)',
            }}
          />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Etiquetas
          </label>
          <TagInput tags={tags} onChange={setTags} />
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Enter o coma para añadir
          </p>
        </div>

        <div className="flex items-center gap-5">
          <label
            className="flex items-center gap-2 text-sm cursor-pointer select-none"
            style={{ color: 'var(--text-secondary)' }}
          >
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              className="rounded"
            />
            Publicar
          </label>
          <label
            className="flex items-center gap-2 text-sm cursor-pointer select-none"
            style={{ color: pinned ? 'var(--text)' : 'var(--text-secondary)' }}
            title="Aparece como enlace en la barra de navegación del blog"
          >
            <input
              type="checkbox"
              checked={pinned}
              onChange={e => setPinned(e.target.checked)}
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

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 text-sm px-4 py-2 rounded border transition-colors hover:bg-[var(--bg-hover)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm({ excerpt, tags, pinned, published })}
            disabled={saving}
            className="flex-1 text-sm font-medium px-4 py-2 rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            {saving ? 'Guardando…' : published ? 'Publicar' : 'Guardar borrador'}
          </button>
        </div>
      </div>
    </div>
  )
}
