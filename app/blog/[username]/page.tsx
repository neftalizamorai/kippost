import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import BlogView from './BlogView'
import type { Metadata } from 'next'

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
  }
}

export default async function BlogPage({ params }: Props) {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, name, bio, avatar_url')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, excerpt, content, tags, created_at, slug')
    .eq('user_id', profile.id)
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Topbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 2rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(12px)',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          KipPost
        </Link>
        <ThemeToggle />
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        {/* Blog header */}
        <header style={{ marginBottom: '3.5rem' }}>
          {/* Avatar */}
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border)',
                marginBottom: '1.25rem',
              }}
            />
          ) : (
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--accent-dim)',
                border: '2px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'var(--accent)',
              }}
            >
              {profile.name?.[0]?.toUpperCase() || profile.username[0].toUpperCase()}
            </div>
          )}

          {/* Name */}
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              lineHeight: 1.1,
              marginBottom: '0.375rem',
            }}
          >
            {profile.name}
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              color: 'var(--accent)',
              marginBottom: profile.bio ? '0.875rem' : 0,
            }}
          >
            @{profile.username}
          </p>

          {profile.bio && (
            <p
              style={{
                fontFamily: 'var(--font-crimson)',
                fontSize: '1.0625rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                maxWidth: '440px',
              }}
            >
              {profile.bio}
            </p>
          )}

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '2rem',
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
        </header>

        {/* Posts */}
        <BlogView profile={profile} posts={posts ?? []} />
      </div>
    </div>
  )
}
