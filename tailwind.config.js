/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Agriculture brand palette ─────────────────────────────
      // A muted, earthy, professional green palette. Avoids neon
      // and Tailwind defaults so it doesn't read as "AI generated".
      colors: {
        // Brand: deep, earthy greens
        leaf: {
          50:  '#f3f7f1',
          100: '#e3ecdf',
          200: '#c7d9bf',
          300: '#a3bf96',
          400: '#7ea26d',
          500: '#5d854c',
          600: '#476a39',
          700: '#39542f',
          800: '#2f4328',
          900: '#283823',
          950: '#141e12',
        },
        // Warm earth accent (soil, terracotta)
        soil: {
          50:  '#faf6f1',
          100: '#f1e8d8',
          200: '#e3d0b1',
          300: '#d2b287',
          400: '#c1955f',
          500: '#b07c44',
          600: '#9c6739',
          700: '#7d4f2f',
          800: '#65412b',
          900: '#523628',
        },
        // Warm amber for warnings / harvest accents
        harvest: {
          50:  '#fdf8ed',
          100: '#faedcd',
          200: '#f4d896',
          300: '#edbe5d',
          400: '#e6a432',
          500: '#dc8a14',
          600: '#bf6c0d',
          700: '#98510f',
          800: '#7c4114',
          900: '#673715',
        },
        // Sky (for weather/rain) — muted, professional
        sky: {
          50:  '#f0f7fb',
          100: '#dcebf5',
          200: '#bcd8eb',
          300: '#8ebcda',
          400: '#5e9bc4',
          500: '#4380ae',
          600: '#35698f',
          700: '#2d5572',
          800: '#28475f',
          900: '#243c51',
        },
        // Neutral ink — warm grey, not the default cool slate
        ink: {
          50:  '#f8f7f5',
          100: '#eeece7',
          200: '#dbd8d0',
          300: '#bfbaad',
          400: '#9b9482',
          500: '#7a7364',
          600: '#615b4f',
          700: '#4d483f',
          800: '#3a3630',
          900: '#26241f',
          950: '#181713',
        },
      },
      fontFamily: {
        // Inter for UI, Noto Sans Devanagari for Hindi/Punjabi
        sans: [
          'Inter',
          'Noto Sans Devanagari',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        heading: ['Instrument Serif', 'serif'],
        body: ['Barlow', 'sans-serif'],
        dirtyline: ['Dirtyline', 'sans-serif'],
      },
      fontSize: {
        // Tighter scale, more deliberate sizes
        'display-2xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl':  ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-lg':  ['2.25rem', { lineHeight: '1.2',  letterSpacing: '-0.015em' }],
        'display-md':  ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        // Subtle, layered shadows — not the typical flat drop
        'sm': '0 1px 2px rgba(38, 36, 31, 0.04), 0 1px 1px rgba(38, 36, 31, 0.03)',
        'md': '0 1px 3px rgba(38, 36, 31, 0.05), 0 4px 12px rgba(38, 36, 31, 0.04)',
        'lg': '0 2px 4px rgba(38, 36, 31, 0.04), 0 8px 24px rgba(38, 36, 31, 0.06)',
        'xl': '0 4px 8px rgba(38, 36, 31, 0.05), 0 16px 40px rgba(38, 36, 31, 0.08)',
        // Brand shadow with a hint of green
        'leaf-sm': '0 1px 2px rgba(57, 84, 47, 0.06), 0 1px 1px rgba(57, 84, 47, 0.04)',
        'leaf-md': '0 2px 4px rgba(57, 84, 47, 0.06), 0 6px 16px rgba(57, 84, 47, 0.08)',
        'leaf-lg': '0 4px 8px rgba(57, 84, 47, 0.08), 0 12px 32px rgba(57, 84, 47, 0.10)',
        'inset-border': 'inset 0 0 0 1px rgba(38, 36, 31, 0.08)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        'marquee': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in':    'fade-in 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up':'fade-in-up 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':  'scale-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer':   'shimmer 1.6s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 1.8s ease-in-out infinite',
        'marquee':   'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
}
