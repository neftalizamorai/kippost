'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { formatDateShort, formatMonth, readingTime } from '@/lib/utils'

interface Post {
  id: string
  title: string
  excerpt: string | null
  content: string
  published: boolean
  pinned: boolean
  created_at: string
  slug: string
  tags: string[] | null
  cover_image_url: string | null
}

interface Props {
  posts: Post[]
  username: string
  name: string
  defaultTab: 'published' | 'draft'
}

type Tab = 'all' | 'published' | 'draft'
type ViewMode = 'list' | 'grid'

function extractCover(html: string): string | null {
  const m = html?.match(/<img[^>]+src="([^"]+)"/)
  return m ? m[1] : null
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
      style={{
        background: published ? 'rgba(52,168,83,0.10)' : 'rgba(251,188,4,0.12)',
        color: published ? '#2d7a4f' : '#8a6500',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: published ? '#34a853' : '#fbbc04' }}
      />
      {published ? 'Publicado' : 'Borrador'}
    </span>
  )
}

function PostCard({ post, username }: { post: Post; username: string }) {
  return (
    <div
      className="rounded border flex flex-col overflow-hidden transition-colors hover:bg-[var(--bg-hover)]"
      style={{ borderColor: 'var(--border)' }}
    >
      {post.cover_image_url && (
        <div className="h-32 overflow-hidden flex-shrink-0">
          <img src={post.cover_image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <Link
          href={`/dashboard/edit/${post.id}`}
          className="text-sm font-semibold leading-snug hover:underline line-clamp-2"
          style={{ color: 'var(--text)' }}
        >
          {post.title}
        </Link>

        <div className="flex flex-wrap items-center gap-1">
          <StatusBadge published={post.published} />
          {post.pinned && (
            <span
              className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}
              title="Anclado en navegación"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
              </svg>
              Nav
            </span>
          )}
          {post.tags?.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {post.excerpt && (
          <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
            {post.excerpt}
          </p>
        )}
      </div>

      <div
        className="px-4 py-2.5 flex items-center justify-between flex-shrink-0"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {formatDateShort(post.created_at)}
        </span>
        <div className="flex items-center gap-1">
          {post.published && (
            <a
              href={`/blog/${username}/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--bg-secondary)]"
              style={{ color: 'var(--text-tertiary)' }}
              onClick={e => e.stopPropagation()}
              title="Ver post"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          )}
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {readingTime(post.content)} min
          </span>
        </div>
      </div>
    </div>
  )
}

function PostRow({ post, username, last }: { post: Post; username: string; last: boolean }) {
  const cover = post.cover_image_url ?? extractCover(post.content)

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--bg-hover)]"
      style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}
    >
      <div className="flex-shrink-0 w-16 h-12 rounded overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {cover ? (
          <img src={cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <Link
            href={`/dashboard/edit/${post.id}`}
            className="text-sm font-medium leading-snug hover:underline truncate"
            style={{ color: 'var(--text)' }}
          >
            {post.title}
          </Link>
          <StatusBadge published={post.published} />
          {post.pinned && (
            <span title="Anclado en navegación">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" style={{ color: 'var(--text-tertiary)' }}>
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
              </svg>
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {formatDateShort(post.created_at)} · {readingTime(post.content)} min
        </p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
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

      <div className="flex items-center gap-0.5 flex-shrink-0">
        {post.published && (
          <a
            href={`/blog/${username}/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-tertiary)' }}
            title="Ver post"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        )}
        <Link
          href={`/dashboard/edit/${post.id}`}
          className="w-8 h-8 flex items-center justify-center rounded transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-tertiary)' }}
          title="Editar"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default function DashboardView({ posts, username, name }: Omit<Props, 'defaultTab'>) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rawTab = searchParams.get('tab')
  const tab: Tab = rawTab === 'draft' ? 'draft' : rawTab === 'published' ? 'published' : 'all'

  const setTab = (t: Tab) => {
    const p = new URLSearchParams()
    if (t !== 'all') p.set('tab', t)
    router.push(`/dashboard${p.toString() ? `?${p.toString()}` : ''}`, { scroll: false })
  }

  const [view, setView] = useState<ViewMode>('list')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  const published = posts.filter(p => p.published)
  const drafts = posts.filter(p => !p.published)
  const tabPosts = tab === 'all' ? posts : tab === 'published' ? published : drafts

  const allTags = useMemo(() => {
    const set = new Set<string>()
    posts.forEach(p => p.tags?.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [posts])

  const filtered = useMemo(() => {
    let result = [...tabPosts]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt ?? '').toLowerCase().includes(q)
      )
    }
    if (tagFilter) {
      result = result.filter(p => p.tags?.includes(tagFilter))
    }
    if (sort === 'oldest') result.reverse()
    return result
  }, [tabPosts, search, sort, tagFilter])

  const byMonth = useMemo(() => {
    const groups: Record<string, Post[]> = {}
    filtered.forEach(p => {
      const key = formatMonth(p.created_at)
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    })
    return groups
  }, [filtered])

  const tabBtn = (t: Tab, label: string, count: number) => (
    <button
      key={t}
      onClick={() => setTab(t)}
      className="px-3 py-1.5 rounded text-sm transition-colors"
      style={{
        background: tab === t ? 'var(--bg)' : 'transparent',
        color: tab === t ? 'var(--text)' : 'var(--text-secondary)',
        fontWeight: tab === t ? 500 : 400,
        boxShadow: tab === t ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      {label}
      {count > 0 && (
        <span className="ml-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>{count}</span>
      )}
    </button>
  )

  const viewBtn = (v: ViewMode, icon: React.ReactNode, title: string) => (
    <button
      onClick={() => setView(v)}
      className="w-8 h-8 flex items-center justify-center transition-colors"
      style={{
        color: view === v ? 'var(--text)' : 'var(--text-tertiary)',
        background: view === v ? 'var(--bg-secondary)' : 'transparent',
      }}
      title={title}
    >
      {icon}
    </button>
  )

  return (
    <div className="px-8 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Posts</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Organiza, planea y publica tu contenido.
      </p>

      {/* Tabs + view toggle + Crear */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-0.5 p-1 rounded" style={{ background: 'var(--bg-secondary)' }}>
          {tabBtn('all', 'Todos', posts.length)}
          {tabBtn('published', 'Publicado', published.length)}
          <button
            disabled
            className="px-3 py-1.5 rounded text-sm cursor-not-allowed"
            style={{ color: 'var(--text-tertiary)' }}
            title="Próximamente"
          >
            Programado
          </button>
          {tabBtn('draft', 'Borradores', drafts.length)}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {viewBtn('list',
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>,
              'Vista lista'
            )}
            {viewBtn('grid',
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>,
              'Vista cuadrícula'
            )}
          </div>

          <Link
            href="/dashboard/new"
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded hover:opacity-90 transition-opacity"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Crear
          </Link>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded border"
          style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar posts..."
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: 'var(--text)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--text-tertiary)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value as 'newest' | 'oldest')}
          className="text-sm px-3 py-2 rounded border outline-none cursor-pointer"
          style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--bg)' }}
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
        </select>
      </div>

      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              className="text-xs px-2.5 py-1 rounded-full border transition-colors"
              style={{
                borderColor: tagFilter === tag ? 'var(--text)' : 'var(--border)',
                background: tagFilter === tag ? 'var(--text)' : 'transparent',
                color: tagFilter === tag ? 'var(--bg)' : 'var(--text-secondary)',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded border" style={{ borderColor: 'var(--border)', borderStyle: 'dashed' }}>
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            {search || tagFilter
              ? 'No se encontraron posts.'
              : tab === 'published'
              ? 'No tienes posts publicados.'
              : tab === 'draft'
              ? 'No tienes borradores.'
              : 'Aún no has escrito ningún post.'}
          </p>
          {!search && !tagFilter && (
            <Link href="/dashboard/new" className="text-sm hover:underline" style={{ color: 'var(--text)' }}>
              Crear el primero →
            </Link>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} username={username} />
          ))}
        </div>
      ) : (
        Object.entries(byMonth).map(([month, monthPosts]) => (
          <div key={month} className="mb-8">
            <p
              className="text-xs font-medium uppercase tracking-widest mb-3 px-1"
              style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}
            >
              {month}
            </p>
            <div className="rounded border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              {monthPosts.map((post, i) => (
                <PostRow
                  key={post.id}
                  post={post}
                  username={username}
                  last={i === monthPosts.length - 1}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
