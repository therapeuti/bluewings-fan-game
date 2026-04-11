import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    cssCodeSplit: true,
  },
  server: {
    port: 5173,
    open: true,
  },
})
