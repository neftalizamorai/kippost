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
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '4px',
        lg: '4px',
        xl: '4px',
        '2xl': '4px',
        full: '9999px',
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
