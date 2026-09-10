import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

// Ruta base de GitHub Pages (https://juandquintero.github.io/interactive-colombia-map/)
const base = '/interactive-colombia-map/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'vite.svg', 'src/assets/Colombia-icon.png'],
      manifest: {
        name: 'Colombia Check & Travel',
        short_name: 'Colombia Travel',
        description: 'Explora los atractivos turísticos de Colombia, registra tus visitas y comparte tu experiencia.',
        lang: 'es',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#10b981',
        background_color: '#f9fafb',
        icons: [
          { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
      injectRegister: 'auto',
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    css: false,
  },
})