'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDate, formatMonth, readingTime } from '@/lib/utils'

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

interface Props {
  profile: Profile
  posts: Post[]
}

type Tab = 'home' | 'archive' | 'about'

const TAB_LABELS: Record<Tab, string> = {
  home: 'Inicio',
  archive: 'Archivo',
  about: 'Sobre mí',
}

export default function BlogView({ profile, posts }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('home')

  const byMonth: Record<string, Post[]> = {}
  posts.forEach((p) => {
    const key = formatMonth(p.created_at)
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(p)
  })

  const recentPosts = posts.slice(0, 10)

  return (
    <div>
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          marginBottom: '2.5rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {(['home', 'archive', 'about'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.625rem 0',
              marginRight: '2rem',
              fontFamily: 'var(--font-syne)',
              fontSize: '0.7rem',
              fontWeight: activeTab === tab ? 700 : 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: activeTab === tab ? 'var(--text)' : 'var(--text-tertiary)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: '-1px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* HOME */}
      {activeTab === 'home' && (
        <div>
          {recentPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.25rem',
                  fontStyle: 'italic',
                  color: 'var(--text-tertiary)',
                }}
              >
                Aún no hay posts publicados.
              </p>
            </div>
          ) : (
            <div>
              {recentPosts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  username={profile.username}
                  isLast={i === recentPosts.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ARCHIVE */}
      {activeTab === 'archive' && (
        <div>
          {Object.keys(byMonth).length === 0 ? (
            <p
              style={{
                fontFamily: 'var(--font-crimson)',
                fontSize: '1rem',
                fontStyle: 'italic',
                color: 'var(--text-tertiary)',
              }}
            >
              Sin posts aún.
            </p>
          ) : (
            Object.entries(byMonth).map(([month, monthPosts]) => (
              <div key={month} style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    marginBottom: '1rem',
                  }}
                >
                  {month}
                </h3>
                <div>
                  {monthPosts.map((post, i) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      username={profile.username}
                      isLast={i === monthPosts.length - 1}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ABOUT */}
      {activeTab === 'about' && (
        <div style={{ maxWidth: '480px' }}>
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border)',
                marginBottom: '1.5rem',
              }}
            />
          )}

          <h2
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '2rem',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'var(--text)',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            {profile.name}
          </h2>

          {profile.bio ? (
            <p
              style={{
                fontFamily: 'var(--font-crimson)',
                fontSize: '1.125rem',
                lineHeight: 1.8,
                color: 'var(--text-secondary)',
              }}
            >
              {profile.bio}
            </p>
          ) : (
            <p
              style={{
                fontFamily: 'var(--font-crimson)',
                fontSize: '1.0625rem',
                fontStyle: 'italic',
                color: 'var(--text-tertiary)',
              }}
            >
              Este escritor aún no ha agregado una bio.
            </p>
          )}

          <p
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              color: 'var(--text-tertiary)',
              marginTop: '1.5rem',
            }}
          >
            {posts.length} {posts.length === 1 ? 'post publicado' : 'posts publicados'}
          </p>
        </div>
      )}
    </div>
  )
}

function PostCard({
  post,
  username,
  isLast,
}: {
  post: Post
  username: string
  isLast: boolean
}) {
  return (
    <Link
      href={`/blog/${username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          paddingTop: '1.75rem',
          paddingBottom: '1.75rem',
          borderBottom: isLast ? 'none' : '1px solid var(--border-light)',
          cursor: 'pointer',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        {/* Date + reading time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            marginBottom: '0.625rem',
          }}
        >
          <time
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '0.65rem',
              letterSpacing: '0.06em',
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
              letterSpacing: '0.06em',
              color: 'var(--text-tertiary)',
            }}
          >
            {readingTime(post.content)} min
          </span>
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--text)',
            lineHeight: 1.25,
            marginBottom: post.excerpt ? '0.5rem' : 0,
          }}
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p
            style={{
              fontFamily: 'var(--font-crimson)',
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.875rem' }}>
            {post.tags.slice(0, 4).map((tag: string) => (
              <span key={tag} className="tag-chip">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
