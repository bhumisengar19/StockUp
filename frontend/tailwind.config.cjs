/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* CSS-variable driven tokens — work in both themes */
        background:  'var(--bg)',
        foreground:  'var(--text)',
        muted:       'var(--text-muted)',
        card:        'var(--card)',
        border:      'var(--border)',
        button:      'var(--button)',

        /* Blue primary scale */
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6',
        },
        /* Gray scale */
        secondary: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        status: {
          success: '#22c55e',
          warning: '#f97316',
          error:   '#ef4444',
          info:    '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['"Comic Neue"', 'cursive', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        soft:    '0 4px 24px var(--shadow)',
        premium: '0 12px 40px var(--shadow)',
        glow:    '0 0 20px rgba(59,130,246,0.4)',
        'glow-moon': '0 0 40px rgba(148,163,184,0.35)',
        'glow-sun':  '0 0 60px rgba(253,224,71,0.5)',
      },
      animation: {
        'fade-in':   'fadeIn 0.35s ease-out both',
        'slide-in':  'slideIn 0.4s ease-out both',
        'sun-pulse': 'sunPulse 4s ease-in-out infinite',
        'moon-pulse':'moonPulse 5s ease-in-out infinite',
        'cloud-drift':'cloudDrift 60s linear infinite',
        'wobble':    'wobble 0.6s ease-in-out both',
        'spin-slow': 'spinSlow 1.2s linear infinite',
        'toggle-glow':'toggleGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        sunPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.04)' },
        },
        moonPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.03)' },
        },
        cloudDrift: {
          'from': { transform: 'translateX(0px)' },
          'to':   { transform: 'translateX(calc(100vw + 400px))' },
        },
        wobble: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%':      { transform: 'rotate(1deg) scale(1.02)' },
          '75%':      { transform: 'rotate(-1deg) scale(1.02)' },
        },
        spinSlow: {
          'from': { transform: 'rotate(0deg)' },
          'to':   { transform: 'rotate(360deg)' },
        },
        toggleGlow: {
          '0%, 100%': { opacity: '0', transform: 'scale(1)' },
          '50%':      { opacity: '0.4', transform: 'scale(1.15)' },
        },
      },
      borderRadius: {
        xl:  '18px',
        '2xl': '24px',
        '3xl': '30px',
      },
      transitionDuration: {
        400: '400ms',
        700: '700ms',
      },
    },
  },
  plugins: [],
};
