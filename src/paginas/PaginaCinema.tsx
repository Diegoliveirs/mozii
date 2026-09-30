import { Link, useSearchParams } from 'react-router-dom'
import { BuscaCinema } from '../componentes/cinema/BuscaCinema'
import { ListasCinema } from '../componentes/cinema/ListasCinema'
import { CartaoSessao } from '../componentes/sessoes/CartaoSessao'
import { SessoesPassadas } from '../componentes/sessoes/SessoesPassadas'
import { ControleSegmentado } from '../componentes/ui/ControleSegmentado'
import { IconeCalendario } from '../componentes/ui/icones'
import { textos } from '../lib/textos'

/**
 * Hub do Cinema. A próxima sessão vive aqui em destaque (o ingresso),
 * acima das abas; as sessões passadas ficam discretas no fim da aba
 * Listas. A aba vive na URL (`?aba=listas`) para o voltar funcionar.
 */
export function PaginaCinema() {
  const [parametros, setParametros] = useSearchParams()
  const aba = parametros.get('aba') === 'listas' ? 'listas' : 'buscar'

  function trocarAba(nova: 'buscar' | 'listas') {
    setParametros(nova === 'buscar' ? {} : { aba: nova }, { replace: true })
  }

  return (
    <main className="area-segura-topo px-5 pt-10 pb-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="titulo text-4xl leading-none tracking-tight text-texto">
          {textos.cinema.titulo}
        </h1>
        <Link
          to="/cinema/sessoes"
          aria-label={textos.sessao.gestaoAtalho}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-vidro-borda bg-vidro text-texto transition-transform active:scale-95"
        >
          <IconeCalendario size={19} aria-hidden />
        </Link>
      </div>

      <CartaoSessao />

      <div className="mt-8">
        <ControleSegmentado
          opcoes={[
            { valor: 'buscar', rotulo: textos.cinema.abaBuscar },
            { valor: 'listas', rotulo: textos.cinema.abaListas },
          ]}
          valor={aba}
          aoMudar={trocarAba}
        />
      </div>

      <div className="mt-5">{aba === 'buscar' ? <BuscaCinema /> : <ListasCinema />}</div>

      {aba === 'listas' && <SessoesPassadas />}
    </main>
  )
}
