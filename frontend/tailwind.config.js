/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Primary brand — indigo/violet palette (21st.dev inspired)
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Dark background palette
        night: {
          950: '#050814',
          900: '#080d1a',
          800: '#0d1117',
          700: '#111827',
          600: '#1a2234',
          500: '#1e293b',
          400: '#334155',
          300: '#475569',
        },
        // Surface colours
        surface: {
          DEFAULT: 'rgba(255,255,255,0.03)',
          hover:   'rgba(255,255,255,0.05)',
          active:  'rgba(99,102,241,0.08)',
        }
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':   'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-bg': "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.15) 0%, transparent 60%)",
      },
      animation: {
        'fade-in':   'fadeIn 0.4s ease-out forwards',
        'slide-up':  'slideUp 0.5s ease-out forwards',
        'slide-in':  'slideIn 0.3s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'blob':      'blob 8s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(99,102,241,0.2)' },
          '50%':       { boxShadow: '0 0 30px rgba(99,102,241,0.5)' },
        },
        blob: {
          '0%':   { transform: 'translate(0px, 0px) scale(1)' },
          '33%':  { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%':  { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.06)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
