'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateExcerpt } from '@/lib/utils'
import Link from 'next/link'
import { RichTextEditor } from '@/components/RichTextEditor'
import { toast } from 'sonner'

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
  const [initialHtml, setInitialHtml] = useState<string | null>(null)
  const [excerpt, setExcerpt] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
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
        setExcerpt(data.excerpt || '')
        setTagsInput(data.tags?.join(', ') || '')
        setPublished(data.published)

        // Convert Markdown to HTML for old posts
        let html = data.content || ''
        if (html && !html.trimStart().startsWith('<')) {
          const { marked } = await import('marked')
          html = marked.parse(html) as string
        }
        setInitialHtml(html)
        setContent(html)
      }
      setLoading(false)
    }
    load()
  }, [postId])

  const handleSave = async () => {
    if (!title.trim()) { setError('El título es obligatorio.'); return }
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const finalExcerpt = excerpt.trim() || generateExcerpt(plainText)

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
      toast.error(err.message)
    } else {
      setSaved(true)
      toast.success(published ? 'Post publicado' : 'Cambios guardados')
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
      <div className="flex items-center justify-center h-64">
        <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Cargando...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-10">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Post no encontrado.</p>
        <Link href="/dashboard" className="text-sm mt-2 block hover:underline" style={{ color: 'var(--text)' }}>← Volver</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm hover:opacity-60 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
            ← Volver
          </Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <h1 className="text-sm font-medium" style={{ color: 'var(--text)' }}>Editando post</h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="rounded" />
            Publicado
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-medium px-4 py-1.5 rounded hover:opacity-90 disabled:opacity-50"
            style={{ background: saved ? '#3a7a52' : 'var(--text)', color: 'var(--bg)' }}
          >
            {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm px-3 py-1.5 rounded border transition-colors hover:bg-red-50 disabled:opacity-50"
            style={{ borderColor: 'var(--border)', color: '#e03e3e' }}
          >
            {deleting ? '...' : 'Eliminar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 rounded text-sm" style={{ background: 'rgba(224,62,62,0.08)', color: '#e03e3e' }}>
          {error}
        </div>
      )}

      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Título"
        className="w-full text-3xl font-bold bg-transparent border-none outline-none mb-6 leading-tight"
        style={{ color: 'var(--text)' }}
      />

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
            Extracto
          </label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Breve descripción del post."
            className="w-full px-3 py-2 text-sm rounded border outline-none resize-none focus:ring-1 focus:ring-[var(--text)] transition-all leading-relaxed"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
            Contenido
          </label>
          {initialHtml !== null && (
            <RichTextEditor content={initialHtml} onChange={setContent} />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
            Etiquetas
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="javascript, web, tutorial"
            className="w-full px-3 py-2 text-sm rounded border outline-none focus:ring-1 focus:ring-[var(--text)] transition-all"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Separadas por coma</p>
        </div>
      </div>
    </div>
  )
}
