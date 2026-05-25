'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatDateShort, formatMonth, readingTime } from '@/lib/utils'

interface Post {
  id: string
  title: string
  excerpt: string | null
  content: string
  published: boolean
  created_at: string
  slug: string
  tags: string[] | null
}

interface Props {
  posts: Post[]
  username: string
  name: string
  defaultTab: 'published' | 'draft'
}

function extractCover(html: string): string | null {
  const m = html?.match(/<img[^>]+src="([^"]+)"/)
  return m ? m[1] : null
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center min-w-[64px]">
      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
    </div>
  )
}

function PostRow({ post, username, last }: { post: Post; username: string; last: boolean }) {
  const cover = extractCover(post.content)

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--bg-hover)]"
      style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}
    >
      {/* Thumbnail */}
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/dashboard/edit/${post.id}`}
          className="text-sm font-medium leading-snug hover:underline block truncate"
          style={{ color: 'var(--text)' }}
        >
          {post.title}
        </Link>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {formatDateShort(post.created_at)} · {readingTime(post.content)} min
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            0
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            0
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden lg:flex items-center gap-2 divide-x" style={{ borderColor: 'var(--border)' }}>
        <StatCell value="—" label="Visitas" />
        <div className="pl-2">
          <StatCell value={post.published ? 'Pub.' : 'Draft'} label="Estado" />
        </div>
      </div>

      {/* Actions */}
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

export default function DashboardView({ posts, username, name, defaultTab }: Props) {
  const [tab, setTab] = useState<'published' | 'draft'>(defaultTab)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')

  const published = posts.filter(p => p.published)
  const drafts = posts.filter(p => !p.published)
  const active = tab === 'published' ? published : drafts

  const filtered = useMemo(() => {
    let result = [...active]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt ?? '').toLowerCase().includes(q)
      )
    }
    if (sort === 'oldest') result.reverse()
    return result
  }, [active, search, sort])

  // Group by month
  const byMonth = useMemo(() => {
    const groups: Record<string, Post[]> = {}
    filtered.forEach(p => {
      const key = formatMonth(p.created_at)
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    })
    return groups
  }, [filtered])

  const tabBtn = (t: 'published' | 'draft', label: string, count: number) => (
    <button
      onClick={() => setTab(t)}
      className="px-3 py-1.5 rounded text-sm transition-colors"
      style={{
        background: tab === t ? 'var(--bg)' : 'transparent',
        color: tab === t ? 'var(--text)' : 'var(--text-secondary)',
        fontWeight: tab === t ? 500 : 400,
        boxShadow: tab === t ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      {label} {count > 0 && <span className="ml-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>{count}</span>}
    </button>
  )

  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* Page title */}
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Posts</h1>

      {/* Tabs + Crear */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-0.5 p-1 rounded" style={{ background: 'var(--bg-secondary)' }}>
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

      {/* Search + Sort */}
      <div className="flex items-center gap-2 mb-6">
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
          <option value="newest">Primero los más nuevos</option>
          <option value="oldest">Primero los más antiguos</option>
        </select>
      </div>

      {/* Post list grouped by month */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded border" style={{ borderColor: 'var(--border)', borderStyle: 'dashed' }}>
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            {search ? 'No se encontraron posts.' : tab === 'published' ? 'No tienes posts publicados.' : 'No tienes borradores.'}
          </p>
          {!search && (
            <Link href="/dashboard/new" className="text-sm hover:underline" style={{ color: 'var(--text)' }}>
              Crear el primero →
            </Link>
          )}
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
