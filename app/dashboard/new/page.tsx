'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify, generateExcerpt } from '@/lib/utils'
import Link from 'next/link'
import { RichTextEditor } from '@/components/RichTextEditor'

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSave = async () => {
    if (!title.trim()) { setError('El título es obligatorio.'); return }
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
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
      if (retryErr) { setError(retryErr.message); setSaving(false); return }
    } else if (err) {
      setError(err.message); setSaving(false); return
    }

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
          <RichTextEditor content="" onChange={setContent} />
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
