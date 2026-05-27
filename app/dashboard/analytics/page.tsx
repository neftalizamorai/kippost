import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import AnalyticsView from './AnalyticsView'

export const metadata = { title: 'Analítica' }

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, published')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const postIds = posts?.map(p => p.id) ?? []

  // Get views from last 30 days
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const { data: recentViews } = postIds.length > 0
    ? await supabase
        .from('post_views')
        .select('post_id, viewed_at')
        .in('post_id', postIds)
        .gte('viewed_at', since.toISOString())
    : { data: [] }

  // Get all-time totals per post
  const { data: allViews } = postIds.length > 0
    ? await supabase
        .from('post_views')
        .select('post_id')
        .in('post_id', postIds)
    : { data: [] }

  return (
    <Suspense>
      <AnalyticsView
        posts={posts ?? []}
        recentViews={recentViews ?? []}
        allViews={allViews ?? []}
      />
    </Suspense>
  )
}
