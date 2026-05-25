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
  const [uploading, setUploading] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const router = useRouter()

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
      const { error: retryErr } = await supabase.from('posts').insert({ ...payload, slug: `${slug}-${Date.now().toString(36)}` })
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <input id="cover-upload-new" type="file" accept="image/*" className="sr-only" onChange={handleCoverUpload} disabled={uploading} />

      {/* Full-bleed cover */}
      {coverImageUrl && (
        <div className="relative group/cover w-full overflow-hidden" style={{ height: '280px' }}>
          <img src={coverImageUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover/cover:opacity-100 transition-opacity" />
          <div className="absolute bottom-3 right-5 flex gap-2 opacity-0 group-hover/cover:opacity-100 transition-opacity">
            <label htmlFor="cover-upload-new" className="cursor-pointer text-xs px-3 py-1.5 rounded font-medium shadow-sm transition-colors hover:bg-white" style={{ background: 'rgba(255,255,255,0.9)', color: '#374151' }}>
              {uploading ? 'Subiendo…' : 'Cambiar portada'}
            </label>
            <button type="button" onClick={() => setCoverImageUrl('')} className="text-xs px-3 py-1.5 rounded font-medium shadow-sm hover:bg-white transition-colors" style={{ background: 'rgba(255,255,255,0.9)', color: '#374151' }}>
              Eliminar
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-8 sm:px-16 py-8">
        {/* Topbar */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm hover:opacity-60 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="rounded" />
              Publicar
            </label>
            <button onClick={handleSave} disabled={saving} className="text-sm font-medium px-4 py-1.5 rounded hover:opacity-90 disabled:opacity-50" style={{ background: 'var(--text)', color: 'var(--bg)' }}>
              {saving ? 'Guardando…' : published ? 'Publicar' : 'Guardar borrador'}
            </button>
          </div>
        </div>

        {/* Title area — ghost actions appear on hover */}
        <div className="group/page mb-10">
          <div className="flex gap-1 mb-3 h-6 items-center opacity-0 group-hover/page:opacity-100 transition-opacity">
            {!coverImageUrl && (
              <label htmlFor="cover-upload-new" className="cursor-pointer inline-flex items-center gap-1.5 text-sm px-2 py-1 rounded transition-colors hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-tertiary)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                {uploading ? 'Subiendo…' : 'Añadir portada'}
              </label>
            )}
          </div>

          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Sin título"
            className="w-full text-4xl font-bold bg-transparent border-none outline-none leading-tight mb-3 placeholder-[var(--text-tertiary)]"
            style={{ color: 'var(--text)' }}
          />

          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Añade un extracto…"
            className="w-full text-lg bg-transparent border-none outline-none resize-none leading-relaxed placeholder-[var(--text-tertiary)]"
            style={{ color: 'var(--text-secondary)' }}
          />
        </div>

        <div className="mb-8" style={{ borderTop: '1px solid var(--border)' }} />

        <div className="mb-10">
          {initialized && <RichTextEditor content={draftContent} onChange={setContent} />}
        </div>

        <div className="pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <TagInput tags={tags} onChange={setTags} />
          <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
            Enter o coma para añadir etiquetas
          </p>
        </div>
      </div>
    </div>
  )
}
