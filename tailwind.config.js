/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#13ec37',
        'primary-dark': '#0fb82b',
        'bg-light': '#f6f8f6',
        'bg-dark': '#0d1b10',
        'surface-dark': '#1a2e1d',
        'border-dark': '#2a3d2d',
        'text-sec': '#618968',
      },
      fontFamily: { display: ['Manrope', 'sans-serif'] },
    },
  },
  plugins: [],
}
