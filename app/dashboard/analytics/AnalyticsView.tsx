'use client'

import { useMemo, useState } from 'react'

interface Post { id: string; title: string; slug: string; published: boolean }
interface ViewRecord { post_id: string; viewed_at?: string }
interface RecentViewRecord { post_id: string; viewed_at: string }

interface Props {
  posts: Post[]
  recentViews: RecentViewRecord[]
  allViews: ViewRecord[]
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded border px-5 py-4 flex flex-col gap-1"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
    >
      <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
        {value}
      </span>
    </div>
  )
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

export default function AnalyticsView({ posts, recentViews, allViews }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; count: number } | null>(null)

  const { dayMap, postTotals, sortedPosts, totalAllTime, totalLast30, topPost } = useMemo(() => {
    // Build day map for last 30 days (today is day 29, 29 days ago is day 0)
    const days: { dateStr: string; label: string; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      days.push({ dateStr, label, count: 0 })
    }

    // Count views per day
    recentViews.forEach(v => {
      const dateStr = v.viewed_at.slice(0, 10)
      const day = days.find(d => d.dateStr === dateStr)
      if (day) day.count++
    })

    // All-time totals per post
    const postTotals: Record<string, number> = {}
    allViews.forEach(v => {
      postTotals[v.post_id] = (postTotals[v.post_id] ?? 0) + 1
    })

    // Sort posts by total views desc
    const sortedPosts = [...posts].sort((a, b) => (postTotals[b.id] ?? 0) - (postTotals[a.id] ?? 0))

    const totalAllTime = allViews.length
    const totalLast30 = recentViews.length
    const topPost = sortedPosts[0]

    return { dayMap: days, postTotals, sortedPosts, totalAllTime, totalLast30, topPost }
  }, [posts, recentViews, allViews])

  const maxCount = Math.max(...dayMap.map(d => d.count), 1)
  const MAX_BAR_HEIGHT = 120
  const BAR_WIDTH = 12
  const BAR_GAP = 4
  const SVG_WIDTH = (BAR_WIDTH + BAR_GAP) * 30 - BAR_GAP
  const SVG_HEIGHT = MAX_BAR_HEIGHT + 24 // extra for x-axis labels

  const topPostTitle = topPost
    ? (postTotals[topPost.id] ?? 0) > 0
      ? topPost.title.length > 28
        ? topPost.title.slice(0, 28) + '…'
        : topPost.title
      : '—'
    : '—'

  return (
    <div className="w-full px-4 sm:px-8 py-6 sm:py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-0.5" style={{ color: 'var(--text)' }}>Analítica</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Estadísticas de visitas de tus publicaciones.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <StatCard label="Visitas totales" value={totalAllTime.toLocaleString('es-ES')} />
        <StatCard label="Últimos 30 días" value={totalLast30.toLocaleString('es-ES')} />
        <StatCard label="Más visitado" value={topPostTitle} />
      </div>

      {/* Bar chart */}
      <div
        className="rounded border p-5 mb-8"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
      >
        <p className="text-sm font-medium mb-4" style={{ color: 'var(--text)' }}>
          Visitas — últimos 30 días
        </p>
        <div className="overflow-x-auto" style={{ position: 'relative' }}>
          <svg
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            style={{ display: 'block', minWidth: SVG_WIDTH }}
            onMouseLeave={() => setTooltip(null)}
          >
            {dayMap.map((day, i) => {
              const barH = Math.max(2, Math.round((day.count / maxCount) * MAX_BAR_HEIGHT))
              const x = i * (BAR_WIDTH + BAR_GAP)
              const y = MAX_BAR_HEIGHT - barH

              // Show label every 5th bar
              const showLabel = i % 5 === 0

              return (
                <g key={day.dateStr}>
                  <rect
                    x={x}
                    y={y}
                    width={BAR_WIDTH}
                    height={barH}
                    rx={2}
                    fill="var(--text)"
                    opacity={day.count === 0 ? 0.12 : 0.85}
                    onMouseEnter={e => {
                      const rect = (e.target as SVGRectElement).getBoundingClientRect()
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                        label: day.label,
                        count: day.count,
                      })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ cursor: 'default' }}
                  />
                  {showLabel && (
                    <text
                      x={x + BAR_WIDTH / 2}
                      y={MAX_BAR_HEIGHT + 16}
                      textAnchor="middle"
                      fontSize={9}
                      fill="var(--text-tertiary)"
                      fontFamily="inherit"
                    >
                      {day.label}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Tooltip — rendered as fixed overlay */}
        {tooltip && (
          <div
            style={{
              position: 'fixed',
              left: tooltip.x,
              top: tooltip.y - 8,
              transform: 'translate(-50%, -100%)',
              background: 'var(--text)',
              color: 'var(--bg)',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 12,
              pointerEvents: 'none',
              zIndex: 50,
              whiteSpace: 'nowrap',
            }}
          >
            {tooltip.label} · {tooltip.count} {tooltip.count === 1 ? 'visita' : 'visitas'}
          </div>
        )}
      </div>

      {/* Top posts table */}
      <div
        className="rounded border overflow-hidden"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Posts por visitas
          </p>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        {sortedPosts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Aún no tienes publicaciones.
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div
              className="grid px-5 py-2 text-xs font-medium uppercase tracking-widest"
              style={{
                gridTemplateColumns: '1fr auto auto',
                color: 'var(--text-tertiary)',
                letterSpacing: '0.07em',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
              }}
            >
              <span>Título</span>
              <span className="text-right pr-6">Visitas</span>
              <span className="text-right">Estado</span>
            </div>

            {sortedPosts.slice(0, 10).map((post, i) => {
              const views = postTotals[post.id] ?? 0
              const isLast = i === Math.min(sortedPosts.length, 10) - 1
              return (
                <div
                  key={post.id}
                  className="grid items-center px-5 py-3 transition-colors hover:bg-[var(--bg-hover)]"
                  style={{
                    gridTemplateColumns: '1fr auto auto',
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <span
                    className="text-sm truncate pr-4"
                    style={{ color: 'var(--text)' }}
                    title={post.title}
                  >
                    {post.title}
                  </span>
                  <span
                    className="text-sm font-medium text-right pr-6"
                    style={{ color: views > 0 ? 'var(--text)' : 'var(--text-tertiary)' }}
                  >
                    {views > 0 ? views.toLocaleString('es-ES') : (
                      <span className="text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>
                        Sin visitas aún
                      </span>
                    )}
                  </span>
                  <span>
                    <StatusBadge published={post.published} />
                  </span>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
