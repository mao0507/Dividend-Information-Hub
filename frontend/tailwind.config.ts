import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0a0a0b',
          2: '#101013',
          3: '#16161a',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          strong: 'rgba(255,255,255,0.14)',
        },
        content: {
          DEFAULT: '#e8e8ea',
          soft: 'rgba(255,255,255,0.6)',
          faint: 'rgba(255,255,255,0.38)',
        },
        accent: {
          DEFAULT: 'var(--accent, #22c55e)',
        },
        danger: {
          DEFAULT: '#ef4444',
        },
        warning: {
          DEFAULT: '#f59e0b',
        },
        up: 'var(--up-color, #ef4444)',
        down: 'var(--down-color, #22c55e)',
      },
      fontFamily: {
        sans: ["'Inter'", "'Noto Sans TC'", 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius, 10px)',
      },
    },
  },
  plugins: [],
} satisfies Config
