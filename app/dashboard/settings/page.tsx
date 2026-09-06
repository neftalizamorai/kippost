'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { toast } from 'sonner'

interface SocialLinks {
  website?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  github?: string
  youtube?: string
  tiktok?: string
}

const NETWORKS: { key: keyof SocialLinks; label: string; placeholder: string; prefix: string; icon: React.ReactNode }[] = [
  {
    key: 'website',
    label: 'Sitio web',
    placeholder: 'https://tusitio.com',
    prefix: '',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    key: 'twitter',
    label: 'Twitter / X',
    placeholder: 'usuario (sin @)',
    prefix: 'twitter.com/',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    placeholder: 'usuario (sin @)',
    prefix: 'instagram.com/',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'usuario',
    prefix: 'linkedin.com/in/',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    key: 'github',
    label: 'GitHub',
    placeholder: 'usuario',
    prefix: 'github.com/',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
  },
  {
    key: 'youtube',
    label: 'YouTube',
    placeholder: '@canal o URL completa',
    prefix: '',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    placeholder: 'usuario (sin @)',
    prefix: 'tiktok.com/@',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
      </svg>
    ),
  },
]

function sanitizeDomain(raw: string): string {
  return raw.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0]
}

const TEMPLATE_FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  hero: [
    { key: 'greeting', label: 'Saludo', placeholder: "Hey, I'm" },
    { key: 'articlesTitle', label: 'Título de artículos', placeholder: 'My Latest Articles' },
  ],
  minimal: [
    { key: 'tabHome', label: 'Tab Inicio', placeholder: 'Inicio' },
    { key: 'tabArchive', label: 'Tab Archivo', placeholder: 'Archivo' },
    { key: 'tabAbout', label: 'Tab Sobre mí', placeholder: 'Sobre mí' },
  ],
}

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [username, setUsername] = useState('')
  const [social, setSocial] = useState<SocialLinks>({})
  const [template, setTemplate] = useState('minimal')
  const [templateConfig, setTemplateConfig] = useState<Record<string, Record<string, string>>>({})
  const [savedDomain, setSavedDomain] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [domainConnecting, setDomainConnecting] = useState(false)
  const [dnsRecords, setDnsRecords] = useState<{ type: string; domain: string; value: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

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
        setSocial(data.social_links || {})
        setTemplate(data.template || 'minimal')
        setTemplateConfig(data.template_config || {})
        setSavedDomain(data.custom_domain ?? '')
        setCustomDomain(data.custom_domain ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede superar 2 MB.')
      return
    }

    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const supabase = createClient()

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (error) {
      toast.error(error.message)
    } else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      // Cache-bust so the browser loads the new image
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`)
      toast.success('Foto actualizada')
    }
    setUploading(false)
  }

  const handleDomainConnect = async () => {
    const domain = sanitizeDomain(customDomain)
    if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
      toast.error('Ingresa un dominio válido, ej: midominio.com')
      return
    }
    setDomainConnecting(true)
    try {
      const res = await fetch('/api/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      })
      const data = await res.json()
      if (data.ok) {
        setSavedDomain(domain)
        setCustomDomain(domain)
        // Always show the DNS records needed to point the domain to Vercel.
        // verification[] from Vercel is for ownership proof only and may be empty.
        const isApex = !domain.split('.').slice(0, -2).join('.') || domain.split('.').length === 2
        const staticRecords = isApex
          ? [
              { type: 'A', domain: '@', value: '76.76.21.21' },
              { type: 'CNAME', domain: 'www', value: 'cname.vercel-dns.com' },
            ]
          : [{ type: 'CNAME', domain: domain.split('.')[0], value: 'cname.vercel-dns.com' }]
        setDnsRecords(staticRecords)
        toast.success('Dominio conectado')
      } else {
        toast.error(data.error ?? 'Error al conectar dominio')
      }
    } catch {
      toast.error('Error de conexión')
    }
    setDomainConnecting(false)
  }

  const handleDomainDisconnect = async () => {
    setDomainConnecting(true)
    try {
      const res = await fetch('/api/domain', { method: 'DELETE' })
      const data = await res.json()
      if (data.ok) {
        setSavedDomain('')
        setCustomDomain('')
        setDnsRecords([])
        toast.success('Dominio desconectado')
      } else {
        toast.error(data.error ?? 'Error al desconectar dominio')
      }
    } catch {
      toast.error('Error de conexión')
    }
    setDomainConnecting(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); toast.error('Sesión expirada, vuelve a iniciar sesión.'); return }

    const cleanSocial: SocialLinks = {}
    for (const { key } of NETWORKS) {
      const val = social[key]?.trim()
      if (val) cleanSocial[key] = val
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        name: name.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim(),
        social_links: cleanSocial,
        template,
        template_config: templateConfig,
      })
      .eq('id', user.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Cambios guardados')
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
        <span className="font-mono text-xs" style={{ color: 'var(--text)' }}>/@{username}</span>
      </p>

      {/* Avatar uploader */}
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 group"
          style={{ border: '1px solid var(--border)' }}
          title="Cambiar foto"
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-semibold" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              {name?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.45)' }}>
            {uploading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            )}
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{name || username}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>@{username}</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-xs mt-1 hover:underline disabled:opacity-50"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {uploading ? 'Subiendo...' : 'Cambiar foto'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Basic info */}
        <div>
          <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text)' }}>Username</label>
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
          <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text)' }}>Nombre</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded border outline-none focus:ring-1 focus:ring-[var(--text)] transition-all"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text)' }}>Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="Cuéntale a tus lectores quién eres..."
            className="w-full px-3 py-2 text-sm rounded border outline-none resize-none focus:ring-1 focus:ring-[var(--text)] transition-all leading-relaxed"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-tertiary)' }}>{bio.length}/200</p>
        </div>

        {/* Social links */}
        <div className="pt-2">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Redes sociales</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
            Aparecerán como iconos en tu perfil público.
          </p>
          <div className="space-y-3">
            {NETWORKS.map(({ key, label, placeholder, prefix, icon }) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 flex items-center justify-center rounded flex-shrink-0"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  {icon}
                </div>
                <div className="flex-1 flex items-center rounded border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  {prefix && (
                    <span
                      className="px-2 py-2 text-xs border-r flex-shrink-0 select-none"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}
                    >
                      {prefix}
                    </span>
                  )}
                  <input
                    type="text"
                    value={social[key] ?? ''}
                    onChange={e => setSocial(s => ({ ...s, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                    style={{ color: 'var(--text)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template picker */}
        <div className="pt-2">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Template del blog</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
            Elige cómo se ve tu página pública.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: 'minimal',
                label: 'Minimal',
                desc: 'Avatar pequeño, bio compacta, tabs de navegación',
                preview: (
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: 'var(--bg-secondary)' }} />
                      <div className="space-y-0.5">
                        <div className="h-2 w-16 rounded" style={{ background: 'var(--bg-secondary)' }} />
                        <div className="h-1.5 w-10 rounded" style={{ background: 'var(--bg-secondary)' }} />
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded" style={{ background: 'var(--bg-secondary)' }} />
                    <div className="h-1.5 w-3/4 rounded" style={{ background: 'var(--bg-secondary)' }} />
                    <div className="flex gap-2 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                      {['·','·','·'].map((_, i) => <div key={i} className="h-1.5 w-8 rounded" style={{ background: 'var(--bg-secondary)' }} />)}
                    </div>
                  </div>
                ),
              },
              {
                id: 'hero',
                label: 'Hero',
                desc: 'Avatar grande, saludo destacado, bio en cita',
                preview: (
                  <div className="p-3 space-y-2">
                    <div className="w-8 h-8 rounded-full" style={{ background: 'linear-gradient(135deg,#c9a84c,#f0d080)', padding: '2px' }}>
                      <div className="w-full h-full rounded-full" style={{ background: 'var(--bg-secondary)' }} />
                    </div>
                    <div className="h-3 w-20 rounded font-bold" style={{ background: 'var(--text)', opacity: 0.15 }} />
                    <div className="pl-2 space-y-0.5" style={{ borderLeft: '2px solid var(--border)' }}>
                      <div className="h-1.5 w-full rounded" style={{ background: 'var(--bg-secondary)' }} />
                      <div className="h-1.5 w-4/5 rounded" style={{ background: 'var(--bg-secondary)' }} />
                    </div>
                  </div>
                ),
              },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className="text-left rounded border overflow-hidden transition-all"
                style={{
                  borderColor: template === t.id ? 'var(--text)' : 'var(--border)',
                  boxShadow: template === t.id ? '0 0 0 1px var(--text)' : 'none',
                }}
              >
                <div style={{ background: 'var(--bg-secondary)' }}>
                  {t.preview}
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>{t.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Text customization per template */}
        {TEMPLATE_FIELDS[template] && (
          <div className="pt-2">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Personalizar textos</p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
              Deja vacío para usar el texto por defecto.
            </p>
            <div className="space-y-3">
              {TEMPLATE_FIELDS[template].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={templateConfig[template]?.[field.key] ?? ''}
                    onChange={e => setTemplateConfig(prev => ({
                      ...prev,
                      [template]: { ...prev[template], [field.key]: e.target.value },
                    }))}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 text-sm rounded border outline-none focus:ring-1 focus:ring-[var(--text)] transition-all"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="text-sm font-medium px-5 py-2 rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      {/* Custom domain — intentionally outside <form> so Enter/submit can't interfere */}
      <div className="pt-6 mt-6" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Dominio personalizado</p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
          Usa tu propio dominio como la cara pública de tu cuenta en lugar de /@{username}.
        </p>

        {savedDomain ? (
          <div className="space-y-3">
            <div
              className="flex items-center justify-between px-3 py-2 rounded border"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#28c840' }} />
                <span className="text-sm font-mono" style={{ color: 'var(--text)' }}>{savedDomain}</span>
              </div>
              <button
                type="button"
                onClick={handleDomainDisconnect}
                disabled={domainConnecting}
                className="text-xs hover:underline disabled:opacity-50"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {domainConnecting ? 'Desconectando...' : 'Desconectar'}
              </button>
            </div>
            {dnsRecords.length > 0 && (
              <div className="rounded border text-xs" style={{ borderColor: 'var(--border)' }}>
                <div className="px-3 py-2 font-medium" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                  Configura estos registros DNS en tu registrador de dominios:
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {dnsRecords.map((rec, i) => (
                    <div key={i} className="px-3 py-2 grid grid-cols-3 gap-2 font-mono" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>{rec.type}</span>
                      <span>{rec.domain}</span>
                      <span style={{ color: 'var(--text)' }}>{rec.value}</span>
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2" style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border)' }}>
                  La propagación DNS puede tardar hasta 48 horas.
                </div>
              </div>
            )}
            {dnsRecords.length === 0 && (
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Dominio registrado en Vercel. Asegúrate de que tu DNS tenga un registro A apuntando a <span className="font-mono">76.76.21.21</span> o un CNAME a <span className="font-mono">cname.vercel-dns.com</span>.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                onBlur={e => setCustomDomain(sanitizeDomain(e.target.value))}
                placeholder="midominio.com"
                className="flex-1 px-3 py-2 text-sm rounded border outline-none focus:ring-1 focus:ring-[var(--text)] transition-all"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <button
                type="button"
                onClick={handleDomainConnect}
                disabled={domainConnecting || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(sanitizeDomain(customDomain))}
                className="text-sm px-4 py-2 rounded font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
                style={{ background: 'var(--text)', color: 'var(--bg)' }}
              >
                {domainConnecting ? 'Conectando...' : 'Conectar'}
              </button>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Solo el dominio, sin https:// ni www. Ej: <span className="font-mono">midominio.com</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
