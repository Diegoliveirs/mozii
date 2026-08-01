import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PWA instalável de verdade (Android e iOS).
    VitePWA({
      // 'prompt': nova versão mostra o aviso (componente AvisoAtualizacao)
      // em vez de trocar sozinha — evita o clássico bug do service worker
      // servindo bundle velho sem ninguém perceber.
      registerType: 'prompt',
      manifest: {
        name: 'Mozii',
        short_name: 'Mozii',
        description: 'O cantinho de filmes do casal',
        lang: 'pt-BR',
        start_url: '/',
        display: 'standalone',
        background_color: '#16131c',
        theme_color: '#16131c',
        icons: [
          { src: '/icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icone-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icone-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Pôsteres do TMDB em CacheFirst: mudam nunca, pesam sempre.
        // Dados do Supabase ficam FORA do SW — cache é papel do TanStack Query.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'posteres-tmdb',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 3600 },
            },
          },
        ],
      },
    }),
  ],
})
