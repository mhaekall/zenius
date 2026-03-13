import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // SSG disabled - uncomment when plugin is compatible with Vite 7
    // import { ssgPlugin } from 'vite-plugin-ssg';
    // ssgPlugin({ pages: ['/', '/login', '/register', '/dashboard', '/c/:slug'] })
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'OpenMenu - Katalog Digital UMKM',
        short_name: 'OpenMenu',
        description: 'Bikin Katalog Digital Berbasis QR Code dalam 2 Menit',
        theme_color: '#FAFAF8',
        background_color: '#FAFAF8',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://raw.githubusercontent.com/vitejs/vite/main/docs/images/vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'https://raw.githubusercontent.com/vitejs/vite/main/docs/images/vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
            workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        sourcemap: false,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-storage',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react'],
          ui: ['react-hot-toast', 'jspdf', 'html2canvas'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
