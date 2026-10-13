import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Raise the chunk size warning threshold slightly
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split large vendor bundles into separate cacheable chunks.
        // Each chunk is fetched once and cached by the browser indefinitely
        // (content-hash filename changes only when the dep itself updates).
        manualChunks: {
          // React core — almost never changes
          'vendor-react':  ['react', 'react-dom'],
          // Router — changes rarely
          'vendor-router': ['react-router-dom'],
          // Data-fetching — changes rarely
          'vendor-query':  ['@tanstack/react-query'],
          // Socket — large, only needed on chat page but hard to lazy-split
          'vendor-socket': ['socket.io-client'],
          // Map — leaflet is 150 KB, only needed on map pages
          'vendor-map':    ['leaflet', 'react-leaflet'],
          // Charts — only needed on admin dashboard
          'vendor-charts': ['recharts'],
          // Icons — medium size, shared across app
          'vendor-icons':  ['lucide-react'],
          // Form + validation
          'vendor-forms':  ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
});
