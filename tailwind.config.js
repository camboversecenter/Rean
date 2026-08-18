/** @type {import('tailwindcss').Config} */
export default {
  // Class-based, not media-based: the app defaults to light and only goes dark
  // when the user asks for it, so the system preference must not decide.
  darkMode: 'class',
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './documents/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--c-primary) / <alpha-value>)',
        secondary: 'rgb(var(--c-secondary) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',

        // Semantic tokens. Components use these instead of raw white/gray so a
        // single variable swap in index.css flips the whole app. Literal
        // colours such as text-white are deliberately left alone, because they
        // sit on coloured buttons and must stay white in both themes.
        surface: 'rgb(var(--c-surface) / <alpha-value>)', // cards, panels
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)', // page background
        'surface-3': 'rgb(var(--c-surface-3) / <alpha-value>)', // inputs, chips
        content: 'rgb(var(--c-content) / <alpha-value>)', // headings
        'content-soft': 'rgb(var(--c-content-soft) / <alpha-value>)', // body copy
        'content-muted': 'rgb(var(--c-content-muted) / <alpha-value>)', // secondary
        'content-faint': 'rgb(var(--c-content-faint) / <alpha-value>)', // hints
        line: 'rgb(var(--c-line) / <alpha-value>)', // subtle borders
        'line-strong': 'rgb(var(--c-line-strong) / <alpha-value>)', // visible borders
      },
      fontFamily: {
        sans: ['Kantumruy Pro', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-once': 'pulse 0.5s ease-in-out 1',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
