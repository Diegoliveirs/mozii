import { IconeVoltar } from '../../../componentes/ui/icones'
import { textos } from '../../../lib/textos'
import type { PropsCabecalhoPagina } from '../../contrato'
import { useVoltar } from '../../comum/useVoltar'

/** Clássico: faixa fixa no topo, botão voltar redondo + título. */
export function CabecalhoPagina({ titulo, fallback, acao }: PropsCabecalhoPagina) {
  const voltar = useVoltar(fallback)

  return (
    <header className="area-segura-topo sticky top-0 z-10 bg-fundo/95 backdrop-blur">
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          type="button"
          aria-label={textos.comuns.voltar}
          onClick={voltar}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-vidro text-texto transition-transform active:scale-90"
        >
          <IconeVoltar size={18} aria-hidden />
        </button>
        <h1 className="min-w-0 flex-1 truncate font-titulo text-xl text-texto">{titulo}</h1>
        {acao}
      </div>
    </header>
  )
}
