import { IconeCoracao } from '../../../componentes/ui/icones'

/** Clássico: o coração pulsando no centro enquanto sessão e casal resolvem. */
export function TelaAbertura() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-fundo">
      <IconeCoracao size={44} weight="fill" className="animate-pulse text-afeto" aria-hidden />
    </div>
  )
}
