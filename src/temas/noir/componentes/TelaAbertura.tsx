import { IconeCoracao } from '../../../componentes/ui/icones'
import { textos } from '../../../lib/textos'

/** Noir: o nome em Fraunces fina e um coração rosa respirando. */
export function TelaAbertura() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-fundo">
      <IconeCoracao size={30} weight="fill" className="animate-pulse text-afeto" aria-hidden />
      <p className="titulo text-4xl tracking-tight text-texto">{textos.app.nome}</p>
    </div>
  )
}
