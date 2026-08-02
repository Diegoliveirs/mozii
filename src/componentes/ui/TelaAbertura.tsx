import { IconeCoracao } from './icones'

/**
 * Splash mínima exibida enquanto as guardas resolvem sessão e casal —
 * o coração pulsando substitui o flash de tela vazia no boot.
 */
export function TelaAbertura() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-noite">
      <IconeCoracao size={44} weight="fill" className="animate-pulse text-rosa" aria-hidden />
    </div>
  )
}
