import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, readingTime, addHeadingIds, extractHeadings } from '@/lib/utils'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { blocknoteToHtml } from '@/lib/blocknote-to-html'
import { ReadingProgress } from '@/components/ReadingProgress'
import { TableOfContents } from '@/components/TableOfContents'
import { ShareButton } from '@/components/ShareButton'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { Metadata } from 'next'
import { coverStyle } from '@/lib/coverOptions'

const ALLOWED_HTML: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'strong', 'em', 's', 'u',
    'code', 'pre',
    'blockquote',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    '*': ['id', 'class'],
    'a': ['href', 'rel', 'target'],
    'img': ['src', 'alt', 'title'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan'],