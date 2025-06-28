import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  // Vercel-optimized environment loading
  const envDir = path.dirname(fileURLToPath(import.meta.url));
  const env = loadEnv(mode, envDir, ['VITE_', 'VERCEL_']); // Include Vercel system vars

  return {
    base: '/', // Critical for Vercel
    plugins: [react()],
    define: {
      // Vercel-ready environment variables
      'import.meta.env': {
        ...Object.fromEntries(
          Object.entries(env).map(([key, val]) => [key, JSON.stringify(val)])
        ),
        // Vercel-specific runtime values
        VERCEL_ENV: JSON.stringify(process.env.VERCEL_ENV || 'development'),
        VERCEL_URL: JSON.stringify(process.env.VERCEL_URL || 'http://localhost:5173')
      }
    },
    optimizeDeps: {
      include: [
        'react', 
        'react-dom',
        'react-router-dom',
        'pdfjs-dist',
        'mammoth',
        '@google/generative-ai'
      ],
      esbuildOptions: {
        target: 'es2020',
        define: {
          global: 'globalThis'
        }
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: process.env.VERCEL_ENV === 'production', // Enable sourcemaps only in production
      chunkSizeWarningLimit: 2000, // Higher limit for Vercel
      rollupOptions: {
        output: {
          manualChunks: {
            pdf: ['pdfjs-dist', 'mammoth'],
            react: ['react', 'react-dom', 'react-router-dom'],
            ai: ['@google/generative-ai']
          },
          // Vercel-optimized asset naming
          entryFileNames: `[name].[hash].js`,
          chunkFileNames: `[name].[hash].js`,
          assetFileNames: `[name].[hash].[ext]`
        }
      }
    },
    server: {
      historyApiFallback: true,
      port: 5173,
      strictPort: true
    },
    preview: {
      port: 5173,
      strictPort: true,
      // Vercel preview-specific settings
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=600'
      }
    },
    css: {
      devSourcemap: mode === 'development',
      modules: {
        localsConvention: 'camelCaseOnly'
      }
    }
  };
});
