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

  return (
    <Suspense>
      <DashboardView
        posts={posts ?? []}
        username={profile?.username ?? ''}
        name={profile?.name ?? ''}
      />
    </Suspense>
  )
}
