/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0e17',
        surface: '#111827',
        border: '#1f2937',
        primary: '#f9fafb',
        secondary: '#9ca3af',
        accent: '#22d3ee',
        aipick: '#a78bfa',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        cardReveal: {
          '0%': { opacity: '0', transform: 'translateY(14px) scale(0.985)', filter: 'blur(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(167, 139, 250, 0.0)' },
          '50%': { boxShadow: '0 0 16px 2px rgba(167, 139, 250, 0.35)' },
        },
        drawLine: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        bootGlow: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        shimmer: 'shimmer 1.4s linear infinite',
        blink: 'blink 1.1s step-end infinite',
        ticker: 'ticker 45s linear infinite',
        cardReveal: 'cardReveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        riseIn: 'riseIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        pulseGlow: 'pulseGlow 2.6s ease-in-out infinite',
        drawLine: 'drawLine 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        bootGlow: 'bootGlow 1.6s ease-out both',
      },
    },
  },
  plugins: [],
};
