import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const env = loadEnv(mode, process.cwd(), ''); // Changed to process.cwd()

  return {
    base: '/', // Changed from './' for Vercel
    plugins: [react()],
    define: {
      'process.env': {},
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
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
        target: 'es2020',
        define: {
          global: 'globalThis',
        },
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false, // Disable for production
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            pdf: ['pdfjs-dist', 'mammoth'],
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['@google/generative-ai']
          },
          entryFileNames: `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`
        }
      }
    },
    server: {
      historyApiFallback: true,
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:5173',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false
        }
      }
    },
    preview: {
      port: 5173,
      strictPort: true
    },
    css: {
      devSourcemap: mode === 'development',
      modules: {
        localsConvention: 'camelCaseOnly'
      }
    }
  };
});
