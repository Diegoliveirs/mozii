import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCriarLista, useListas } from '../../hooks/useListas'
import { urlPoster } from '../../api/tmdb'
import { textos } from '../../lib/textos'

/** Aba de listas do Cinema: grade com capa em mosaico + criação rápida. */
export function ListasCinema() {
  const listas = useListas()
  const criar = useCriarLista()
  const [nome, setNome] = useState('')

  async function aoCriar(evento: FormEvent) {
    evento.preventDefault()
    await criar.mutateAsync(nome.trim())
    setNome('')
  }

  return (
    <div>
      <form onSubmit={aoCriar} className="flex gap-2">
        <input
          type="text"
          maxLength={60}
          placeholder={textos.cinema.novaListaDica}
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none placeholder:text-cinza focus:border-rosa"
        />
        <button
          type="submit"
          disabled={nome.trim().length === 0 || criar.isPending}
          className="rounded-xl bg-rosa px-4 py-3 text-sm font-medium text-neve disabled:opacity-50"
        >
          {textos.cinema.novaListaBotao}
        </button>
      </form>

      {listas.data?.length === 0 && (
        <p className="mt-6 text-center text-sm text-nevoa">{textos.cinema.semListas}</p>
      )}

      <ul className="mt-4 grid grid-cols-2 gap-3">
        {listas.data?.map((lista) => (
          <li key={lista.id}>
            <Link to={`/listas/${lista.id}`} className="block rounded-xl bg-cartao p-3">
              <div className="flex h-24 items-center justify-center gap-1 overflow-hidden rounded-lg bg-veu">
                {lista.postersCapa.length > 0 ? (
                  lista.postersCapa.map((caminho) => (
                    <img
                      key={caminho}
                      src={urlPoster(caminho, 185) ?? ''}
                      alt=""
                      className="h-full w-1/3 rounded object-cover"
                    />
                  ))
                ) : (
                  <span className="text-2xl">🍿</span>
                )}
              </div>
              <p className="mt-2 truncate font-medium text-neve">{lista.nome}</p>
              <p className="text-xs text-cinza">
                {textos.lista.progresso(lista.qtdAssistidos, lista.qtdItens)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
