import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

/**
 * CLARITY — Light-Mode Trust-Driven Design System
 * Clean, calm, professional. WCAG AA compliant.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#f8fafc',
          surface: '#ffffff',
          muted: '#f1f5f9',
          hover: '#e2e8f0',
          border: '#e2e8f0',
        },
        ink: {
          DEFAULT: '#0f172a',
          secondary: '#334155',
          muted: '#64748b',
          faint: '#94a3b8',
        },
        brand: {
          DEFAULT: '#2563eb',
          light: '#dbeafe',
          dark: '#1d4ed8',
          50: '#eff6ff',
        },
        accent: {
          green: '#22c55e',
          'green-light': '#dcfce7',
          teal: '#06b6d4',
          'teal-light': '#cffafe',
        },
        status: {
          success: '#16a34a',
          'success-bg': '#dcfce7',
          warning: '#f59e0b',
          'warning-bg': '#fef3c7',
          error: '#dc2626',
          'error-bg': '#fef2f2',
          info: '#2563eb',
          'info-bg': '#dbeafe',
        },
      },

      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto',
          '"Helvetica Neue"', 'Arial', 'sans-serif',
        ],
        arabic: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'display': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
        'title': ['1.125rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body': ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-medium': ['0.9375rem', { lineHeight: '1.6', fontWeight: '500' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'micro': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.02em' }],
      },

      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
        '88': '22rem',
      },

      borderRadius: {
        'card': '0.875rem',
        'button': '0.625rem',
        'badge': '100px',
        'modal': '1.25rem',
      },

      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'elevated': '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'nav': '0 -1px 3px rgba(0,0,0,0.05)',
        'brand-glow': '0 0 0 3px rgba(37,99,235,0.15)',
      },

      keyframes: {
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'shimmer': 'shimmer 1.8s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },

  plugins: [
    plugin(function ({ addUtilities, theme }) {
      addUtilities({
        '.surface-card': {
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: theme('borderRadius.card') ?? '0.875rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        },

        '.input-field': {
          width: '100%',
          borderRadius: theme('borderRadius.button') ?? '0.625rem',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          color: '#0f172a',
          fontSize: '0.9375rem',
          lineHeight: '1.6',
          paddingBlock: '0.75rem',
          paddingInline: '1rem',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        },
        '.input-field:hover': {
          borderColor: '#cbd5e1',
        },
        '.input-field:focus': {
          borderColor: '#2563eb',
          boxShadow: '0 0 0 3px rgba(37,99,235,0.12)',
        },
        '.input-field::placeholder': {
          color: '#94a3b8',
        },

        '.skeleton': {
          background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.8s linear infinite',
          borderRadius: theme('borderRadius.card') ?? '0.875rem',
        },

        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    }),
  ],
};

export default config;
