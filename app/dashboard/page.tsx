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
  const drafts = total - published

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2.5rem 2.5rem' }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '2.5rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '2rem',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              lineHeight: 1.1,
            }}
          >
            Mis escritos
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '0.5rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '0.7rem',
                color: 'var(--text-tertiary)',
                letterSpacing: '0.04em',
              }}
            >
              {total} total
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '0.7rem',
                color: 'var(--success)',
                letterSpacing: '0.04em',
              }}
            >
              {published} publicados
            </span>
            {drafts > 0 && (
              <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontSize: '0.7rem',
                    color: 'var(--text-tertiary)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {drafts} borradores
                </span>
              </>
            )}
          </div>
        </div>

        <Link href="/dashboard/new" className="btn-primary">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo post
        </Link>
      </div>

      {/* Post list */}
      {posts && posts.length > 0 ? (
        <div>
          {posts.map((post, i) => (
            <PostRow
              key={post.id}
              post={post}
              isLast={i === posts.length - 1}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function PostRow({
  post,
  isLast,
}: {
  post: {
    id: string
    title: string
    excerpt: string
    content: string
    published: boolean
    created_at: string
    slug: string
    tags: string[]
  }
  isLast: boolean
}) {
  return (
    <div
      style={{
        paddingTop: '1.375rem',
        paddingBottom: '1.375rem',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1.25rem',
      }}
    >
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Meta row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            marginBottom: '0.5rem',
          }}
        >
          <span className={post.published ? 'badge-published' : 'badge-draft'}>
            {post.published ? '● Publicado' : '○ Borrador'}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '0.65rem',
              color: 'var(--text-tertiary)',
              letterSpacing: '0.04em',
            }}
          >
            {formatDateShort(post.created_at)}
          </span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '0.65rem',
              color: 'var(--text-tertiary)',
              letterSpacing: '0.04em',
            }}
          >
            {readingTime(post.content)} min
          </span>
        </div>

        {/* Title */}
        <Link href={`/dashboard/edit/${post.id}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.25rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: 'var(--text)',
              lineHeight: 1.3,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
          >
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p
            style={{
              fontFamily: 'var(--font-crimson)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginTop: '0.25rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.625rem' }}>
            {post.tags.slice(0, 5).map((tag: string) => (
              <span key={tag} className="tag-chip">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Edit link */}
      <Link
        href={`/dashboard/edit/${post.id}`}
        className="btn-ghost"
        style={{ flexShrink: 0, alignSelf: 'flex-start' }}
      >
        Editar
      </Link>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '5rem 2rem',
      }}
    >
      {/* Ornamental initial */}
      <div
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '5rem',
          fontWeight: 300,
          color: 'var(--border)',
          lineHeight: 1,
          marginBottom: '1.5rem',
          fontStyle: 'italic',
        }}
      >
        ❦
      </div>
      <p
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '1.375rem',
          fontWeight: 400,
          fontStyle: 'italic',
          color: 'var(--text-secondary)',
          marginBottom: '0.625rem',
        }}
      >
        Aún no has escrito nada
      </p>
      <p
        style={{
          fontFamily: 'var(--font-syne)',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
          marginBottom: '2rem',
          letterSpacing: '0.02em',
        }}
      >
        Tu primera historia te está esperando
      </p>
      <Link href="/dashboard/new" className="btn-primary">
        Escribe el primer post
      </Link>
    </div>
  )
}
