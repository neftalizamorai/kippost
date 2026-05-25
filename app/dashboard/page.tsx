import { createClient } from '@/lib/supabase/server'
import DashboardView from './DashboardView'

export const metadata = { title: 'Dashboard' }

interface Props {
  searchParams: { tab?: string }
}

export default async function DashboardPage({ searchParams }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: posts }] = await Promise.all([
    supabase.from('profiles').select('username, name').eq('id', user!.id).single(),
    supabase
      .from('posts')
      .select('id, title, excerpt, content, published, pinned, created_at, slug, tags')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
  ])

  const defaultTab = searchParams.tab === 'draft' ? 'draft' : 'published'

  return (
    <DashboardView
      posts={posts ?? []}
      username={profile?.username ?? ''}
      name={profile?.name ?? ''}
      defaultTab={defaultTab}
    />
  )
}
