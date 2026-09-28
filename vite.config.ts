import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * BASE_PATH is injected by the GitHub Pages workflow (e.g. "/Portfolio/").
 * Locally it defaults to the project-page path so `npm run preview` mirrors production.
 */
const base = normalizeBase(process.env.BASE_PATH ?? '/Portfolio/');

function normalizeBase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '/';
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
}

const buildSha = (process.env.GITHUB_SHA ?? 'local').slice(0, 7);

export default defineConfig({
  base,
  plugins: [react()],
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_SHA__: JSON.stringify(buildSha),
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: true,
  },
});
