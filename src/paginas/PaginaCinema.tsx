import { useSearchParams } from 'react-router-dom'
import { BuscaCinema } from '../componentes/cinema/BuscaCinema'
import { ListasCinema } from '../componentes/cinema/ListasCinema'
import { textos } from '../lib/textos'

/**
 * Hub do Cinema com as abas Buscar e Listas. A aba vive na URL
 * (`?aba=listas`) para o botão voltar e os links profundos funcionarem.
 */
export function PaginaCinema() {
  const [parametros, setParametros] = useSearchParams()
  const aba = parametros.get('aba') === 'listas' ? 'listas' : 'buscar'

  function trocarAba(nova: 'buscar' | 'listas') {
    setParametros(nova === 'buscar' ? {} : { aba: nova }, { replace: true })
  }

  return (
    <main className="area-segura-topo px-5 pt-8">
      <h1 className="font-voz text-3xl text-neve">{textos.cinema.titulo}</h1>

      <div className="mt-4 flex rounded-xl bg-veu p-1" role="tablist">
        {(
          [
            ['buscar', textos.cinema.abaBuscar],
            ['listas', textos.cinema.abaListas],
          ] as const
        ).map(([valor, rotulo]) => (
          <button
            key={valor}
            type="button"
            role="tab"
            aria-selected={aba === valor}
            onClick={() => trocarAba(valor)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              aba === valor ? 'bg-cartao text-neve' : 'text-cinza'
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      <div className="mt-4">{aba === 'buscar' ? <BuscaCinema /> : <ListasCinema />}</div>
    </main>
  )
}
