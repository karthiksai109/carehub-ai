/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: { 50:'#e8f4f6',100:'#c8e6ec',200:'#a3d4de',300:'#7dc2d0',400:'#4dafc2',500:'#1f7a8c',600:'#1b6b7b',700:'#165c6e',800:'#114d5c',900:'#0d3e4a' },
        accent: { 50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',400:'#4ade80',500:'#2f855a',600:'#276e4b',700:'#1e5a3c',800:'#16462e',900:'#0e3220' },
        danger: { 50:'#fff5f5',100:'#fed7d7',200:'#feb2b2',300:'#fc8181',400:'#f56565',500:'#c53030',600:'#b12828',700:'#9b2020',800:'#841919',900:'#6d1212' },
        warning: { 50:'#fffbeb',100:'#fef3c7',200:'#fde68a',300:'#fcd34d',400:'#f59e0b',500:'#b7791f',600:'#a06a1a',700:'#8a5c16',800:'#744d12',900:'#5e3f0e' },
        surface: '#ffffff',
        page: '#f4f7fb',
        border: '#e4ebf3',
        muted: '#5a6b82',
        heading: '#1a202c',
      },
    },
  },
  plugins: [],
}
