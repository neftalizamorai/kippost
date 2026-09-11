import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  metadataBase: new URL('https://kippost.com'),
  title: { default: 'KipPost', template: '%s · KipPost' },
  description: 'Un sitio tranquilo para escribir.',
  openGraph: {
    siteName: 'KipPost',
    images: [{ url: '/api/og?title=KipPost', width: 1200, height: 630 }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={GeistSans.variable}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
