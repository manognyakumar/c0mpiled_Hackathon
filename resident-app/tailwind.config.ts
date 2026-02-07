import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * OBSIDIAN NEON — Design System Tokens
 * Staff-level, award-grade Tailwind configuration.
 * All utilities use logical properties for RTL/LTR.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      /* ── Color Palette: Obsidian Neon ───────────────── */
      colors: {
        obsidian: {
          DEFAULT: '#050505',
          surface: '#0A0A10',
          elevated: '#111118',
          hover: '#16161F',
        },
        neon: {
          cyan: '#00F2FF',
          violet: '#7000FF',
          green: '#00FF85',
        },
        status: {
          approved: '#00FF85',
          pending: '#FFBE0B',
          denied: '#FF3B5C',
          expired: '#6B7280',
        },
        glass: {
          border: 'rgba(255, 255, 255, 0.10)',
          'border-hover': 'rgba(255, 255, 255, 0.18)',
          fill: 'rgba(255, 255, 255, 0.04)',
        },
      },

      /* ── Font Families ─────────────────────────────── */
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
      },

      /* ── Font Sizes: Logical Scaling ───────────────── */
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'heading': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
        'title': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body': ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'micro': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.04em' }],
      },

      /* ── Spacing Scale (4px base) ──────────────────── */
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
        '88': '22rem',
      },

      /* ── Border Radius ─────────────────────────────── */
      borderRadius: {
        'card': '1rem',
        'button': '0.75rem',
        'badge': '100px',
        'modal': '1.5rem',
      },

      /* ── Shadows: Neon Glow System ─────────────────── */
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 242, 255, 0.25), 0 0 60px rgba(0, 242, 255, 0.10)',
        'glow-cyan-strong': '0 0 30px rgba(0, 242, 255, 0.40), 0 0 80px rgba(0, 242, 255, 0.15)',
        'glow-violet': '0 0 20px rgba(112, 0, 255, 0.25), 0 0 60px rgba(112, 0, 255, 0.10)',
        'glow-green': '0 0 20px rgba(0, 255, 133, 0.25), 0 0 60px rgba(0, 255, 133, 0.10)',
        'glow-red': '0 0 20px rgba(255, 59, 92, 0.25), 0 0 60px rgba(255, 59, 92, 0.10)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.40)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.50), 0 4px 12px rgba(0, 0, 0, 0.30)',
      },

      /* ── Backdrop Blur ─────────────────────────────── */
      backdropBlur: {
        glass: '12px',
      },

      /* ── Keyframe Animations ───────────────────────── */
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 242, 255, 0.20)' },
          '50%': { boxShadow: '0 0 35px rgba(0, 242, 255, 0.45)' },
        },
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 133, 0.20)' },
          '50%': { boxShadow: '0 0 35px rgba(0, 255, 133, 0.45)' },
        },
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 59, 92, 0.20)' },
          '50%': { boxShadow: '0 0 35px rgba(255, 59, 92, 0.45)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'pulse-green': 'pulse-green 2.5s ease-in-out infinite',
        'pulse-red': 'pulse-red 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },

      /* ── Transition Presets ────────────────────────── */
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },

  plugins: [
    /* ── Logical Properties Utilities (ms-*, me-*, ps-*, pe-*) ─ */
    plugin(function ({ addUtilities, theme, e }) {
      // Tailwind v3 has logical property support via `ms-*` etc.
      // But let's add glass utilities and custom patterns.

      addUtilities({
        /* Glass Card Surface */
        '.glass-surface': {
          background: 'rgba(10, 10, 16, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          borderRadius: theme('borderRadius.card'),
        },
        '.glass-surface-hover': {
          borderColor: 'rgba(255, 255, 255, 0.18)',
        },

        /* Gradient text */
        '.text-gradient-cyan': {
          background: 'linear-gradient(135deg, #00F2FF 0%, #7000FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        '.text-gradient-green': {
          background: 'linear-gradient(135deg, #00FF85 0%, #00F2FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },

        /* Skeleton loading */
        '.skeleton': {
          background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
          borderRadius: theme('borderRadius.card'),
        },

        /* Scrollbar hide */
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    }),
  ],
};

export default config;
