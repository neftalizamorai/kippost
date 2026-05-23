import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, readingTime, addHeadingIds, extractHeadings } from '@/lib/utils'
import { marked } from 'marked'
import { ReadingProgress } from '@/components/ReadingProgress'
import { TableOfContents } from '@/components/TableOfContents'
import { ShareButton } from '@/components/ShareButton'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { Metadata } from 'next'

interface Props {
  params: { username: string; slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('username', params.username)
    .single()
  if (!profile) return {}

  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt')
    .eq('user_id', profile.id)
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!post) return {}
  return { title: post.title, description: post.excerpt || undefined }
}

export default async function PostPage({ params }: Props) {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, name, bio, avatar_url')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', profile.id)
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const { data: allPosts } = await supabase
    .from('posts')
    .select('id, title, slug')
    .eq('user_id', profile.id)
    .eq('published', true)
    .order('created_at', { ascending: false })

  const idx = allPosts?.findIndex(p => p.id === post.id) ?? -1
  const prevPost = idx > 0 ? allPosts![idx - 1] : null
  const nextPost = idx >= 0 && idx < (allPosts?.length ?? 0) - 1 ? allPosts![idx + 1] : null

  const rawHtml = marked.parse(post.content || '') as string
  const html = addHeadingIds(rawHtml)
  const headings = extractHeadings(html)
  const mins = readingTime(post.content || '')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <ReadingProgress />

      {/* Sticky topbar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Link
          href={`/blog/${params.username}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.65')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
          >
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
            }}
          >
            {profile.name}
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShareButton />
          <ThemeToggle />
        </div>
      </header>

      {/* Layout */}
      <div
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          gap: '5rem',
          alignItems: 'flex-start',
        }}
      >
        {/* Article */}
        <article
          style={{
            flex: 1,
            minWidth: 0,
            maxWidth: '680px',
            padding: '3.5rem 0 6rem',
          }}
        >
          {/* Post meta */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <time
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}
            >
              {formatDate(post.created_at)}
            </time>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}
            >
              {mins} min de lectura
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              fontWeight: 500,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              color: 'var(--text)',
              marginBottom: '1.25rem',
            }}
          >
            {post.title}
          </h1>

          {/* Excerpt / subtitle */}
          {post.excerpt && (
            <p
              style={{
                fontFamily: 'var(--font-crimson)',
                fontSize: '1.1875rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                marginBottom: '1.75rem',
              }}
            >
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.375rem',
                marginBottom: '2rem',
                paddingBottom: '2rem',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {post.tags.map((tag: string) => (
                <span key={tag} className="tag-chip">{tag}</span>
              ))}
            </div>
          )}

          {/* Ornament if no tags */}
          {(!post.tags || post.tags.length === 0) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '0.75rem',
                  color: 'var(--accent)',
                  flexShrink: 0,
                }}
              >
                ◆
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>
          )}

          {/* Content */}
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Author footer */}
          <div
            style={{
              marginTop: '4rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--border)',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--accent-dim)',
                  border: '2px solid var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--accent)',
                }}
              >
                {profile.name?.[0]?.toUpperCase()}
              </div>
            )}

            <div>
              <Link
                href={`/blog/${profile.username}`}
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  color: 'var(--text)',
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
              >
                {profile.name}
              </Link>
              {profile.bio && (
                <p
                  style={{
                    fontFamily: 'var(--font-crimson)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.5,
                    color: 'var(--text-secondary)',
                    marginTop: '0.125rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Prev / Next */}
          {(prevPost || nextPost) && (
            <nav
              style={{
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--border)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
              }}
            >
              <div>
                {nextPost && (
                  <Link
                    href={`/blog/${params.username}/${nextPost.slug}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-syne)',
                        fontSize: '0.6rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--text-tertiary)',
                        display: 'block',
                        marginBottom: '0.375rem',
                      }}
                    >
                      ← Anterior
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontSize: '1.0625rem',
                        fontWeight: 600,
                        color: 'var(--text)',
                        lineHeight: 1.3,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
                    >
                      {nextPost.title}
                    </span>
                  </Link>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                {prevPost && (
                  <Link
                    href={`/blog/${params.username}/${prevPost.slug}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-syne)',
                        fontSize: '0.6rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--text-tertiary)',
                        display: 'block',
                        marginBottom: '0.375rem',
                      }}
                    >
                      Siguiente →
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontSize: '1.0625rem',
                        fontWeight: 600,
                        color: 'var(--text)',
                        lineHeight: 1.3,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
                    >
                      {prevPost.title}
                    </span>
                  </Link>
                )}
              </div>
            </nav>
          )}
        </article>

        {/* TOC sidebar */}
        {headings.length > 0 && (
          <aside
            style={{
              width: '200px',
              flexShrink: 0,
              display: 'none',
              paddingTop: '3.5rem',
            }}
            className="lg:block"
          >
            <div style={{ position: 'sticky', top: '80px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.875rem',
                }}
              >
                En este artículo
              </p>
              <TableOfContents headings={headings} />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
