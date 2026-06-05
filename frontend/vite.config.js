import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.png', 'NA.png'],
      manifest: {
        name: 'Pho Bamboo',
        short_name: 'PhoBamboo',
        description: 'Commande & fidélité Pho Bamboo',
        theme_color: '#2d5a27',
        background_color: '#2d5a27',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/, /^\/socket\.io/],
        runtimeCaching: [
          {
            // Menu + config: show last-known data offline, refresh when online.
            urlPattern: ({ url }) => url.pathname === '/api/products' || url.pathname === '/api/config' || url.pathname === '/api/rewards',
            handler: 'NetworkFirst',
            options: { cacheName: 'pb-api', expiration: { maxEntries: 20, maxAgeSeconds: 86400 } },
          },
          {
            // Uploaded dish images.
            urlPattern: ({ url }) => url.pathname.startsWith('/uploads/'),
            handler: 'CacheFirst',
            options: { cacheName: 'pb-images', expiration: { maxEntries: 200, maxAgeSeconds: 2592000 } },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
      '/socket.io': { target: 'http://localhost:4000', ws: true },
    },
  },
});
