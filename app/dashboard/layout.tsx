import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import LogoutButton from './LogoutButton'
import SidebarNavLinks from '@/components/SidebarNavLinks'
import { Suspense } from 'react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: posts }] = await Promise.all([
    supabase.from('profiles').select('username, name, avatar_url').eq('id', user.id).single(),
    supabase.from('posts').select('published').eq('user_id', user.id),
  ])

  const publishedCount = posts?.filter(p => p.published).length ?? 0
  const draftCount = posts?.filter(p => !p.published).length ?? 0

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto"
        style={{ borderRight: '1px solid var(--border)', background: 'var(--bg)' }}
      >
        {/* User section */}
        <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded transition-colors hover:bg-[var(--bg-hover)] cursor-default">
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
        </div>

        {/* Nav */}
        <div className="flex-1 p-3">
          <Suspense>
            <SidebarNavLinks
              username={profile?.username ?? ''}
              publishedCount={publishedCount}
              draftCount={draftCount}
            />
          </Suspense>
        </div>

        {/* Bottom */}
        <div
          className="p-4 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <ThemeToggle />
          <LogoutButton />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-end gap-1 px-6 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', height: '48px', background: 'var(--bg)' }}
        >
          <ThemeToggle />
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-7 h-7 rounded-full object-cover ml-1"
              style={{ border: '1px solid var(--border)' }}
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ml-1"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              {profile?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
