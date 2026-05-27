import { createClient } from '@/lib/supabase/server'
import DashboardView from './DashboardView'
import { Suspense } from 'react'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: posts }] = await Promise.all([
    supabase.from('profiles').select('username, name').eq('id', user!.id).single(),
    supabase
      .from('posts')
      .select('id, title, excerpt, content, published, pinned, created_at, slug, tags, cover_image_url')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
  ])

  const postIds = posts?.map(p => p.id) ?? []
  const { data: viewCounts } = postIds.length > 0
    ? await supabase.from('post_views').select('post_id').in('post_id', postIds)
    : { data: [] }

  // Build a map of post_id -> count
  const viewMap: Record<string, number> = {}
  viewCounts?.forEach(v => {
    viewMap[v.post_id] = (viewMap[v.post_id] ?? 0) + 1
  })

  return (
    <Suspense>
      <DashboardView
        posts={posts ?? []}
        username={profile?.username ?? ''}
        name={profile?.name ?? ''}
        viewMap={viewMap}
      />
    </Suspense>
  )
}
