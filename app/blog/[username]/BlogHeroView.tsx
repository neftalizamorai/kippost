import Link from 'next/link'
import { formatDate, readingTime } from '@/lib/utils'

interface Post {
  id: string
  title: string
  excerpt: string
  content: string
  tags: string[]
  created_at: string
  slug: string
}

interface Profile {
  username: string
  name: string
  bio: string | null
  avatar_url: string | null
}

export interface HeroConfig {
  greeting?: string
  articlesTitle?: string
}

interface Props {
  profile: Profile
  posts: Post[]
  config?: HeroConfig
}

export default function BlogHeroView({ profile, posts, config = {} }: Props) {
  const greeting = config.greeting ?? "Hey, I'm"
  const articlesTitle = config.articlesTitle ?? 'My Latest Articles'
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      {/* Avatar with ring */}
      <div className="mb-10">
        {profile.avatar_url ? (
          <div
            className="w-24 h-24 rounded-full p-0.5 inline-block"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #f0d080, #c9a84c)' }}
          >
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-full h-full rounded-full object-cover"
              style={{ border: '3px solid var(--bg)' }}
            />
          </div>
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '3px solid var(--border)' }}
          >
            {profile.name?.[0]?.toUpperCase() || profile.username[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* Greeting */}
      <h1 className="text-4xl font-bold leading-tight mb-8" style={{ color: 'var(--text)' }}>
        {greeting} {profile.name || profile.username}
      </h1>

      {/* Bio blockquote */}
      {profile.bio && (
        <blockquote
          className="mb-12 pl-5 italic text-base leading-relaxed"
          style={{
            borderLeft: '3px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          {profile.bio}
        </blockquote>
      )}

      {/* Articles */}
      <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>
        {articlesTitle}
      </h2>

      {posts.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Aún no hay posts publicados.
        </p>
      ) : (
        <div>
          {posts.map((post, i) => (
            <Link key={post.id} href={`/@${profile.username}/${post.slug}`}>
              <div
                className="group py-5 transition-colors hover:bg-[var(--bg-hover)] -mx-3 px-3 rounded"
                style={{ borderBottom: i === posts.length - 1 ? 'none' : '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {formatDate(post.created_at)}
                  </span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {readingTime(post.content)} min
                  </span>
                </div>
                <h3
                  className="text-base font-semibold leading-snug group-hover:underline"
                  style={{ color: 'var(--text)' }}
                >
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-1 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {post.excerpt}
                  </p>
                )}
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {post.tags.slice(0, 4).map(tag => (
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
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
