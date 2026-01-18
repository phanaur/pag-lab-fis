import path from "path"
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/pag-lab-fis/',
  build: {
    chunkSizeWarningLimit: 8000, // 8000 kB (suppress warning for chunks up to 8 MB)
  },
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    base: '/pag-lab-fis/',
    scope: '/pag-lab-fis/',

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'Laboratorio de Física',
      short_name: 'lab-fis',
      description: 'Laboratorio virtual de física',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/pag-lab-fis/',
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8 MiB (default is 2 MiB)
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ],
      navigateFallback: '/pag-lab-fis/index.html',
      navigateFallbackDenylist: [/^\/api/],
    },

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})