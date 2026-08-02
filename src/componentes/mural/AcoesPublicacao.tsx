import { useState, type MouseEvent } from 'react'
import { textos } from '../../lib/textos'
import { IconeComentario, IconeCoracao } from '../ui/icones'

/**
 * A linha de ações do cartão, estilo Threads: coração que se pinta com
 * um pulso ao curtir (toggle) e balão que leva à conversa. O emoji
 * livre de antes virou uma única reação — o like de coração.
 */
export function AcoesPublicacao({
  curtidas,
  curti,
  qtdComentarios,
  aoCurtir,
  aoComentar,
}: {
  curtidas: number
  curti: boolean
  qtdComentarios: number
  aoCurtir: () => void
  aoComentar?: () => void
}) {
  const [pulsando, setPulsando] = useState(false)

  function tocarCoracao(evento: MouseEvent) {
    evento.stopPropagation()
    if (!curti) setPulsando(true)
    aoCurtir()
  }

  function tocarBalao(evento: MouseEvent) {
    evento.stopPropagation()
    aoComentar?.()
  }

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        aria-pressed={curti}
        aria-label={curti ? textos.reacoes.descurtir : textos.reacoes.curtir}
        onClick={tocarCoracao}
        className={`flex items-center gap-1.5 text-sm transition-colors ${
          curti ? 'text-rosa' : 'text-cinza'
        }`}
      >
        <span
          className={`inline-flex ${pulsando ? 'pulso-curtida' : ''}`}
          onAnimationEnd={() => setPulsando(false)}
        >
          <IconeCoracao size={22} weight={curti ? 'fill' : 'regular'} aria-hidden />
        </span>
        {curtidas > 0 && curtidas}
      </button>

      <button
        type="button"
        aria-label={textos.reacoes.comentar}
        onClick={tocarBalao}
        className="flex items-center gap-1.5 text-sm text-cinza"
      >
        <IconeComentario size={22} aria-hidden />
        {qtdComentarios > 0 && qtdComentarios}
      </button>
    </div>
  )
}
