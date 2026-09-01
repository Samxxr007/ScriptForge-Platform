/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#090a0f',
        card: '#12141c',
        sidebar: '#0d0f17',
        border: '#1e2230',
        muted: '#282d3f',
        accent: {
          DEFAULT: '#38bdf8', // Cyan
          purple: '#818cf8',
          amber: '#fbbf24',
          emerald: '#34d399',
          rose: '#fb7185',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        screenplay: ['Courier Prime', 'Courier New', 'monospace'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
