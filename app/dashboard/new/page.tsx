'use client'

import { useState, useEffect, useRef } from 'react'
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
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content, excerpt, tags }))
      } catch {}
    }, 2000)

    return () => clearTimeout(saveTimerRef.current)
  }, [title, content, excerpt, tags, initialized])

  const handleSave = async () => {
    if (!title.trim()) { toast.error('El título es obligatorio.'); return }
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const slug = slugify(title)
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const finalExcerpt = excerpt.trim() || generateExcerpt(plainText)

    const payload = { user_id: user.id, title: title.trim(), content, excerpt: finalExcerpt, tags, published, slug }

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
