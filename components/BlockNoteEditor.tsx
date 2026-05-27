'use client'

import { useMemo, useEffect } from 'react'
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

export default function BlockNoteEditor({ initialContent, onChange }: Props) {
  const initialBlocks = useMemo(() => parseInitialBlocks(initialContent), [initialContent])

  const editor = useCreateBlockNote({
    initialContent: initialBlocks,
  })

  useEffect(() => {
    const trimmed = initialContent?.trim() ?? ''
    if (initialBlocks) {
      onChange(JSON.stringify(editor.document))
      return
    }
    if (!trimmed) return
    // Legacy HTML content — parse into blocks
    const parsed = editor.tryParseHTMLToBlocks(trimmed)
    editor.replaceBlocks(editor.document, parsed)
    onChange(JSON.stringify(editor.document))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <BlockNoteView
      editor={editor}
      theme="light"
      onChange={() => onChange(JSON.stringify(editor.document))}
    />
  )
}
