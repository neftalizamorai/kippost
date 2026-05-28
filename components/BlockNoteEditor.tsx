'use client'

import { useMemo, useEffect, useState, useCallback } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/core/style.css'
import '@blocknote/mantine/style.css'

interface Props {
  initialContent: string | null
  onChange: (json: string) => void
}

function parseInitialBlocks(content: string | null) {
  if (!content) return undefined
  const trimmed = content.trimStart()
  if (trimmed.startsWith('[')) {
    try { return JSON.parse(trimmed) } catch {}
  }
  return undefined
}

type BlockType = 'paragraph' | 'heading' | 'bulletListItem' | 'numberedListItem'
type HeadingLevel = 1 | 2 | 3

export default function BlockNoteEditor({ initialContent, onChange }: Props) {
  const initialBlocks = useMemo(() => parseInitialBlocks(initialContent), [initialContent])
  const editor = useCreateBlockNote({ initialContent: initialBlocks })
  const [focused, setFocused] = useState(false)
  const [activeStyles, setActiveStyles] = useState<Record<string, boolean>>({})
  const [currentBlockType, setCurrentBlockType] = useState<string>('paragraph')
  const [currentHeadingLevel, setCurrentHeadingLevel] = useState<number>(1)

  useEffect(() => {
    const trimmed = initialContent?.trim() ?? ''
    if (initialBlocks) { onChange(JSON.stringify(editor.document)); return }
    if (!trimmed) return
    const parsed = editor.tryParseHTMLToBlocks(trimmed)
    editor.replaceBlocks(editor.document, parsed)
    onChange(JSON.stringify(editor.document))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const syncState = useCallback(() => {
    try {
      setActiveStyles(editor.getActiveStyles() as Record<string, boolean>)
      const pos = editor.getTextCursorPosition()
      setCurrentBlockType(pos.block.type)
      setCurrentHeadingLevel((pos.block.props as { level?: number })?.level ?? 1)
    } catch {}
  }, [editor])

  // Toggle bold/italic/etc — onPointerDown + preventDefault keeps editor focused on mobile
  const toggleStyle = (style: string) => {
    editor.focus()
    editor.toggleStyles({ [style]: true } as Parameters<typeof editor.toggleStyles>[0])
    syncState()
    onChange(JSON.stringify(editor.document))
  }

  const setBlockType = (type: BlockType, level?: HeadingLevel) => {
    try {
      editor.focus()
      const block = editor.getTextCursorPosition().block
      editor.updateBlock(block, {
        type,
        props: type === 'heading' ? { level: level ?? 1 } : {},
      } as Parameters<typeof editor.updateBlock>[1])
      syncState()
      onChange(JSON.stringify(editor.document))
    } catch {}
  }

  const StyleBtn = ({ style, label, title }: { style: string; label: string; title: string }) => (
    <button
      onPointerDown={e => { e.preventDefault(); toggleStyle(style) }}
      className="w-9 h-9 flex items-center justify-center rounded text-sm font-medium transition-colors select-none"
      style={{
        color: activeStyles[style] ? 'var(--text)' : 'var(--text-secondary)',
        background: activeStyles[style] ? 'var(--bg-secondary)' : 'transparent',
      }}
      title={title}
    >
      {label}
    </button>
  )

  const BlockBtn = ({ type, level, label, title }: { type: BlockType; level?: HeadingLevel; label: string; title: string }) => {
    const isActive = currentBlockType === type && (type !== 'heading' || currentHeadingLevel === level)
    return (
      <button
        onPointerDown={e => { e.preventDefault(); setBlockType(type, level) }}
        className="h-8 px-2 flex items-center justify-center rounded text-xs font-semibold transition-colors select-none"
        style={{
          color: isActive ? 'var(--text)' : 'var(--text-secondary)',
          background: isActive ? 'var(--bg-secondary)' : 'transparent',
        }}
        title={title}
      >
        {label}
      </button>
    )
  }

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme="light"
        onChange={() => onChange(JSON.stringify(editor.document))}
        onSelectionChange={syncState}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ minHeight: '50vh' }}
      />

      {/* Mobile-only custom toolbar — fixed above virtual keyboard */}
      {focused && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          style={{
            background: 'var(--bg)',
            borderTop: '1px solid var(--border)',
            boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
          }}
        >
          {/* Row 1: block types */}
          <div
            className="flex items-center gap-1 px-3 pt-2 pb-1"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <BlockBtn type="paragraph" label="¶" title="Párrafo" />
            <BlockBtn type="heading" level={1} label="H1" title="Título 1" />
            <BlockBtn type="heading" level={2} label="H2" title="Título 2" />
            <BlockBtn type="heading" level={3} label="H3" title="Título 3" />
            <BlockBtn type="bulletListItem" label="•—" title="Lista" />
            <BlockBtn type="numberedListItem" label="1." title="Lista numerada" />
          </div>
          {/* Row 2: inline styles */}
          <div className="flex items-center gap-1 px-3 py-1">
            <StyleBtn style="bold" label="N" title="Negrita" />
            <StyleBtn style="italic" label="K" title="Cursiva" />
            <StyleBtn style="underline" label="S" title="Subrayado" />
            <StyleBtn style="strike" label="T̶" title="Tachado" />
          </div>
        </div>
      )}
    </div>
  )
}
