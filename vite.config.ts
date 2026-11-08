import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A fully static build: relative asset paths so the site works from any
// GitHub Pages project subpath (https://user.github.io/repo/).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, open: false },
  build: { target: 'es2020', outDir: 'dist' },
});
