import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuscaTmdb } from '../../hooks/useTmdb'
import { textos } from '../../lib/textos'
import { Poster } from '../filmes/Poster'
import { Campo } from '../ui/Campo'
import { Esqueleto } from '../ui/Esqueleto'
import { EstadoVazio } from '../ui/EstadoVazio'
import { IconeAvancar, IconeBusca, IconeFilme } from '../ui/icones'

/** Aba de busca do Cinema: TMDB com debounce, resultado leva à página do filme. */
export function BuscaCinema() {
  const [termo, setTermo] = useState('')
  const busca = useBuscaTmdb(termo)

  return (
    <div>
      <div className="relative">
        <IconeBusca
          size={18}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-texto-discreto"
        />
        <Campo
          type="search"
          placeholder={textos.cinema.buscarDica}
          value={termo}
          onChange={(evento) => setTermo(evento.target.value)}
          className="pl-11"
        />
      </div>

      {busca.isFetching && (
        <div className="mt-4 space-y-3">
          <Esqueleto className="h-16" />
          <Esqueleto className="h-16" />
        </div>
      )}

      {busca.data?.length === 0 && (
        <div className="mt-4">
          <EstadoVazio
            icone={<IconeFilme size={26} aria-hidden />}
            titulo={textos.cinema.semResultados}
          />
        </div>
      )}

      <ul className="mt-2">
        {busca.data?.map((filme) => (
          <li key={filme.tmdbId} className="border-b border-borda last:border-b-0">
            <Link to={`/filme/${filme.tmdbId}`} className="flex items-center gap-3 py-2.5">
              <Poster
                caminho={filme.caminhoPoster}
                titulo={filme.titulo}
                largura={185}
                className="w-11"
              />
              <span className="min-w-0 flex-1 text-texto">
                {filme.titulo}
                {filme.anoLancamento && (
                  <span className="text-texto-discreto"> ({filme.anoLancamento})</span>
                )}
              </span>
              <IconeAvancar size={16} className="shrink-0 text-texto-discreto" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
