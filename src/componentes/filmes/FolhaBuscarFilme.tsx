import { useState } from 'react'
import type { RefFilme } from '../../dominio/tipos'
import { useBuscaTmdb } from '../../hooks/useTmdb'
import { textos } from '../../lib/textos'
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-abismo/80"
      role="dialog"
      aria-modal="true"
      aria-label={textos.cinema.abaBuscar}
      onClick={aoFechar}
    >
      <div
        className="entrada-folha flex max-h-[75dvh] w-full max-w-md flex-col rounded-t-2xl bg-cartao p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        onClick={(evento) => evento.stopPropagation()}
      >
        <input
          type="search"
          autoFocus
          placeholder={textos.cinema.buscarDica}
          value={termo}
          onChange={(evento) => setTermo(evento.target.value)}
          className="w-full rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none placeholder:text-cinza focus:border-rosa"
        />

        <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
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
                className="flex w-full items-center gap-3 rounded-xl bg-veu p-2 text-left"
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
      </div>
    </div>
  )
}
