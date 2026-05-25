export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatMonth(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })
}

export function readingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function generateExcerpt(content: string, maxLength = 160): string {
  const text = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

export function extractHeadings(html: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = []
  const regex = /<h([2-4])\s+id="([^"]+)"[^>]*>(.*?)<\/h[2-4]>/g
  let match
  while ((match = regex.exec(html)) !== null) {
    const text = match[3].replace(/<[^>]+>/g, '')
    headings.push({ level: parseInt(match[1]), id: match[2], text })
  }
  return headings
}

export function addHeadingIds(html: string): string {
  return html.replace(
    /<h([2-6])>(.*?)<\/h[2-6]>/g,
    (_, level, inner) => {
      const text = inner.replace(/<[^>]+>/g, '')
      const id = slugify(text)
      return `<h${level} id="${id}">${inner}</h${level}>`
    }
  )
}
