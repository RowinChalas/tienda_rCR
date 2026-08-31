/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf9f6',
          100: '#f5f0e8',
          200: '#ebdccb',
          300: '#dec2a7',
          400: '#cca27f',
          500: '#ba855d',
          600: '#a36d49',
          700: '#84533a',
          800: '#6c4331',
          900: '#58372a',
          950: '#301c15',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          700: '#1e293b',
          800: '#0f172a',
          900: '#090d16',
          950: '#04070c',
        },
        accent: {
          gold: '#d4af37',
          terracotta: '#c85a32',
          forest: '#2d5a43',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 12px 30px -4px rgba(15, 23, 42, 0.14)',
        'glow-brand': '0 0 25px -5px rgba(186, 133, 93, 0.3)',
      },
    },
  },
  plugins: [],
}
