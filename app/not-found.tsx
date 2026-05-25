import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--bg)' }}
    >
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>
        404
      </p>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
        Página no encontrada
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
        La dirección que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        className="text-sm font-medium px-4 py-2 rounded border transition-colors hover:bg-[var(--bg-hover)]"
        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
      >
        Volver al inicio
      </Link>
    </div>
  )
}
