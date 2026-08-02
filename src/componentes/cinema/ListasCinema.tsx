import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCriarLista, useListas } from '../../hooks/useListas'
import { urlPoster } from '../../api/tmdb'
import { textos } from '../../lib/textos'
import { Botao } from '../ui/Botao'
import { Campo } from '../ui/Campo'
import { EstadoVazio } from '../ui/EstadoVazio'
import { IconeSessao } from '../ui/icones'

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
        <Campo
          type="text"
          maxLength={60}
          placeholder={textos.cinema.novaListaDica}
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          className="min-w-0 flex-1"
        />
        <Botao
          type="submit"
          carregando={criar.isPending}
          disabled={nome.trim().length === 0}
          className="shrink-0"
        >
          {textos.cinema.novaListaBotao}
        </Botao>
      </form>

      {listas.data?.length === 0 && (
        <div className="mt-5">
          <EstadoVazio
            icone={<IconeSessao size={26} aria-hidden />}
            titulo={textos.cinema.semListas}
          />
        </div>
      )}

      <ul className="mt-4 grid grid-cols-2 gap-3">
        {listas.data?.map((lista) => (
          <li key={lista.id}>
            <Link
              to={`/listas/${lista.id}`}
              className="block rounded-2xl border border-linha bg-cartao p-3 shadow-cartao transition-transform active:scale-[0.98]"
            >
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
                  <IconeSessao size={26} className="text-cinza" aria-hidden />
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
