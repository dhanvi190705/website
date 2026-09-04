import type { Config } from 'tailwindcss';

/**
 * Every colour resolves to a CSS custom property defined in globals.css.
 *
 * That indirection is the point: the current dark + gold palette is a
 * PLACEHOLDER. When the real Rustomjee brand assets arrive, the values change
 * in one `:root` block and nothing in the component tree is touched.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ground: 'rgb(var(--c-ground) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-raised': 'rgb(var(--c-surface-raised) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--c-ink-muted) / <alpha-value>)',
        'ink-faint': 'rgb(var(--c-ink-faint) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        'accent-bright': 'rgb(var(--c-accent-bright) / <alpha-value>)',
        'accent-deep': 'rgb(var(--c-accent-deep) / <alpha-value>)',
        ok: 'rgb(var(--c-ok) / <alpha-value>)',
        warn: 'rgb(var(--c-warn) / <alpha-value>)',
        risk: 'rgb(var(--c-risk) / <alpha-value>)',
        info: 'rgb(var(--c-info) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 20px 50px -24px rgb(0 0 0 / 0.85)',
        accent: '0 0 0 1px rgb(var(--c-accent) / 0.35), 0 16px 40px -18px rgb(var(--c-accent) / 0.5)',
      },
      backgroundImage: {
        'accent-gradient':
          'linear-gradient(135deg, rgb(var(--c-accent-deep)) 0%, rgb(var(--c-accent)) 42%, rgb(var(--c-accent-bright)) 58%, rgb(var(--c-accent)) 76%, rgb(var(--c-accent-deep)) 100%)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%, 100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        blink: {
          '0%, 70%, 100%': { opacity: '1' },
          '20%, 50%': { opacity: '0.25' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        blink: 'blink 1.2s steps(1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
