/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './html/**/*.html',
    './js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        bluewings: {
          primary: '#0052CC',
          dark: '#003399',
          light: '#0066FF',
          white: '#FFFFFF',
          gray: '#F5F5F5',
        },
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
