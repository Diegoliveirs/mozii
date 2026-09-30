import { IconeCoracao } from './icones'

/**
 * Três cartazes inclinados sobre um halo de afeto — a vitrine da porta de
 * entrada (Entrar). Puramente decorativa: só tokens, nenhum dado.
 */
export function ColagemPosteres() {
  return (
    <div aria-hidden className="relative mx-auto h-60 w-full max-w-xs">
      <div className="absolute top-4 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-afeto/20 blur-3xl" />
      <div className="absolute top-12 left-3 h-40 w-28 -rotate-9 rounded-poster bg-afeto/30 shadow-poster" />
      <div className="absolute top-12 right-3 h-40 w-28 rotate-9 rounded-poster bg-metal/25 shadow-poster" />
      <div className="absolute top-2 left-1/2 flex h-48 w-32 -translate-x-1/2 items-center justify-center rounded-poster border border-vidro-borda bg-superficie shadow-poster">
        <IconeCoracao size={36} weight="fill" className="text-afeto" />
      </div>
    </div>
  )
}
