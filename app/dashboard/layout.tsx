import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import LogoutButton from './LogoutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, name')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '210px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem 0' }}>
          {/* Brand */}
          <div style={{ padding: '0 1.25rem', marginBottom: '2rem' }}>
            <Link
              href="/dashboard"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.375rem',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: 'var(--text)',
                textDecoration: 'none',
                display: 'block',
              }}
            >
              KipPost
            </Link>
            {profile && (
              <p
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontSize: '0.675rem',
                  letterSpacing: '0.04em',
                  color: 'var(--accent)',
                  marginTop: '0.25rem',
                }}
              >
                @{profile.username}
              </p>
            )}

            {/* Accent line */}
            <div
              style={{
                height: '1px',
                background: 'var(--border)',
                marginTop: '1.25rem',
              }}
            />
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <NavItem href="/dashboard" icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            }>
              Mis posts
            </NavItem>

            <NavItem href="/dashboard/new" icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            }>
              Nuevo post
            </NavItem>

            <NavItem href="/dashboard/settings" icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            }>
              Perfil
            </NavItem>

            {profile && (
              <NavItem
                href={`/blog/${profile.username}`}
                external
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                }
              >
                Ver blog
              </NavItem>
            )}
          </nav>

          {/* Bottom controls */}
          <div
            style={{
              padding: '1.125rem 1.25rem 0',
              marginTop: 'auto',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}

function NavItem({
  href,
  icon,
  children,
  external,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  external?: boolean
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      className="nav-item"
      style={{ margin: '0 0.625rem', borderRadius: '3px' }}
    >
      <span style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>{icon}</span>
      <span>{children}</span>
    </Link>
  )
}
