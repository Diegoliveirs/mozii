import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuscaTmdb } from '../../hooks/useTmdb'
import { textos } from '../../lib/textos'
import { Poster } from '../filmes/Poster'

/** Aba de busca do Cinema: TMDB com debounce, resultado leva à página do filme. */
export function BuscaCinema() {
  const [termo, setTermo] = useState('')
  const busca = useBuscaTmdb(termo)

  return (
    <div>
      <input
        type="search"
        placeholder={textos.cinema.buscarDica}
        value={termo}
        onChange={(evento) => setTermo(evento.target.value)}
        className="w-full rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none placeholder:text-cinza focus:border-rosa"
      />

      {busca.isFetching && <p className="mt-4 text-sm text-cinza">{textos.cinema.buscando}</p>}

      {busca.data?.length === 0 && (
        <p className="mt-4 text-sm text-nevoa">{textos.cinema.semResultados}</p>
      )}

      <ul className="mt-4 space-y-3">
        {busca.data?.map((filme) => (
          <li key={filme.tmdbId}>
            <Link
              to={`/filme/${filme.tmdbId}`}
              className="flex items-center gap-3 rounded-xl bg-cartao p-2.5"
            >
              <Poster
                caminho={filme.caminhoPoster}
                titulo={filme.titulo}
                largura={185}
                className="w-12"
              />
              <span className="text-neve">
                {filme.titulo}
                {filme.anoLancamento && (
                  <span className="text-cinza"> ({filme.anoLancamento})</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
