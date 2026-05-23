import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <header className="flex items-center justify-between px-8 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-base font-semibold tracking-tight" style={{ color: 'var(--text)' }}>KipPost</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="text-sm px-3 py-1.5 rounded border transition-colors hover:bg-[var(--bg-hover)]" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
            Entrar
          </Link>
          <Link href="/register" className="text-sm px-3 py-1.5 rounded font-medium hover:opacity-90" style={{ background: 'var(--text)', color: 'var(--bg)' }}>
            Comenzar
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-5" style={{ color: 'var(--text)' }}>
          Tu blog personal,<br />sin ruido.
        </h1>
        <p className="text-lg max-w-md mb-10" style={{ color: 'var(--text-secondary)' }}>
          Escribe y publica en tu propio espacio. Sin suscripciones, sin correos, solo tú y tus lectores.
        </p>
        <Link
          href="/register"
          className="text-sm font-medium px-6 py-3 rounded hover:opacity-90"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          Crea tu blog gratis →
        </Link>
      </main>

      <footer className="py-6 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
        KipPost · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
