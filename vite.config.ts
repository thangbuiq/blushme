import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['fonts/**/*.woff2'],
      manifest: {
        name: 'Blush',
        short_name: 'Blush',
        description: 'A private, bilingual cycle journal.',
        theme_color: '#FFFBFA',
        background_color: '#FFFBFA',
        display: 'standalone',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
