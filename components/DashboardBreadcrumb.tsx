'use client'

import { usePathname } from 'next/navigation'

const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Publicaciones',
  '/dashboard/new': 'Nuevo post',
  '/dashboard/settings': 'Ajustes',
  '/dashboard/analytics': 'Lectores',
}

function getLabel(pathname: string): string {
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname]
  if (pathname.startsWith('/dashboard/edit/')) return 'Editar post'
  return ''
}

export default function DashboardBreadcrumb({ siteName }: { siteName: string }) {
  const pathname = usePathname()
  const label = getLabel(pathname)

  return (
    <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{siteName}</span>
      {label && (
        <>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          <span>{label}</span>
        </>
      )}
    </span>
  )
}
