import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET?.trim();

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      ...(apiProxyTarget
        ? {
            proxy: {
              '/api': {
                target: apiProxyTarget,
                changeOrigin: true,
                rewrite: (path: string) => path.replace(/^\/api/, ''),
              },
            },
          }
        : {}),
    },
    build: {
      // Three.js is deferred behind the homepage scene; its core remains one
      // cacheable chunk so repeat visits do not re-download renderer internals.
      chunkSizeWarningLimit: 750,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined;
            }
            if (
              id.includes('/@react-three/postprocessing/') ||
              id.includes('/postprocessing/') ||
              id.includes('/n8ao/')
            ) {
              return 'effects-vendor';
            }
            if (
              id.includes('/@react-three/drei/') ||
              id.includes('/three-stdlib/') ||
              id.includes('/maath/') ||
              id.includes('/troika')
            ) {
              return 'drei-vendor';
            }
            if (id.includes('/@react-three/fiber/')) {
              return 'fiber-vendor';
            }
            if (id.includes('/three/')) {
              return 'three-vendor';
            }
            if (id.includes('/gsap/') || id.includes('/lenis/')) {
              return 'motion-vendor';
            }
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router/') ||
              id.includes('/scheduler/')
            ) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'form-vendor';
            }
            return undefined;
          },
        },
      },
    },
  };
});
