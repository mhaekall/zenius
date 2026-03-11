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
      disable: false,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'OpenMenu Digital Catalog',
        short_name: 'OpenMenu',
        description: 'SaaS Katalog Digital QR Code untuk UMKM',
        theme_color: '#ffffff',
        background_color: '#ffffff',
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
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
    },
    minify: false
  }
});
