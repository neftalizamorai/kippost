'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface Props {
  username: string
  publishedCount: number
  draftCount: number
}

export default function SidebarNavLinks({ username, publishedCount, draftCount }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') ?? 'published'

  const isActive = (href: string) => pathname === href
  const isTab = (t: string) => tab === t && pathname === '/dashboard'

  const navItem = (href: string, label: string, icon: React.ReactNode, external?: boolean) => (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded text-sm transition-colors hover:bg-[var(--bg-hover)]"
      style={{
        color: 'var(--text)',
        background: isActive(href) && !external ? 'var(--bg-hover)' : undefined,
        fontWeight: isActive(href) && !external ? 500 : 400,
      }}
    >
      <span style={{ color: isActive(href) ? 'var(--text)' : 'var(--text-secondary)' }}>{icon}</span>
      <span className="flex-1">{label}</span>
      {external && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      )}
    </Link>
  )

  const subItem = (href: string, label: string, count?: number) => (
    <Link
      href={href}
      className="flex items-center justify-between pl-8 pr-2.5 py-1 rounded text-sm transition-colors hover:bg-[var(--bg-hover)]"
      style={{
        color: isTab(href.includes('draft') ? 'draft' : 'published') ? 'var(--text)' : 'var(--text-secondary)',
        background: isTab(href.includes('draft') ? 'draft' : 'published') ? 'var(--bg-hover)' : undefined,
        fontWeight: isTab(href.includes('draft') ? 'draft' : 'published') ? 500 : 400,
      }}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}>
          {count}
        </span>
      )}
    </Link>
  )

  return (
    <nav className="flex flex-col gap-0.5">
      {navItem('/dashboard', 'Inicio',
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )}

      {username && navItem(`/blog/${username}`, 'Sitio web',
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>,
        true
      )}

      {/* Crear button */}
      <Link
        href="/dashboard/new"
        className="flex items-center justify-center gap-2 mt-3 mb-2 px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
        style={{ background: 'var(--text)', color: 'var(--bg)' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Crear
      </Link>

      {/* CONTENIDO section */}
      <p className="text-xs font-medium uppercase tracking-widest mt-2 mb-1 px-2.5" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
        Contenido
      </p>

      {/* Publicaciones parent + children */}
      <div>
        <div
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded text-sm"
          style={{ color: 'var(--text)', fontWeight: pathname === '/dashboard' ? 500 : 400 }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </span>
          Publicaciones
        </div>
        <div className="flex flex-col gap-0.5 mt-0.5">
          {subItem('/dashboard?tab=published', 'Publicado', publishedCount)}
          {subItem('/dashboard?tab=draft', 'Borradores', draftCount)}
        </div>
      </div>

      {navItem('/dashboard/settings', 'Ajustes',
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      )}
    </nav>
  )
}
