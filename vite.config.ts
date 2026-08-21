import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    // Configuration pour développement local
    return {
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
      },
      server: {
        middlewareMode: true,
        allowedHosts: 'all',
        proxy: {
          '/api': 'http://localhost:3000',
          '/socket.io': {
            target: 'ws://localhost:3000',
            ws: true,
          },
        },
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'terser',
      },
    };
  } else {
    // Configuration pour production
    return {
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
      },
      server: {
        middlewareMode: false,
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'terser',
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
            },
          },
        },
      },
    };
  }
});
