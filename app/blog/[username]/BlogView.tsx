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

export interface MinimalConfig {
  tabHome?: string
  tabArchive?: string
  tabAbout?: string
}

interface Props {
  profile: Profile
  posts: Post[]
  config?: MinimalConfig
}

type Tab = 'home' | 'archive' | 'about'

export default function BlogView({ profile, posts, config = {} }: Props) {
  const tabHome = config.tabHome ?? 'Inicio'
  const tabArchive = config.tabArchive ?? 'Archivo'
  const tabAbout = config.tabAbout ?? 'Sobre mí'
  const [activeTab, setActiveTab] = useState<Tab>('home')

  // Group posts by month for archive
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
      <div className="flex items-center gap-0" style={{ borderBottom: '1px solid var(--border)' }}>
        {(['home', 'archive', 'about'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-3 text-sm transition-colors relative"
            style={{
              color: activeTab === tab ? 'var(--text)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? 500 : 400,
              borderBottom: activeTab === tab ? '2px solid var(--text)' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab === 'home' ? tabHome : tab === 'archive' ? tabArchive : tabAbout}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-8">
        {/* HOME */}
        {activeTab === 'home' && (
          <div>
            {recentPosts.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Aún no hay posts publicados.
              </p>
            ) : (
              <div>
                {recentPosts.map((post, i) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    username={profile.username}
                    last={i === recentPosts.length - 1}
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
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sin posts aún.</p>
            ) : (
              Object.entries(byMonth).map(([month, monthPosts]) => (
                <div key={month} className="mb-8">
                  <h3
                    className="text-xs font-medium uppercase tracking-wider mb-3"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {month}
                  </h3>
                  <div>
                    {monthPosts.map((post, i) => (
                      <PostRow
                        key={post.id}
                        post={post}
                        username={profile.username}
                        last={i === monthPosts.length - 1}
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
          <div className="max-w-lg">
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover mb-5"
                style={{ border: '1px solid var(--border)' }}
              />
            )}
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>
              {profile.name}
            </h2>
            {profile.bio ? (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm italic" style={{ color: 'var(--text-tertiary)' }}>
                Este escritor aún no ha agregado una bio.
              </p>
            )}
            <p className="text-sm mt-5" style={{ color: 'var(--text-tertiary)' }}>
              {posts.length} {posts.length === 1 ? 'post publicado' : 'posts publicados'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function PostRow({ post, username, last }: { post: Post; username: string; last: boolean }) {
  return (
    <Link href={`/blog/${username}/${post.slug}`}>
      <div
        className="group py-5 -mx-2 px-2 rounded transition-colors hover:bg-[var(--bg-hover)] cursor-pointer"
        style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {formatDate(post.created_at)}
          </span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {readingTime(post.content)} min de lectura
          </span>
        </div>

        <h2
          className="text-base font-semibold leading-snug group-hover:underline"
          style={{ color: 'var(--text)' }}
        >
          {post.title}
        </h2>

        {post.excerpt && (
          <p
            className="mt-1 text-sm leading-relaxed line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {post.excerpt}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
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
    </Link>
  )
}
