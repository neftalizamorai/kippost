'use client'

import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-5% 0% -80% 0%' }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="space-y-0.5">
      <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
        Contenido
      </p>
      {headings.map(({ id, text, level }) => (
        <a
          key={id}
          href={`#${id}`}
          className="block text-[13px] py-0.5 leading-snug transition-all duration-150 hover:opacity-80"
          style={{
            paddingLeft: `${(level - 2) * 14}px`,
            color: activeId === id ? 'var(--text)' : 'var(--text-secondary)',
            fontWeight: activeId === id ? 500 : 400,
          }}
        >
          {text}
        </a>
      ))}
    </nav>
  )
}
