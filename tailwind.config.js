/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FDC800',
        secondary: '#8B7BFF',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        surface: '#0C0C0C',
        text: '#FBFBF9',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'brutal-white': '4px 4px 0px 0px rgba(255, 255, 255, 1)',
        'brutal-primary': '4px 4px 0px 0px rgba(253, 200, 0, 1)',
        'brutal-secondary': '4px 4px 0px 0px rgba(139, 123, 255, 1)',
        'brutal-danger': '4px 4px 0px 0px rgba(239, 68, 68, 1)',
      },
    },
  },
  plugins: [],
}
