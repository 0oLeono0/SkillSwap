import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
  plugins: [
    react(),
    svgr(),
    mode === 'analyze' && visualizer({
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
      '@': path.resolve(__dirname, './src'),
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
    // Алиасы можно будет добавить позже
    // alias: {
    //   '@pages': resolve(__dirname, './src/pages'),
    //   '@components': resolve(__dirname, './src/components'),
    //   // ...другие алиасы
    // },
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
        },
      },
    },
    // Disable the large chunk warning
    chunkSizeWarningLimit: 1600,
  },
  
  server: {
    port: 4000,
    open: true,
    host: true,
  },
  
  preview: {
    port: 4000,
    open: true,
  },
  
    // Загрузка переменных окружения
    define: {
      'process.env': env,
      __APP_ENV__: JSON.stringify(env.NODE_ENV),
    },
  };
});
