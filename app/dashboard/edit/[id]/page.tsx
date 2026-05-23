'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateExcerpt } from '@/lib/utils'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  tags: string[]
  published: boolean
  slug: string
}

export default function EditPostPage() {
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [previewHtml, setPreviewHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (data) {
        setPost(data)
        setTitle(data.title)
        setContent(data.content)
        setExcerpt(data.excerpt || '')
        setTagsInput(data.tags?.join(', ') || '')
        setPublished(data.published)
      }
      setLoading(false)
    }
    load()
  }, [postId])

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
    if (!title.trim()) { setError('El título es obligatorio.'); return }

    setSaving(true)
    setError(null)

    const supabase = createClient()
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const finalExcerpt = excerpt.trim() || generateExcerpt(content)

    const { error: err } = await supabase
      .from('posts')
      .update({
        title: title.trim(),
        content,
        excerpt: finalExcerpt,
        tags,
        published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)

    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este post? Esta acción no se puede deshacer.')) return

    setDeleting(true)
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', postId)
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <span
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.125rem',
            fontStyle: 'italic',
            color: 'var(--text-tertiary)',
          }}
        >
          Cargando...
        </span>
      </div>
    )
  }

  if (!post) {
    return (
      <div style={{ padding: '2.5rem 2rem' }}>
        <p style={{ fontFamily: 'var(--font-syne)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Post no encontrado.
        </p>
        <Link
          href="/dashboard"
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '0.7rem',
            color: 'var(--text-tertiary)',
            textDecoration: 'underline',
            display: 'block',
            marginTop: '0.75rem',
          }}
        >
          ← Volver al dashboard
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Toolbar */}
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
        {/* Left */}
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
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Editando
          </span>
        </div>

        {/* Right: controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
          <button onClick={handlePreview} className="btn-ghost">
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
            Publicado
          </label>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{
              background: saved ? 'var(--success)' : 'var(--accent)',
              borderColor: saved ? 'var(--success)' : 'var(--accent)',
            }}
          >
            {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar'}
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger"
          >
            {deleting ? '...' : 'Eliminar'}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="kip-label">Extracto</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Una descripción breve que atraiga a los lectores..."
              className="kip-input"
              style={{ resize: 'none', lineHeight: 1.65 }}
            />
          </div>

          <div>
            <label className="kip-label">
              Contenido{' '}
              <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                (Markdown)
              </span>
            </label>

            {tab === 'write' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
