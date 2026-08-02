import { useState } from 'react'
import type { RefFilme } from '../../dominio/tipos'
import { useBuscaTmdb } from '../../hooks/useTmdb'
import { textos } from '../../lib/textos'
import { FolhaBase } from '../ui/FolhaBase'
import { IconeBusca } from '../ui/icones'
import { Poster } from './Poster'

/** Folha de busca no TMDB para escolher um filme (usada pelo composer). */
export function FolhaBuscarFilme({
  aoEscolher,
  aoFechar,
}: {
  aoEscolher: (filme: RefFilme) => void
  aoFechar: () => void
}) {
  const [termo, setTermo] = useState('')
  const busca = useBuscaTmdb(termo)

  return (
    <FolhaBase rotulo={textos.cinema.abaBuscar} aoFechar={aoFechar}>
      <div className="relative">
        <IconeBusca
          size={18}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-cinza"
        />
        <input
          type="search"
          autoFocus
          placeholder={textos.cinema.buscarDica}
          value={termo}
          onChange={(evento) => setTermo(evento.target.value)}
          className="w-full rounded-xl border border-linha bg-veu py-3 pr-4 pl-11 text-neve outline-none transition-colors placeholder:text-cinza focus:border-rosa focus:ring-2 focus:ring-rosa/25"
        />
      </div>

      <ul className="mt-3 max-h-[50dvh] space-y-2 overflow-y-auto">
        {busca.data?.map((filme) => (
          <li key={filme.tmdbId}>
            <button
              type="button"
              onClick={() =>
                aoEscolher({
                  tmdbId: filme.tmdbId,
                  titulo: filme.titulo,
                  caminhoPoster: filme.caminhoPoster,
                  anoLancamento: filme.anoLancamento,
                })
              }
              className="flex w-full items-center gap-3 rounded-xl bg-veu p-2 text-left transition-transform active:scale-[0.98]"
            >
              <Poster
                caminho={filme.caminhoPoster}
                titulo={filme.titulo}
                largura={185}
                className="w-10"
              />
              <span className="text-sm text-neve">
                {filme.titulo}
                {filme.anoLancamento && (
                  <span className="text-cinza"> ({filme.anoLancamento})</span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </FolhaBase>
  )
}
