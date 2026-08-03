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
      // SW próprio (src/sw.ts): o generateSW não aceita handler de push.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
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
      injectManifest: {
        // woff2 no precache: a Fraunces precisa funcionar offline também.
        // (o CacheFirst dos pôsteres TMDB agora vive em src/sw.ts)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})
