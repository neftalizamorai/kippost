'use client'

import { useState, useEffect, Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import LogoutButton from '@/app/dashboard/LogoutButton'
import SidebarNavLinks from '@/components/SidebarNavLinks'
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb'
import { FocusProvider, useFocusMode } from '@/contexts/FocusContext'

interface Props {
  profile: { username: string; name: string; avatar_url: string | null } | null
  publishedCount: number
  draftCount: number
  siteName: string
  children: React.ReactNode
}

function DashboardShellInner({ profile, publishedCount, draftCount, siteName, children }: Props) {
  const [open, setOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { focusMode } = useFocusMode()
  const pathname = usePathname()

  const isEditorPage = !!(
    pathname?.startsWith('/dashboard/new') ||
    pathname?.includes('/dashboard/edit/')
  )

  useEffect(() => {
    setSidebarCollapsed(isEditorPage)
  }, [isEditorPage])

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed md:static inset-y-0 left-0 z-40',
          'flex-shrink-0 flex flex-col h-screen overflow-hidden',
          'transition-all duration-200 ease-in-out',
          focusMode
            ? 'hidden'
            : [
                'w-64',
                open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
                sidebarCollapsed ? 'md:w-11' : 'md:w-56',
              ].join(' '),
        ].join(' ')}
        style={{ borderRight: '1px solid var(--border)', background: 'var(--bg)' }}
      >
        {/* Thin strip — only on desktop when collapsed */}
        {sidebarCollapsed && (
          <div className="hidden md:flex flex-col items-center pt-3 flex-1">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-8 h-8 flex items-center justify-center rounded transition-colors hover:bg-[var(--bg-hover)]"
              title="Mostrar panel"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="18" rx="2"/>
                <line x1="8" y1="3" x2="8" y2="21"/>
              </svg>
            </button>
          </div>
        )}

        {/* Full sidebar content — always on mobile, only when expanded on desktop */}
        <div className={`flex flex-col flex-1 overflow-hidden min-h-0 ${sidebarCollapsed ? 'md:hidden' : ''}`}>
          {/* User section */}
          <div className="p-3 flex items-center gap-1" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded transition-colors hover:bg-[var(--bg-hover)] cursor-default flex-1 min-w-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  style={{ border: '1px solid var(--border)' }}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  {profile?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                {profile?.name ?? 'Usuario'}
              </span>
            </div>
            {/* Collapse button */}
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="hidden md:flex w-7 h-7 items-center justify-center rounded transition-colors hover:bg-[var(--bg-hover)] flex-shrink-0"
              title="Ocultar panel"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="18" rx="2"/>
                <line x1="8" y1="3" x2="8" y2="21"/>
              </svg>
            </button>
          </div>

          {/* Nav */}
          <div className="flex-1 p-3 overflow-y-auto">
            <Suspense>
              <SidebarNavLinks
                username={profile?.username ?? ''}
                publishedCount={publishedCount}
                draftCount={draftCount}
                onNavigate={() => setOpen(false)}
              />
            </Suspense>
          </div>

          {/* Bottom */}
          <div className="p-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header
          className={`flex items-center gap-3 px-4 md:px-6 flex-shrink-0 ${focusMode ? 'md:hidden' : ''}`}
          style={{ borderBottom: '1px solid var(--border)', height: '44px', background: 'var(--bg)' }}
        >
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex-shrink-0 p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <Suspense fallback={null}>
              <DashboardBreadcrumb siteName={siteName} />
            </Suspense>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardShell(props: Props) {
  return (
    <FocusProvider>
      <DashboardShellInner {...props} />
    </FocusProvider>
  )
}
