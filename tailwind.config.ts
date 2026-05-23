import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--text)',
            a: { color: 'var(--text)', textDecoration: 'underline' },
            h1: { color: 'var(--text)' },
            h2: { color: 'var(--text)' },
            h3: { color: 'var(--text)' },
            h4: { color: 'var(--text)' },
            strong: { color: 'var(--text)' },
            blockquote: { color: 'var(--text-secondary)', borderLeftColor: 'var(--border)' },
            code: { color: 'var(--text)', backgroundColor: 'var(--bg-secondary)' },
            pre: { backgroundColor: 'var(--bg-secondary)' },
            hr: { borderColor: 'var(--border)' },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
