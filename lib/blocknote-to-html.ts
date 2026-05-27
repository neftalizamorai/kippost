// Pure JS BlockNote JSON → HTML converter (no DOM required, safe for server components)

interface StyledText {
  type: 'text'
  text: string
  styles: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    strike?: boolean
    code?: boolean
    textColor?: string
    backgroundColor?: string
  }
}

interface Link {
  type: 'link'
  href: string
  content: StyledText[]
}

type InlineContent = StyledText | Link

interface Block {
  id?: string
  type: string
  props?: Record<string, unknown>
  content?: InlineContent[] | unknown
  children?: Block[]
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderInline(content: InlineContent[]): string {
  return content.map(node => {
    if (node.type === 'link') {
      const inner = renderInline(node.content as StyledText[])
      const href = escapeHtml(node.href || '')
      return `<a href="${href}" rel="noopener noreferrer">${inner}</a>`
    }
    // text node
    const text = node as StyledText
    let html = escapeHtml(text.text || '')
    if (!html) return html
    const s = text.styles || {}
    if (s.code) html = `<code>${html}</code>`
    if (s.bold) html = `<strong>${html}</strong>`
    if (s.italic) html = `<em>${html}</em>`
    if (s.underline) html = `<u>${html}</u>`
    if (s.strike) html = `<s>${html}</s>`
    return html
  }).join('')
}

function renderBlock(block: Block): string {
  const inline = Array.isArray(block.content) ? renderInline(block.content as InlineContent[]) : ''
  const children = block.children?.length ? renderBlocks(block.children) : ''
  const props = block.props || {}

  switch (block.type) {
    case 'paragraph':
      return `<p>${inline || '<br>'}${children}</p>`

    case 'heading': {
      const level = (props.level as number) || 1
      const id = inline.replace(/<[^>]*>/g, '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      return `<h${level} id="${id}">${inline}</h${level}>${children}`
    }

    case 'bulletListItem':
      return `<li>${inline}${children ? `<ul>${children}</ul>` : ''}</li>`

    case 'numberedListItem':
      return `<li>${inline}${children ? `<ol>${children}</ol>` : ''}</li>`

    case 'checkListItem': {
      const checked = props.checked ? ' checked' : ''
      return `<li><input type="checkbox"${checked} disabled> ${inline}${children}</li>`
    }

    case 'codeBlock': {
      const lang = escapeHtml((props.language as string) || '')
      return `<pre><code class="language-${lang}">${escapeHtml(typeof block.content === 'string' ? block.content : inline)}</code></pre>`
    }

    case 'image': {
      const src = escapeHtml((props.url as string) || '')
      const alt = escapeHtml((props.caption as string) || '')
      if (!src) return children
      return `<figure><img src="${src}" alt="${alt}">${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>${children}`
    }

    case 'table':
      // Tables in BlockNote have complex structure; render a placeholder
      return `<p>[table]</p>`

    default:
      return inline ? `<p>${inline}</p>${children}` : children
  }
}

function renderBlocks(blocks: Block[]): string {
  const parts: string[] = []
  let i = 0

  while (i < blocks.length) {
    const block = blocks[i]

    if (block.type === 'bulletListItem') {
      const items: string[] = []
      while (i < blocks.length && blocks[i].type === 'bulletListItem') {
        items.push(renderBlock(blocks[i]))
        i++
      }
      parts.push(`<ul>${items.join('')}</ul>`)
      continue
    }

    if (block.type === 'numberedListItem') {
      const items: string[] = []
      while (i < blocks.length && blocks[i].type === 'numberedListItem') {
        items.push(renderBlock(blocks[i]))
        i++
      }
      parts.push(`<ol>${items.join('')}</ol>`)
      continue
    }

    if (block.type === 'checkListItem') {
      const items: string[] = []
      while (i < blocks.length && blocks[i].type === 'checkListItem') {
        items.push(renderBlock(blocks[i]))
        i++
      }
      parts.push(`<ul class="checklist">${items.join('')}</ul>`)
      continue
    }

    parts.push(renderBlock(block))
    i++
  }

  return parts.join('\n')
}

export function blocknoteToHtml(json: string): string {
  try {
    const blocks: Block[] = JSON.parse(json)
    if (!Array.isArray(blocks)) return ''
    return renderBlocks(blocks)
  } catch {
    return ''
  }
}
