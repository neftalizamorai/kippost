'use client'

import { useState, useRef, KeyboardEvent } from 'react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export default function TagInput({ tags, onChange, placeholder = 'Añadir etiqueta...' }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const add = (raw: string) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-')
    if (!tag || tags.includes(tag)) return
    onChange([...tags, tag])
  }

  const remove = (tag: string) => onChange(tags.filter(t => t !== tag))

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(input)
      setInput('')
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      remove(tags[tags.length - 1])
    }
  }

  const handleBlur = () => {
    if (input.trim()) {
      add(input)
      setInput('')
    }
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 px-3 py-2 rounded border min-h-[40px] cursor-text"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text)' }}
        >
          {tag}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); remove(tag) }}
            className="hover:opacity-60 transition-opacity leading-none"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value.replace(',', ''))}
        onKeyDown={handleKey}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] text-sm bg-transparent outline-none"
        style={{ color: 'var(--text)' }}
      />
    </div>
  )
}
