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

  // Get prev/next
  const { data: allPosts } = await supabase
    .from('posts')
    .select('id, title, slug')
    .eq('user_id', profile.id)
    .eq('published', true)
    .order('created_at', { ascending: false })

  const idx = allPosts?.findIndex(p => p.id === post.id) ?? -1
  const prevPost = idx > 0 ? allPosts![idx - 1] : null
  const nextPost = idx >= 0 && idx < (allPosts?.length ?? 0) - 1 ? allPosts![idx + 1] : null

  // Render markdown → HTML with heading IDs
  const rawHtml = marked.parse(post.content || '') as string
  const html = addHeadingIds(rawHtml)
  const headings = extractHeadings(html)
  const mins = readingTime(post.content || '')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Reading progress */}
      <ReadingProgress />

      {/* Topbar */}
      <header
        className="flex items-center justify-between px-8 py-3 sticky top-0 z-40"
        style={{
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Link
          href={`/blog/${params.username}`}
          className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span className="hidden sm:inline">{profile.name}</span>
        </Link>

        <div className="flex items-center gap-2">
          <ShareButton />
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex gap-16">
          {/* Article */}
          <article className="flex-1 min-w-0 max-w-2xl">
            {/* Meta */}
            <div className="flex items-center gap-2 mb-5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <time>{formatDate(post.created_at)}</time>
              <span>·</span>
              <span>{mins} min de lectura</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold leading-tight mb-4" style={{ color: 'var(--text)' }}>
              {post.title}
            </h1>

            {/* Excerpt as subtitle */}
            {post.excerpt && (
              <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                {post.excerpt}
              </p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-8 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-base"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* Author footer */}
            <div
              className="mt-16 pt-8 flex items-center gap-4"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ border: '1px solid var(--border)' }}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  {profile.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <Link
                  href={`/blog/${profile.username}`}
                  className="text-sm font-medium hover:underline"
                  style={{ color: 'var(--text)' }}
                >
                  {profile.name}
                </Link>
                {profile.bio && (
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Prev / Next */}
            {(prevPost || nextPost) && (
              <nav
                className="mt-8 pt-8 grid grid-cols-2 gap-4"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <div>
                  {nextPost && (
                    <Link href={`/blog/${params.username}/${nextPost.slug}`} className="group block">
                      <span className="text-xs block mb-1" style={{ color: 'var(--text-tertiary)' }}>← Anterior</span>
                      <span className="text-sm font-medium group-hover:underline" style={{ color: 'var(--text)' }}>
                        {nextPost.title}
                      </span>
                    </Link>
                  )}
                </div>
                <div className="text-right">
                  {prevPost && (
                    <Link href={`/blog/${params.username}/${prevPost.slug}`} className="group block">
                      <span className="text-xs block mb-1" style={{ color: 'var(--text-tertiary)' }}>Siguiente →</span>
                      <span className="text-sm font-medium group-hover:underline" style={{ color: 'var(--text)' }}>
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
            <aside className="hidden lg:block w-52 flex-shrink-0">
              <div className="sticky top-24">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
