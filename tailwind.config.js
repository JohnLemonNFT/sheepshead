/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'felt': '#1a5c38',
        'felt-dark': '#0f3d24',
        'felt-light': '#1e6b42',
        'card': '#fffef5',
        'card-dark': '#f5f4eb',
        'wood': '#5c3d2e',
        'wood-dark': '#3d2820',
        'gold': '#fbbf24',
        'gold-dark': '#d97706',
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.15), 0 16px 32px rgba(0, 0, 0, 0.1)',
        'trump': '0 0 0 2px rgba(250, 204, 21, 0.6), 0 0 20px rgba(250, 204, 21, 0.3)',
        'glow-green': '0 0 10px rgba(74, 222, 128, 0.6), 0 0 20px rgba(74, 222, 128, 0.4)',
      },
      animation: {
        'card-deal': 'cardDeal 0.4s ease-out',
        'card-play': 'cardPlay 0.3s ease-out',
        'trick-collect': 'trickCollect 0.5s ease-in forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'trick-winner': 'trickWinner 0.5s ease-out',
      },
      keyframes: {
        trickWinner: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      ringWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
