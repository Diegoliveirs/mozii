/**
 * Web Push no navegador: detecção de suporte, permissão e inscrição.
 * A parte pura (conversão da chave VAPID, decisão de suporte) é testável;
 * a parte com APIs do navegador fica em funções pequenas e isoladas.
 */

export type SuporteDePush = 'suportado' | 'precisa-instalar' | 'indisponivel'

/** Dados da inscrição no formato que o banco guarda. */
export interface DadosInscricao {
  endpoint: string
  p256dh: string
  auth: string
}

/**
 * Decisão pura de suporte, recebendo os fatos do ambiente:
 * iOS só entrega push quando o app está instalado (standalone).
 */
export function decidirSuporte(fatos: {
  temServiceWorker: boolean
  temPushManager: boolean
  temNotification: boolean
  ehIos: boolean
  estaInstalado: boolean
}): SuporteDePush {
  if (fatos.ehIos && !fatos.estaInstalado) return 'precisa-instalar'
  if (!fatos.temServiceWorker || !fatos.temPushManager || !fatos.temNotification)
    return 'indisponivel'
  return 'suportado'
}

/** Chave pública VAPID (base64url) → bytes para o pushManager.subscribe. */
export function chaveVapidParaBytes(chaveBase64Url: string): Uint8Array {
  const preenchida = chaveBase64Url + '='.repeat((4 - (chaveBase64Url.length % 4)) % 4)
  const base64 = preenchida.replace(/-/g, '+').replace(/_/g, '/')
  const crua = atob(base64)
  const bytes = new Uint8Array(crua.length)
  for (let i = 0; i < crua.length; i++) bytes[i] = crua.charCodeAt(i)
  return bytes
}

/** Suporte no ambiente atual (navegador de verdade). */
export function suporteDePush(): SuporteDePush {
  const navegadorIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const instalado =
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
  return decidirSuporte({
    temServiceWorker: 'serviceWorker' in navigator,
    temPushManager: 'PushManager' in window,
    temNotification: 'Notification' in window,
    ehIos: navegadorIos,
    estaInstalado: instalado,
  })
}

export function estadoPermissao(): NotificationPermission {
  return 'Notification' in window ? Notification.permission : 'denied'
}

/**
 * Inscreve este aparelho no push (exige permissão já concedida).
 * Retorna os dados prontos para gravar em `inscricoes_push`.
 */
export async function inscrever(chavePublicaVapid: string): Promise<DadosInscricao> {
  const registro = await navigator.serviceWorker.ready
  const inscricao = await registro.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: chaveVapidParaBytes(chavePublicaVapid) as BufferSource,
  })
  const json = inscricao.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error('inscrição de push veio incompleta')
  }
  return { endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth }
}

/** Desfaz a inscrição deste aparelho; retorna o endpoint removido (ou null). */
export async function desinscrever(): Promise<string | null> {
  const registro = await navigator.serviceWorker.ready
  const inscricao = await registro.pushManager.getSubscription()
  if (!inscricao) return null
  const endpoint = inscricao.endpoint
  await inscricao.unsubscribe()
  return endpoint
}

/** O endpoint da inscrição ativa neste aparelho, se houver. */
export async function inscricaoAtual(): Promise<string | null> {
  if (!('serviceWorker' in navigator)) return null
  const registro = await navigator.serviceWorker.ready
  const inscricao = await registro.pushManager.getSubscription()
  return inscricao?.endpoint ?? null
}
