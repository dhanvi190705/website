/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B0B0B', // pitch black — page ground
          soft: '#101010',
          raised: '#131313',
        },
        charcoal: {
          DEFAULT: '#161616', // cards / containers
          light: '#1D1D1D',
          line: '#262626',
        },
        gold: {
          50: '#FFF8DC',
          100: '#F7E9A8',
          200: '#EFD98A',
          300: '#E6C965',
          400: '#FFD700', // sparkling highlight
          500: '#D4AF37', // metallic base
          600: '#B4922B',
          700: '#8A6F1F',
          900: '#4A3A10',
        },
        signal: {
          ok: '#4ADE80',
          warn: '#FBBF24',
          risk: '#F87171',
          info: '#7DA7DB',
        },
      },
      fontFamily: {
        display: ['Archivo', 'Helvetica Neue', 'Arial', 'sans-serif'],
        sans: ['IBM Plex Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glass: '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 24px 60px -24px rgba(0,0,0,0.9)',
        gold: '0 0 0 1px rgba(212,175,55,0.35), 0 18px 48px -20px rgba(212,175,55,0.55)',
        'gold-lg': '0 0 0 1px rgba(212,175,55,0.5), 0 28px 70px -18px rgba(212,175,55,0.7)',
        lift: '0 32px 70px -32px rgba(0,0,0,1)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #8A6F1F 0%, #D4AF37 38%, #FFD700 55%, #D4AF37 72%, #8A6F1F 100%)',
        'gold-sheen': 'linear-gradient(100deg, transparent 20%, rgba(255,215,0,0.32) 48%, transparent 76%)',
        'glass-panel': 'linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.012) 46%, rgba(0,0,0,0.16) 100%)',
        grid: 'linear-gradient(rgba(212,175,55,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.055) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '64px 64px',
      },
      keyframes: {
        sheen: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.92)', opacity: '0.8' },
          '70%': { transform: 'scale(1.35)', opacity: '0' },
          '100%': { transform: 'scale(1.35)', opacity: '0' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(3%, -4%, 0) scale(1.08)' },
        },
        'caret-blink': {
          '0%, 70%, 100%': { opacity: '1' },
          '20%, 50%': { opacity: '0' },
        },
      },
      animation: {
        sheen: 'sheen 2.4s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite',
        drift: 'drift 26s ease-in-out infinite',
        'caret-blink': 'caret-blink 1.1s steps(1) infinite',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
