/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'ink-navy': '#16213E',
        'bone': '#F1EFEA',
        'verified-green': '#1F7A54',
        'ledger-gold': '#C1902B',
        'slate': '#6B7280',
        'hairline-grey': '#D9D5CB',
        'alert-coral': '#B23A28',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'serif'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
