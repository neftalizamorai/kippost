'use client'

import { useState, useEffect, useRef, ChangeEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateExcerpt } from '@/lib/utils'
import Link from 'next/link'
import { RichTextEditor } from '@/components/RichTextEditor'
import TagInput from '@/components/TagInput'
import { toast } from 'sonner'

interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  tags: string[]
  published: boolean
  pinned: boolean
  slug: string
  cover_image_url: string | null
}

export default function EditPostPage() {
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [initialHtml, setInitialHtml] = useState<string | null>(null)
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [published, setPublished] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
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
        setTags(data.tags ?? [])
        setPublished(data.published)
        setPinned(data.pinned ?? false)
        setCoverImageUrl(data.cover_image_url || '')

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
    const cleanTags = tags.filter(Boolean)
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const finalExcerpt = excerpt.trim() || generateExcerpt(plainText)

    const { error: err } = await supabase
      .from('posts')
      .update({
        title: title.trim(),
        content,
        excerpt: finalExcerpt,
        tags: cleanTags,
        published,
        pinned,
        cover_image_url: coverImageUrl || null,
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
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) {
      toast.error(error.message)
      setDeleting(false)
      return
    }
    router.push('/dashboard')
  }

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) { toast.error('No autenticado'); return }
      const ext = file.name.split('.').pop() ?? 'jpg'
      const filePath = `${user.id}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('covers').upload(filePath, file, { upsert: true })
      if (error) { console.error('Cover upload error:', error); toast.error(error.message); return }
      const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(filePath)
      setCoverImageUrl(publicUrl)
      e.target.value = ''
    } finally {
      setUploading(false)
    }
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
          <label
            className="flex items-center gap-1.5 text-sm cursor-pointer select-none"
            style={{ color: pinned ? 'var(--text)' : 'var(--text-secondary)' }}
            title="Aparece como enlace en la barra de navegación del blog"
          >
            <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} className="rounded" />
            <svg width="12" height="12" viewBox="0 0 24 24" fill={pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
            </svg>
            Anclar en nav
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

      {/* Cover image */}
      <div className="mb-6">
        <input
          id="cover-upload-edit"
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleCoverUpload}
          disabled={uploading}
        />
        {coverImageUrl ? (
          <div className="relative group rounded overflow-hidden" style={{ height: '220px' }}>
            <img src={coverImageUrl} alt="Portada" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <label htmlFor="cover-upload-edit" className="cursor-pointer text-white text-sm px-3 py-1.5 rounded-md bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors">
                {uploading ? 'Subiendo...' : 'Cambiar'}
              </label>
              <button type="button" onClick={() => setCoverImageUrl('')} className="text-white text-sm px-3 py-1.5 rounded-md bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors">Eliminar</button>
            </div>
          </div>
        ) : (
          <label htmlFor="cover-upload-edit" className="flex items-center gap-2 text-sm cursor-pointer transition-opacity hover:opacity-60" style={{ color: 'var(--text-tertiary)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            {uploading ? 'Subiendo imagen...' : 'Añadir imagen de portada'}
          </label>
        )}
      </div>

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
          <TagInput tags={tags} onChange={setTags} />
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Escribe y presiona Enter o coma para añadir</p>
        </div>
      </div>
    </div>
  )
}
