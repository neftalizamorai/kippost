'use client'

import { useState, useRef } from 'react'
import type { CoverOptions } from '@/lib/coverOptions'
import { coverStyle } from '@/lib/coverOptions'

interface Props {
  src: string
  options: CoverOptions
  onChange: (opts: CoverOptions) => void
  onClose: () => void
}

const DEFAULTS: Required<CoverOptions> = { x: 50, y: 50, brightness: 1, contrast: 1, saturate: 1 }

export default function CoverImageEditor({ src, options, onChange, onClose }: Props) {
  const [draft, setDraft] = useState<Required<CoverOptions>>({ ...DEFAULTS, ...options })
  const imgRef = useRef<HTMLDivElement>(null)

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    setDraft(d => ({ ...d, x, y }))
  }

  const slider = (
    key: keyof typeof DEFAULTS,
    label: string,
    min: number,
    max: number,
    step: number
  ) => (
    <div className="flex items-center gap-3">
      <span className="text-xs w-20 shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={draft[key]}
        onChange={e => setDraft(d => ({ ...d, [key]: parseFloat(e.target.value) }))}
        className="flex-1 accent-current"
      />
      <span className="text-xs w-8 text-right tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
        {draft[key].toFixed(1)}
      </span>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg overflow-hidden flex flex-col"
        style={{ background: 'var(--bg)', boxShadow: '0 8px 40px rgba(0,0,0,0.2)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Editar portada</span>
          <button onClick={onClose} className="hover:opacity-60 transition-opacity" style={{ color: 'var(--text-tertiary)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Image preview — click to set focal point */}
        <div
          ref={imgRef}
          className="relative overflow-hidden cursor-crosshair shrink-0"
          style={{ height: '220px' }}
          onClick={handleImageClick}
          title="Haz clic para elegir el punto focal"
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover pointer-events-none select-none"
            style={coverStyle(draft)}
          />
          {/* focal point dot */}
          <div
            className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none"
            style={{
              left: `${draft.x}%`,
              top: `${draft.y}%`,
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255,255,255,0.3)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.3)',
            }}
          />
          <div
            className="absolute bottom-2 left-0 right-0 text-center text-xs pointer-events-none"
            style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            Haz clic para elegir el punto focal
          </div>
        </div>

        {/* Sliders */}
        <div className="px-5 py-4 flex flex-col gap-4 flex-1 overflow-y-auto">
          {slider('brightness', 'Brillo', 0.5, 1.5, 0.05)}
          {slider('contrast', 'Contraste', 0.5, 1.5, 0.05)}
          {slider('saturate', 'Saturación', 0, 2, 0.05)}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setDraft({ ...DEFAULTS })}
            className="text-sm hover:opacity-60 transition-opacity"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Restaurar
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-sm px-3 py-1.5 rounded border transition-colors hover:bg-[var(--bg-hover)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              Cancelar
            </button>
            <button
              onClick={() => { onChange(draft); onClose() }}
              className="text-sm px-4 py-1.5 rounded font-medium"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
