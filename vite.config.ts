import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// import { VitePWA } from 'vite-plugin-pwa'; // Deshabilitado temporalmente por error crypto.hash

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA temporalmente deshabilitado para evitar error crypto.hash en Node.js moderno
    // Se puede rehabilitar después del despliegue inicial
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff2,ttf}'],
    //     navigateFallback: '/index.html',
    //     navigateFallbackDenylist: [/^\/(api|server)/],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'mapbox-cache',
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
    //           },
    //         },
    //       },
    //       {
    //         urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'images',
    //           expiration: {
    //             maxEntries: 60,
    //             maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
    //           },
    //         },
    //       }
    //     ]
    //   },
    //   includeAssets: ['favicon.png', 'apple-touch-icon.png', 'favicon.svg'],
    //   manifest: false, // Usar manifest.json estático de public/
    // })
  ],
    // 🏗️ Alias modernos para rutas en React y SCSS
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '/assets': path.resolve(__dirname, './src/assets'),
      '/styles': path.resolve(__dirname, './src/styles'),
    },
  },
  base: '/', // EC2 Single Server - servir desde raíz
  server: {
    host: 'localhost',
    port: 5173,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
  },
  build: {
      outDir: 'dist',
      sourcemap: false,
      emptyOutDir: true,
      cssCodeSplit: true,
      rollupOptions: {
          output: {
            manualChunks: undefined,
          },
      },
  },
});
