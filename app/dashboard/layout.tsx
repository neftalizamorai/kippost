import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/DashboardShell'

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
    <DashboardShell
      profile={profile}
      publishedCount={publishedCount}
      draftCount={draftCount}
      siteName={profile?.name ?? 'KipPost'}
    >
      {children}
    </DashboardShell>
  )
}
