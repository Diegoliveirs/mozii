/// <reference lib="webworker" />
/*
 * Service worker do Mozii (injectManifest). Faz o que o generateSW fazia
 * — precache do app e CacheFirst dos pôsteres — e soma o que ele não
 * sabia fazer: receber push do casal e abrir a rota certa no toque.
 */
import { cleanupOutdatedCaches, precacheAndRoute, type PrecacheEntry } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Em módulo, esta declaração sombreia o `self` do DOM com o tipo do SW.
// A string `self.__WB_MANIFEST` precisa existir literal — é onde o
// vite-plugin-pwa injeta a lista de precache no build.
declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: (string | PrecacheEntry)[] }
const sw = self

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// registerType 'prompt': o SW novo só assume quando o usuário toca em
// "Atualizar" no AvisoAtualizacao (que envia esta mensagem).
sw.addEventListener('message', (evento) => {
  if ((evento.data as { type?: string } | null)?.type === 'SKIP_WAITING') void sw.skipWaiting()
})

// Pôsteres do TMDB em CacheFirst: mudam nunca, pesam sempre.
// Dados do Supabase ficam FORA do SW — cache é papel do TanStack Query.
registerRoute(
  ({ url }) => url.hostname === 'image.tmdb.org',
  new CacheFirst({
    cacheName: 'posteres-tmdb',
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 3600 })],
  }),
)

/** Payload que a Edge Function enviar-push manda. */
interface DadosDoPush {
  titulo?: string
  corpo?: string
  url?: string
}

sw.addEventListener('push', (evento) => {
  if (!evento.data) return
  let dados: DadosDoPush = {}
  try {
    dados = evento.data.json() as DadosDoPush
  } catch {
    dados = { corpo: evento.data.text() }
  }
  evento.waitUntil(
    sw.registration.showNotification(dados.titulo ?? 'Mozii', {
      body: dados.corpo,
      icon: '/icone-192.png',
      badge: '/icone-192.png',
      data: { url: dados.url ?? '/' },
    }),
  )
})

sw.addEventListener('notificationclick', (evento) => {
  evento.notification.close()
  const url = (evento.notification.data as { url?: string } | undefined)?.url ?? '/'
  evento.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (janelas) => {
      const aberta = janelas[0]
      if (aberta) {
        await aberta.navigate(url)
        return aberta.focus()
      }
      return sw.clients.openWindow(url)
    }),
  )
})
