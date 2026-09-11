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
        sans: ['var(--font-geist-sans)', 'Geist', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '6px',
        md: '10px',
        lg: '18px',
        xl: '24px',
        '2xl': '32px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--text)',
            fontSize: '16px',
            lineHeight: '1.75',
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
