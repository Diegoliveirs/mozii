import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCriarLista, useListas } from '../../hooks/useListas'
import { textos } from '../../lib/textos'
import { CapaEmLeque } from '../filmes/CapaEmLeque'
import { Botao } from '../ui/Botao'
import { Campo } from '../ui/Campo'
import { EstadoVazio } from '../ui/EstadoVazio'
import { IconeSessao } from '../ui/icones'

/** Aba de listas do Cinema: vitrine horizontal com capas em leque + criação rápida. */
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
      {listas.data?.length === 0 && (
        <div className="mt-5">
          <EstadoVazio
            icone={<IconeSessao size={26} aria-hidden />}
            titulo={textos.cinema.semListas}
          />
        </div>
      )}

      <ul className="-mx-5 mt-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
        {listas.data?.map((lista) => (
          <li key={lista.id} className="shrink-0 snap-start">
            <Link
              to={`/listas/${lista.id}`}
              className="flex h-64 w-44 flex-col rounded-cartao border border-borda bg-superficie p-4 transition-transform active:scale-[0.98]"
            >
              <CapaEmLeque caminhos={lista.postersCapa} />
              <p className="mt-auto line-clamp-2 titulo text-xl leading-tight text-texto">
                {lista.nome}
              </p>
              <div className="mt-2.5 h-[3px] rounded-full bg-borda-forte">
                <div
                  className="h-full rounded-full bg-afeto"
                  style={{
                    width: `${lista.qtdItens ? (lista.qtdAssistidos / lista.qtdItens) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-texto-discreto">
                {textos.lista.progresso(lista.qtdAssistidos, lista.qtdItens)}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <form onSubmit={aoCriar} className="mt-4 flex gap-2">
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
    </div>
  )
}
