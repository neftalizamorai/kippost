import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDateShort, readingTime } from '@/lib/utils'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, excerpt, content, published, created_at, slug, tags')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const total = posts?.length ?? 0
  const published = posts?.filter(p => p.published).length ?? 0

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Mis posts</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {total} total · {published} publicados
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md transition-opacity hover:opacity-80"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo post
        </Link>
      </div>

      {/* Posts list */}
      {posts && posts.length > 0 ? (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {posts.map((post) => (
            <div
              key={post.id}
              className="group flex items-start gap-4 py-4 -mx-2 px-2 rounded-md transition-colors hover:bg-[var(--bg-hover)]"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="inline-flex text-xs px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: post.published ? 'rgba(66, 153, 90, 0.12)' : 'rgba(180, 150, 0, 0.10)',
                      color: post.published ? '#3a7a52' : '#916a00',
                    }}
                  >
                    {post.published ? 'Publicado' : 'Borrador'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {formatDateShort(post.created_at)} · {readingTime(post.content)} min
                  </span>
                </div>

                <Link href={`/dashboard/edit/${post.id}`}>
                  <h3 className="font-medium text-sm leading-snug group-hover:underline" style={{ color: 'var(--text)' }}>
                    {post.title}
                  </h3>
                </Link>

                {post.excerpt && (
                  <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {post.excerpt}
                  </p>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.slice(0, 4).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href={`/dashboard/edit/${post.id}`}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-md border transition-colors opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-secondary)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Editar
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-20 rounded-lg border"
          style={{ borderColor: 'var(--border)', borderStyle: 'dashed' }}
        >
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            Aún no has escrito ningún post
          </p>
          <Link href="/dashboard/new" className="text-sm font-medium hover:underline" style={{ color: 'var(--text)' }}>
            Escribe el primero →
          </Link>
        </div>
      )}
    </div>
  )
}
