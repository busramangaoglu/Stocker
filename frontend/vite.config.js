import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws',
    },
    proxy: {
      // Docker içinde backend servisine container adıyla bağlan
      '/api': { target: 'http://backend:3000', changeOrigin: true },
      '/product-images': { target: 'http://backend:3000', changeOrigin: true },
    },
  },
});
