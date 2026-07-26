import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }
          if (id.includes('react') || id.includes('scheduler')) {
            return 'react-vendor';
          }
          if (id.includes('framer-motion') || id.includes('lucide-react')) {
            return 'ui-vendor';
          }
          if (id.includes('react-hook-form') || id.includes('zod')) {
            return 'form-vendor';
          }
          return 'vendor';
        },
      },
    },
  },
});
