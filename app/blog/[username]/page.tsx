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
        <Link href="/" className="text-sm font-semibold tracking-tight transition-opacity hover:opacity-70" style={{ color: 'var(--text)' }}>
          KipPost
        </Link>
        <ThemeToggle />
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
