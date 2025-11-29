import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '');

  return {
    plugins: [
      react(),
      svgr(),
      mode === 'analyze' &&
        visualizer({
          open: true,
          filename: 'bundle-analyzer.html',
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),

    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },

    resolve: {
      alias: {
        '@': resolve(rootDir, './src'),
      },
      extensions: [
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.json',
        '.css',
        '.scss',
        '.png',
        '.svg',
        '.jpg',
      ],
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              return 'vendor';
            }
            return undefined;
          },
        },
      },
      chunkSizeWarningLimit: 1600,
    },

    server: {
      port: 5173,
      open: true,
      host: true,
    },

    preview: {
      port: 4173,
      open: true,
    },

    define: {
      'process.env': env,
      __APP_ENV__: JSON.stringify(env.NODE_ENV),
    },
  };
});
