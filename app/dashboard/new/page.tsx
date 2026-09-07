'use client'

import { useState, useEffect, useRef, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { useFocusMode } from '@/contexts/FocusContext'
import PostSettingsPanel, { type BlogSection } from '@/components/PostSettingsPanel'
import CoverImageEditor from '@/components/CoverImageEditor'
import { type CoverOptions, coverStyle } from '@/lib/coverOptions'

const BlockNoteEditor = dynamic(() => import('@/components/BlockNoteEditor'), { ssr: false })

const DRAFT_KEY = 'kippost:new-draft'

function extractFirstParagraph(contentJson: string): string {
  try {
    const blocks = JSON.parse(contentJson)
    if (!Array.isArray(blocks)) return ''
    const first = blocks.find((b: any) => Array.isArray(b.content) && b.content.length > 0)
    return first?.content?.map((c: any) => c.text ?? '').join('') ?? ''
  } catch { return '' }
}

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [published, setPublished] = useState(false)
  const [unlisted, setUnlisted] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [postSections, setPostSections] = useState<string[]>([])
  const [blogSections, setBlogSections] = useState<BlogSection[]>([])
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [initialContent, setInitialContent] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [showSettings, setShowSettings] = useState(false)
  const [showCoverEditor, setShowCoverEditor] = useState(false)
  const [coverOptions, setCoverOptions] = useState<CoverOptions>({})
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const autoSaveRef = useRef<ReturnType<typeof setInterval>>()
  const draftIdRef = useRef<string | null>(null)
  const autoSavingRef = useRef(false)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const { focusMode, toggleFocusMode } = useFocusMode()

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.title || draft.content) {
          setTitle(draft.title || '')
          setInitialContent(draft.content || '')
          setContent(draft.content || '')
          setExcerpt(draft.excerpt || '')
          setTags(draft.tags || [])
          setPinned(draft.pinned || false)
          setCoverImageUrl(draft.coverImageUrl || '')
          setCoverOptions(draft.coverOptions || {})
        }
      }
    } catch {}
    setInitialized(true)
    setInitialContent(prev => prev ?? '')
    // Load user's blog sections
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('blog_sections').eq('id', user.id).single()
        .then(({ data }) => { if (data?.blog_sections) setBlogSections(data.blog_sections as BlogSection[]) })
    })
  }, [])

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [title])

  useEffect(() => {
    if (!initialized) return
    if (!title && !content) return
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content, excerpt, tags, pinned, coverImageUrl, coverOptions }))
      } catch {}
    }, 2000)
    return () => clearTimeout(saveTimerRef.current)
  }, [title, content, excerpt, tags, pinned, coverImageUrl, coverOptions, initialized])

  useEffect(() => {
    autoSaveRef.current = setInterval(async () => {
      if (!title.trim() || !initialized || autoSavingRef.current) return
      autoSavingRef.current = true
      setAutoSaveStatus('saving')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const finalExcerpt = excerpt.trim() || extractFirstParagraph(content)

      if (draftIdRef.current) {
        await supabase.from('posts').update({
          title: title.trim(), content, excerpt: finalExcerpt,
          tags: tags.filter(Boolean), cover_image_url: coverImageUrl || null,
          cover_image_options: coverOptions,
          updated_at: new Date().toISOString(),
        }).eq('id', draftIdRef.current)
      } else {
        const { data } = await supabase.from('posts').insert({
          user_id: user.id, title: title.trim(), content,
          excerpt: finalExcerpt, tags: tags.filter(Boolean),
          published: false, slug: slugify(title) + '-' + Date.now().toString(36),
          cover_image_url: coverImageUrl || null,
          cover_image_options: coverOptions,
        }).select('id').single()
        if (data) draftIdRef.current = data.id
      }
      autoSavingRef.current = false
      setAutoSaveStatus('saved')
      setTimeout(() => setAutoSaveStatus('idle'), 3000)
    }, 30000)
    return () => clearInterval(autoSaveRef.current)
  }, [title, content, excerpt, tags, coverImageUrl, coverOptions, initialized])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusMode) toggleFocusMode()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [focusMode, toggleFocusMode])

  const handleSave = async () => {
    if (!title.trim()) { toast.error('El título es obligatorio.'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const slug = slugify(title)
    const finalExcerpt = excerpt.trim() || extractFirstParagraph(content)
    const payload = {
      user_id: user.id,
      title: title.trim(),
      content,
      excerpt: finalExcerpt,
      tags: tags.filter(Boolean),
      published,
      unlisted,
      pinned,
      post_sections: postSections,
      slug,
      cover_image_url: coverImageUrl || null,
      cover_image_options: coverOptions,
    }
    if (draftIdRef.current) {
      const { error: err } = await supabase.from('posts').update({
        ...payload,
        updated_at: new Date().toISOString(),
      }).eq('id', draftIdRef.current)
      if (err) { toast.error(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('posts').insert(payload)
      if (err?.code === '23505') {
        const { error: retryErr } = await supabase.from('posts').insert({ ...payload, slug: `${slug}-${Date.now().toString(36)}` })
        if (retryErr) { toast.error(retryErr.message); setSaving(false); return }
      } else if (err) {
        toast.error(err.message); setSaving(false); return
      }
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
      if (error) { toast.error(error.message); return }
      const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(filePath)
      setCoverImageUrl(publicUrl)
      setCoverOptions({})
      e.target.value = ''
      // Resolution check
      const img = new window.Image()
      img.onload = () => {
        if (img.naturalWidth < 1200) {
          toast.warning('Resolución baja — recomendamos 1600 × 840 px o más')
        } else if (img.naturalWidth < 1600) {
          toast('Resolución aceptable — 1600 × 840 px sería ideal')
        }
      }
      img.src = publicUrl
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <input id="cover-upload-new" type="file" accept="image/*" className="sr-only" onChange={handleCoverUpload} disabled={uploading} />

      {coverImageUrl && (
        <div className="relative group/cover w-full overflow-hidden" style={{ height: '280px' }}>
          <img src={coverImageUrl} alt="" className="w-full h-full object-cover" style={coverStyle(coverOptions)} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover/cover:opacity-100 transition-opacity" />
          <div className="absolute bottom-3 right-5 flex gap-2 opacity-0 group-hover/cover:opacity-100 transition-opacity">
            <button type="button" onClick={() => setShowCoverEditor(true)} className="text-xs px-3 py-1.5 rounded font-medium shadow-sm hover:bg-white transition-colors" style={{ background: 'rgba(255,255,255,0.9)', color: '#374151' }}>
              Editar
            </button>
            <label htmlFor="cover-upload-new" className="cursor-pointer text-xs px-3 py-1.5 rounded font-medium shadow-sm transition-colors hover:bg-white" style={{ background: 'rgba(255,255,255,0.9)', color: '#374151' }}>
              {uploading ? 'Subiendo…' : 'Cambiar'}
            </label>
            <button type="button" onClick={() => { setCoverImageUrl(''); setCoverOptions({}) }} className="text-xs px-3 py-1.5 rounded font-medium shadow-sm hover:bg-white transition-colors" style={{ background: 'rgba(255,255,255,0.9)', color: '#374151' }}>
              Eliminar
            </button>
          </div>
        </div>
      )}

      <div className={focusMode ? 'max-w-3xl mx-auto px-8 py-8' : 'px-8 sm:px-16 py-8'}>
        {/* Topbar */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm hover:opacity-60 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Dashboard
          </Link>
          {autoSaveStatus !== 'idle' && (
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {autoSaveStatus === 'saving' ? 'Guardando…' : '✓ Guardado'}
            </span>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFocusMode}
              className="text-sm px-2.5 py-1.5 rounded border transition-colors hover:bg-[var(--bg-hover)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              title={focusMode ? 'Salir del modo enfoque' : 'Modo enfoque'}
            >
              {focusMode ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                  <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="text-sm px-2.5 py-1.5 rounded border transition-colors hover:bg-[var(--bg-hover)] relative"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              title="Ajustes del post"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="6" y1="18" x2="18" y2="18"/>
              </svg>
              {published && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: '#28c840' }} />
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm font-medium px-4 py-1.5 rounded hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* Title area */}
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

          <textarea
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') e.preventDefault() }}
            placeholder="Sin título"
            rows={1}
            className="w-full text-4xl font-bold bg-transparent border-none outline-none leading-tight mb-3 placeholder-[var(--text-tertiary)] resize-none overflow-hidden"
            style={{ color: 'var(--text)' }}
          />
        </div>

        <div className="mb-8" style={{ borderTop: '1px solid var(--border)' }} />

        <div className="mb-10" style={focusMode ? { fontSize: '18px' } : undefined}>
          {initialized && initialContent !== null && (
            <BlockNoteEditor initialContent={initialContent} onChange={setContent} />
          )}
        </div>
      </div>

      {showSettings && (
        <PostSettingsPanel
          excerpt={excerpt}
          tags={tags}
          published={published}
          unlisted={unlisted}
          pinned={pinned}
          postSections={postSections}
          blogSections={blogSections}
          onExcerptChange={setExcerpt}
          onTagsChange={setTags}
          onPublishedChange={setPublished}
          onUnlistedChange={setUnlisted}
          onPinnedChange={setPinned}
          onPostSectionsChange={setPostSections}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showCoverEditor && coverImageUrl && (
        <CoverImageEditor
          src={coverImageUrl}
          options={coverOptions}
          onChange={setCoverOptions}
          onClose={() => setShowCoverEditor(false)}
        />
      )}
    </div>
  )
}
