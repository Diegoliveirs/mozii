import { IconeVoltar } from '../../../componentes/ui/icones'
import { textos } from '../../../lib/textos'
import type { PropsCabecalhoPagina } from '../../contrato'
import { useVoltar } from '../../comum/useVoltar'

/** Noir: círculo de vidro para voltar, título discreto, fundo translúcido. */
export function CabecalhoPagina({ titulo, fallback, acao }: PropsCabecalhoPagina) {
  const voltar = useVoltar(fallback)

  return (
    <header className="area-segura-topo sticky top-0 z-10 bg-fundo/80 backdrop-blur-vidro">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          aria-label={textos.comuns.voltar}
          onClick={voltar}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-vidro-borda bg-vidro text-texto transition-transform active:scale-90"
        >
          <IconeVoltar size={18} aria-hidden />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-[15px] font-medium text-texto-secundario">
          {titulo}
        </h1>
        {acao}
      </div>
    </header>
  )
}
