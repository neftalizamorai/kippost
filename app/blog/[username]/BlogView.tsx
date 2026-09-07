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
  cover_image_url: string | null
  pinned: boolean
  post_sections?: string[]
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
  sections?: string  // comma-separated ids: "home,archive,about"
}

interface BlogSectionDef {
  id: string
  name: string
}

interface Props {
  profile: Profile
  posts: Post[]
  config?: MinimalConfig
  blogSections?: BlogSectionDef[]
}

type BuiltinTab = 'home' | 'archive' | 'about'
type TabId = BuiltinTab | string  // custom section id

function safeExcerpt(raw: string | null | undefined): string {
  if (!raw) return ''
  const t = raw.trim()
  if (t.startsWith('[') || t.startsWith('{')) return ''
  return t
}

export default function BlogView({ profile, posts, config = {}, blogSections = [] }: Props) {
  const tabHome = config.tabHome || 'Inicio'
  const tabArchive = config.tabArchive || 'Archivo'
  const tabAbout = config.tabAbout || 'Sobre mí'

  const enabledBuiltin: BuiltinTab[] = config.sections
    ? (config.sections.split(',').filter(s => ['home', 'archive', 'about'].includes(s)) as BuiltinTab[])
    : ['home', 'archive', 'about']

  // All tabs: built-in first, then custom sections
  const allTabs: { id: TabId; label: string }[] = [
    ...enabledBuiltin.map(id => ({
      id,
      label: id === 'home' ? tabHome : id === 'archive' ? tabArchive : tabAbout,
    })),
    ...blogSections.map(s => ({ id: s.id, label: s.name })),
  ]

  const [activeTab, setActiveTab] = useState<TabId>(allTabs[0]?.id ?? 'home')

  const featuredPosts = posts.filter(p => p.pinned)
  // Inicio: published, not unlisted (the post type has no unlisted field server-side — we filter by pinned only here)
  const regularPosts = posts.filter(p => !p.pinned)

  const byMonth: Record<string, Post[]> = {}
  regularPosts.forEach((p) => {
    const key = formatMonth(p.created_at)
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(p)
  })

  const showTabs = allTabs.length > 1

  return (
    <div>
      {/* Destacados — always visible if there are pinned posts */}
      {featuredPosts.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-tertiary)' }}>
            Destacados
          </p>
          <div className="space-y-3">
            {featuredPosts.map(post => (
              <FeaturedCard key={post.id} post={post} username={profile.username} />
            ))}
          </div>
          <div className="mt-8" style={{ borderBottom: '1px solid var(--border)' }} />
        </div>
      )}

      {/* Tabs */}
      {showTabs && (
        <div className="flex items-center gap-0 flex-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
          {allTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-3 text-sm transition-colors relative"
              style={{
                color: activeTab === tab.id ? 'var(--text)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 500 : 400,
                borderBottom: activeTab === tab.id ? '2px solid var(--text)' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab content */}
      <div className={showTabs ? 'mt-8' : ''}>
        {/* HOME */}
        {activeTab === 'home' && (
          <div>
            {regularPosts.length === 0 && featuredPosts.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Aún no hay posts publicados.
              </p>
            ) : regularPosts.length === 0 ? null : (
              <div>
                {regularPosts.slice(0, 10).map((post, i) => (
                  <PostRow key={post.id} post={post} username={profile.username} last={i === Math.min(regularPosts.length, 10) - 1} />
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
                  <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                    {month}
                  </h3>
                  <div>
                    {monthPosts.map((post, i) => (
                      <PostRow key={post.id} post={post} username={profile.username} last={i === monthPosts.length - 1} />
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
              <img src={profile.avatar_url} alt={profile.name} className="w-20 h-20 rounded-full object-cover mb-5" style={{ border: '1px solid var(--border)' }} />
            )}
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>{profile.name}</h2>
            {profile.bio ? (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{profile.bio}</p>
            ) : (
              <p className="text-sm italic" style={{ color: 'var(--text-tertiary)' }}>Este escritor aún no ha agregado una bio.</p>
            )}
            <p className="text-sm mt-5" style={{ color: 'var(--text-tertiary)' }}>
              {posts.length} {posts.length === 1 ? 'post publicado' : 'posts publicados'}
            </p>
          </div>
        )}

        {/* Custom sections */}
        {blogSections.map(section => {
          if (activeTab !== section.id) return null
          const sectionPosts = posts.filter(p => Array.isArray(p.post_sections) && p.post_sections.includes(section.id))
          return (
            <div key={section.id}>
              {sectionPosts.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No hay posts en esta sección aún.
                </p>
              ) : (
                <div>
                  {sectionPosts.map((post, i) => (
                    <PostRow key={post.id} post={post} username={profile.username} last={i === sectionPosts.length - 1} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FeaturedCard({ post, username }: { post: Post; username: string }) {
  const excerpt = safeExcerpt(post.excerpt)
  return (
    <Link href={`/@${username}/${post.slug}`}>
      <div
        className="flex items-start gap-4 rounded-lg p-4 -mx-4 transition-colors hover:bg-[var(--bg-hover)] cursor-pointer"
      >
        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-24 h-16 object-cover rounded flex-shrink-0"
            style={{ border: '1px solid var(--border)' }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold leading-snug" style={{ color: 'var(--text)' }}>
            {post.title}
          </h3>
          {excerpt && (
            <p className="mt-1 text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {excerpt}
            </p>
          )}
          <p className="mt-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {formatDate(post.created_at)}
          </p>
        </div>
      </div>
    </Link>
  )
}

function PostRow({ post, username, last }: { post: Post; username: string; last: boolean }) {
  const excerpt = safeExcerpt(post.excerpt)
  return (
    <Link href={`/@${username}/${post.slug}`}>
      <div
        className="group py-5 -mx-2 px-2 rounded transition-colors hover:bg-[var(--bg-hover)] cursor-pointer"
        style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
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

            {excerpt && (
              <p
                className="mt-1 text-sm leading-relaxed line-clamp-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {excerpt}
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

          {post.cover_image_url && (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-20 h-14 object-cover rounded flex-shrink-0"
              style={{ border: '1px solid var(--border)' }}
            />
          )}
        </div>
      </div>
    </Link>
  )
}
