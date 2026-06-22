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
        // Primary brand — orange palette
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Accent — yellow palette
        accent: {
          50:  '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // Light surface / background
        surface: {
          DEFAULT: '#FFFFFF',
          warm:    '#fff7ed',
          muted:   '#fef3c7',
        },
        // Dark text tones
        ink: {
          900: '#111827',
          700: '#374151',
          500: '#6b7280',
          300: '#d1d5db',
        },
        // Legacy dark night colors kept for dashboard compatibility
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
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'orange-mesh':     'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249,115,22,0.18) 0%, transparent 60%)',
        'yellow-mesh':     'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(250,204,21,0.12) 0%, transparent 60%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-up':   'slideUp 0.5s ease-out forwards',
        'slide-in':   'slideIn 0.3s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'blob':       'blob 8s infinite',
        'float':      'float 4s ease-in-out infinite',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(249,115,22,0.25)' },
          '50%':       { boxShadow: '0 0 40px rgba(249,115,22,0.5)' },
        },
        blob: {
          '0%':   { transform: 'translate(0px, 0px) scale(1)' },
          '33%':  { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%':  { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      borderColor: {
        DEFAULT: 'rgba(249,115,22,0.12)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'orange':    '0 4px 24px rgba(249,115,22,0.18)',
        'orange-lg': '0 8px 40px rgba(249,115,22,0.25)',
        'yellow':    '0 4px 24px rgba(250,204,21,0.15)',
      },
    },
  },
  plugins: [],
}
