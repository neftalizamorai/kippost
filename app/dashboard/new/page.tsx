'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify, generateExcerpt } from '@/lib/utils'
import Link from 'next/link'

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [previewHtml, setPreviewHtml] = useState('')
  const router = useRouter()

  const handlePreview = async () => {
    if (tab === 'write') {
      const { marked } = await import('marked')
      setPreviewHtml(marked.parse(content) as string)
      setTab('preview')
    } else {
      setTab('write')
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('El título es obligatorio.')
      return
    }

    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const slug = slugify(title)
    const finalExcerpt = excerpt.trim() || generateExcerpt(content)

    const payload = {
      user_id: user.id,
      title: title.trim(),
      content,
      excerpt: finalExcerpt,
      tags,
      published,
      slug,
    }

    const { error: err } = await supabase.from('posts').insert(payload)

    if (err?.code === '23505') {
      const { error: retryErr } = await supabase.from('posts').insert({
        ...payload,
        slug: `${slug}-${Date.now().toString(36)}`,
      })
      if (retryErr) { setError(retryErr.message); setSaving(false); return }
    } else if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Editor toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 2rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          flexShrink: 0,
          gap: '1rem',
        }}
      >
        {/* Left: back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
              textDecoration: 'none',
              flexShrink: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            ← Volver
          </Link>
          <div style={{ width: '1px', height: '16px', background: 'var(--border)', flexShrink: 0 }} />
          <span
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
            }}
          >
            Nuevo post
          </span>
        </div>

        {/* Right: controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
          {/* Preview toggle */}
          <button
            onClick={handlePreview}
            className="btn-ghost"
          >
            {tab === 'write' ? 'Vista previa' : 'Editar'}
          </button>

          {/* Publish toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-syne)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              onClick={() => setPublished(!published)}
              style={{
                width: '32px',
                height: '18px',
                borderRadius: '9px',
                background: published ? 'var(--accent)' : 'var(--border)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: published ? '16px' : '2px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: 'var(--bg)',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                }}
              />
            </div>
            Publicar
          </label>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Guardando...' : published ? 'Publicar' : 'Guardar borrador'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '0.625rem 2rem',
            fontFamily: 'var(--font-syne)',
            fontSize: '0.75rem',
            color: 'var(--error)',
            background: 'rgba(224, 112, 112, 0.08)',
            borderBottom: '1px solid rgba(224, 112, 112, 0.2)',
          }}
        >
          {error}
        </div>
      )}

      {/* Editor body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2.5rem 2rem',
          maxWidth: '820px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Title input */}
        <textarea
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          placeholder="Título de tu historia..."
          rows={1}
          className="editor-title"
          style={{ marginBottom: '1.5rem', overflow: 'hidden' }}
        />

        {/* Ornament */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '0.75rem',
              color: 'var(--accent)',
            }}
          >
            ◆
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Excerpt */}
          <div>
            <label className="kip-label">
              Extracto{' '}
              <span
                style={{
                  fontWeight: 400,
                  textTransform: 'none',
                  letterSpacing: 0,
                  color: 'var(--text-tertiary)',
                }}
              >
                (opcional — se genera automáticamente)
              </span>
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Una descripción breve que atraiga a los lectores..."
              className="kip-input"
              style={{ resize: 'none', lineHeight: 1.65 }}
            />
          </div>

          {/* Content */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <label className="kip-label" style={{ marginBottom: 0 }}>
                Contenido{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  (Markdown)
                </span>
              </label>
            </div>

            {tab === 'write' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`## Introducción\n\nEscribe tu historia aquí...\n\n## Sección\n\nMás contenido...`}
                className="kip-input"
                style={{
                  resize: 'vertical',
                  minHeight: '380px',
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                  fontSize: '0.8125rem',
                  lineHeight: 1.7,
                }}
              />
            ) : (
              <div
                className="prose"
                style={{
                  minHeight: '380px',
                  padding: '1.25rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="kip-label">Etiquetas</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="javascript, web, tutorial"
              className="kip-input"
            />
            <p
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '0.65rem',
                color: 'var(--text-tertiary)',
                marginTop: '0.375rem',
                letterSpacing: '0.02em',
              }}
            >
              Separadas por coma
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
