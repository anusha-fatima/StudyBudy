import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  // Get current directory using import.meta.url
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  
  // Load env variables using the correct root directory
  const env = loadEnv(mode, __dirname, '');

  return {
    base: './',
    plugins: [react()],
    define: {
      'process.env': {},
      'import.meta.env.MODE': JSON.stringify(mode)
    },
    optimizeDeps: {
      include: [
        'react', 
        'react-dom',
        'react-router-dom',
        'pdfjs-dist',
        'mammoth'
      ],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      }
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            pdf: ['pdfjs-dist', 'mammoth'],
            react: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    server: {
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:5173',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    css: {
      devSourcemap: true,
    },
  };
});