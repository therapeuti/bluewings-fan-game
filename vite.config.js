import { defineConfig } from 'vite';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'bluewings-fan-game';
const base = process.env.GITHUB_ACTIONS === 'true' ? `/${repositoryName}/` : '/';

export default defineConfig({
  base,
  build: {
    target: 'es2020',
    cssCodeSplit: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});
