'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setUsername(data.username || '')
        setName(data.name || '')
        setBio(data.bio || '')
        setAvatarUrl(data.avatar_url || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: err } = await supabase
      .from('profiles')
      .update({ name: name.trim(), bio: bio.trim(), avatar_url: avatarUrl.trim() })
      .eq('id', user.id)

    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-8 py-10">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Perfil</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
        Tu blog público está en{' '}
        <span className="font-mono text-xs" style={{ color: 'var(--text)' }}>/blog/{username}</span>
      </p>

      {/* Avatar preview */}
      {avatarUrl && (
        <div className="mb-6 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={56}
              height={56}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{name || username}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>@{username}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text)' }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            disabled
            className="w-full px-3 py-2 text-sm rounded border cursor-not-allowed opacity-60"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>El username no se puede cambiar.</p>
        </div>

        <div>
          <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text)' }}>
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded border outline-none focus:ring-1 focus:ring-[var(--text)] transition-all"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text)' }}>
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="Cuéntale a tus lectores quién eres..."
            className="w-full px-3 py-2 text-sm rounded border outline-none resize-none focus:ring-1 focus:ring-[var(--text)] transition-all leading-relaxed"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-tertiary)' }}>{bio.length}/200</p>
        </div>

        <div>
          <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text)' }}>
            URL del avatar
          </label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 text-sm rounded border outline-none focus:ring-1 focus:ring-[var(--text)] transition-all"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Usa una URL de imagen pública (ej: Gravatar, imgur).</p>
        </div>

        {error && (
          <p className="text-sm" style={{ color: '#e03e3e' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="text-sm font-medium px-5 py-2 rounded hover:opacity-90 disabled:opacity-50"
          style={{ background: saved ? '#3a7a52' : 'var(--text)', color: 'var(--bg)' }}
        >
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
