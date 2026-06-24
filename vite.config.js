import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During `vercel dev`, the Vercel CLI serves the /api functions and proxies Vite.
// During plain `vite` dev, /api/* is proxied to the local Vercel dev server if running.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
