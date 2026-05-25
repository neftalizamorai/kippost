'use client'

import { useState, useEffect, useRef, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify, generateExcerpt } from '@/lib/utils'
import Link from 'next/link'
import { RichTextEditor } from '@/components/RichTextEditor'
import TagInput from '@/components/TagInput'
import { toast } from 'sonner'

const DRAFT_KEY = 'kippost:new-draft'

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [draftContent, setDraftContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const coverInputRef = useRef<HTMLInputElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const router = useRouter()

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.title || draft.content) {
          setTitle(draft.title || '')
          setDraftContent(draft.content || '')
          setContent(draft.content || '')
          setExcerpt(draft.excerpt || '')
          setTags(draft.tags || [])
          setCoverImageUrl(draft.coverImageUrl || '')
        }
      }
    } catch {}
    setInitialized(true)
  }, [])

  // Autosave debounced
  useEffect(() => {
    if (!initialized) return
    if (!title && !content) return

    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content, excerpt, tags, coverImageUrl }))
      } catch {}
    }, 2000)

    return () => clearTimeout(saveTimerRef.current)
  }, [title, content, excerpt, tags, coverImageUrl, initialized])

  const handleSave = async () => {
    if (!title.trim()) { toast.error('El título es obligatorio.'); return }
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const slug = slugify(title)
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const finalExcerpt = excerpt.trim() || generateExcerpt(plainText)

    const payload = { user_id: user.id, title: title.trim(), content, excerpt: finalExcerpt, tags, published, slug, cover_image_url: coverImageUrl || null }

    const { error: err } = await supabase.from('posts').insert(payload)

    if (err?.code === '23505') {
      const { error: retryErr } = await supabase.from('posts').insert({
        ...payload,
        slug: `${slug}-${Date.now().toString(36)}`,
      })
      if (retryErr) { toast.error(retryErr.message); setSaving(false); return }
    } else if (err) {
      toast.error(err.message); setSaving(false); return
    }

    try { localStorage.removeItem(DRAFT_KEY) } catch {}
    toast.success(published ? 'Post publicado' : 'Borrador guardado')
    router.push('/dashboard')
  }

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('covers').upload(path, file, { upsert: true })
    if (error) { toast.error(error.message); return }
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(path)
    setCoverImageUrl(publicUrl)
    e.target.value = ''
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm hover:opacity-60 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
            ← Volver
          </Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <h1 className="text-sm font-medium" style={{ color: 'var(--text)' }}>Nuevo post</h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="rounded" />
            Publicar
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-medium px-4 py-1.5 rounded hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            {saving ? 'Guardando...' : published ? 'Publicar' : 'Guardar borrador'}
          </button>
        </div>
      </div>

      {/* Cover image */}
      <div className="mb-6">
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
        {coverImageUrl ? (
          <div className="relative group rounded overflow-hidden" style={{ height: '220px' }}>
            <img src={coverImageUrl} alt="Portada" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button type="button" onClick={() => coverInputRef.current?.click()} className="text-white text-sm px-3 py-1.5 rounded-md bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors">Cambiar</button>
              <button type="button" onClick={() => setCoverImageUrl('')} className="text-white text-sm px-3 py-1.5 rounded-md bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors">Eliminar</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => coverInputRef.current?.click()} className="flex items-center gap-2 text-sm transition-opacity hover:opacity-60" style={{ color: 'var(--text-tertiary)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            Añadir imagen de portada
          </button>
        )}
      </div>

      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Título"
        className="w-full text-3xl font-bold bg-transparent border-none outline-none mb-6 leading-tight placeholder-[var(--text-tertiary)]"
        style={{ color: 'var(--text)' }}
      />

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
            Extracto <span className="normal-case font-normal">(opcional)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Breve descripción del post. Si lo dejas vacío, se generará automáticamente."
            className="w-full px-3 py-2 text-sm rounded border outline-none resize-none focus:ring-1 focus:ring-[var(--text)] transition-all leading-relaxed"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
            Contenido
          </label>
          {initialized && (
            <RichTextEditor content={draftContent} onChange={setContent} />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
            Etiquetas
          </label>
          <TagInput tags={tags} onChange={setTags} />
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Escribe y presiona Enter o coma para añadir
          </p>
        </div>
      </div>
    </div>
  )
}
