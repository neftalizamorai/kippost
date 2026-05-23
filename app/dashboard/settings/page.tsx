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

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '2.5rem 2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '2rem',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            lineHeight: 1.1,
          }}
        >
          Perfil público
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '0.7rem',
            color: 'var(--text-tertiary)',
            marginTop: '0.5rem',
            letterSpacing: '0.04em',
          }}
        >
          Tu blog está en{' '}
          <code
            style={{
              fontFamily: 'monospace',
              background: 'var(--bg-secondary)',
              padding: '1px 5px',
              borderRadius: '2px',
              border: '1px solid var(--border)',
              color: 'var(--accent)',
              fontSize: '0.7rem',
            }}
          >
            /blog/{username}
          </code>
        </p>
      </div>

      {/* Avatar preview */}
      {avatarUrl && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1rem 1.25rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={52}
              height={52}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              unoptimized
            />
          </div>
          <div>
            <p
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              {name || username}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '0.675rem',
                color: 'var(--accent)',
                marginTop: '0.125rem',
                letterSpacing: '0.04em',
              }}
            >
              @{username}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.375rem' }}>
        {/* Username (readonly) */}
        <div>
          <label className="kip-label">Username</label>
          <input
            type="text"
            value={username}
            disabled
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
            El username no se puede cambiar
          </p>
        </div>

        <div>
          <label className="kip-label">Nombre público</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu Nombre"
            className="kip-input"
          />
        </div>

        <div>
          <label className="kip-label">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="Cuéntale a tus lectores quién eres..."
            className="kip-input"
            style={{ resize: 'none', lineHeight: 1.65 }}
          />
          <p
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '0.65rem',
              color: 'var(--text-tertiary)',
              marginTop: '0.375rem',
              textAlign: 'right',
              letterSpacing: '0.04em',
            }}
          >
            {bio.length} / 200
          </p>
        </div>

        <div>
          <label className="kip-label">URL del avatar</label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
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
            Usa una URL pública (Gravatar, imgur, etc.)
          </p>
        </div>

        {error && (
          <p
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '0.75rem',
              color: 'var(--error)',
              padding: '0.625rem 0.75rem',
              background: 'rgba(224, 112, 112, 0.08)',
              borderRadius: '3px',
              border: '1px solid rgba(224, 112, 112, 0.2)',
            }}
          >
            {error}
          </p>
        )}

        <div style={{ paddingTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{
              background: saved ? 'var(--success)' : 'var(--accent)',
              borderColor: saved ? 'var(--success)' : 'var(--accent)',
            }}
          >
            {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
