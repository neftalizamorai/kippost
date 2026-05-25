import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import BlogView from './BlogView'
import type { Metadata } from 'next'

type SocialLinks = Record<string, string>

function socialUrl(key: string, value: string): string {
  if (!value) return ''
  if (value.startsWith('http')) return value
  const prefixes: Record<string, string> = {
    twitter: 'https://twitter.com/',
    instagram: 'https://instagram.com/',
    linkedin: 'https://linkedin.com/in/',
    github: 'https://github.com/',
    tiktok: 'https://tiktok.com/@',
    youtube: 'https://youtube.com/@',
  }
  return (prefixes[key] ?? '') + value
}

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  website: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  twitter: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  instagram: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  ),
  linkedin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  github: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  ),
  youtube: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  tiktok: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
    </svg>
  ),
}

function SocialLinks({ links }: { links: SocialLinks }) {
  const entries = Object.entries(links).filter(([, v]) => v?.trim())
  if (entries.length === 0) return null
  return (
    <div className="flex items-center gap-1 mt-3 flex-wrap">
      {entries.map(([key, value]) => {
        const href = socialUrl(key, value)
        if (!href) return null
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={key.charAt(0).toUpperCase() + key.slice(1)}
            className="w-8 h-8 flex items-center justify-center rounded transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            {SOCIAL_ICONS[key] ?? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            )}
          </a>
        )
      })}
    </div>
  )
}

interface Props {
  params: { username: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, bio')
    .eq('username', params.username)
    .single()

  if (!profile) return { title: 'Blog no encontrado' }

  return {
    title: profile.name,
    description: profile.bio ?? `Blog de ${profile.name}`,
    alternates: {
      types: {
        'application/rss+xml': `/blog/${params.username}/rss`,
      },
    },
  }
}

export default async function BlogPage({ params }: Props) {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, name, bio, avatar_url, social_links')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  const [{ data: posts }, { data: pinnedPosts }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, excerpt, content, tags, created_at, slug')
      .eq('user_id', profile.id)
      .eq('published', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('posts')
      .select('title, slug')
      .eq('user_id', profile.id)
      .eq('published', true)
      .eq('pinned', true)
      .order('created_at', { ascending: true }),
  ])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Topbar */}
      <div
        className="flex items-center justify-between px-8 py-3 sticky top-0 z-40"
        style={{
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold tracking-tight transition-opacity hover:opacity-70" style={{ color: 'var(--text)' }}>
            KipPost
          </Link>
          {pinnedPosts && pinnedPosts.length > 0 && (
            <>
              <span style={{ color: 'var(--border)' }}>|</span>
              <nav className="flex items-center gap-3">
                {pinnedPosts.map(p => (
                  <Link
                    key={p.slug}
                    href={`/blog/${params.username}/${p.slug}`}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {p.title}
                  </Link>
                ))}
              </nav>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <a
            href={`/blog/${params.username}/rss`}
            target="_blank"
            rel="noopener noreferrer"
            title="Feed RSS"
            className="w-8 h-8 flex items-center justify-center rounded transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1" fill="currentColor"/>
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Blog Header */}
        <header className="mb-10">
          <div className="flex items-start gap-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                style={{ border: '1px solid var(--border)' }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-semibold"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              >
                {profile.name?.[0]?.toUpperCase() || profile.username[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
                {profile.name}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                @{profile.username}
              </p>
              {profile.bio && (
                <p className="text-sm mt-2 leading-relaxed max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                  {profile.bio}
                </p>
              )}
              <SocialLinks links={profile.social_links ?? {}} />
            </div>
          </div>
        </header>

        {/* Tabs + content */}
        <BlogView
          profile={profile}
          posts={posts ?? []}
        />
      </div>
    </div>
  )
}
