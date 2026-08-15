/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0C0C09',
        secondary: '#312C85',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        surface: '#F4F4F1',
        text: '#0C0C09',
      },
      fontFamily: {
        sans: ['"Open Sans"', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono: ['Inconsolata', 'monospace'],
      },
    },
  },
  plugins: [],
}
