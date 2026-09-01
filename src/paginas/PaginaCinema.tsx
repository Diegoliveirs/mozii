import { Link, useSearchParams } from 'react-router-dom'
import { BuscaCinema } from '../componentes/cinema/BuscaCinema'
import { ListasCinema } from '../componentes/cinema/ListasCinema'
import { CartaoSessao } from '../componentes/sessoes/CartaoSessao'
import { SessoesPassadas } from '../componentes/sessoes/SessoesPassadas'
import { ControleSegmentado } from '../componentes/ui/ControleSegmentado'
import { IconeAvancar, IconeCalendario } from '../componentes/ui/icones'
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
    <main className="area-segura-topo px-5 pt-8 pb-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-voz text-3xl font-semibold tracking-tight text-neve">
          {textos.cinema.titulo}
        </h1>
        <Link
          to="/cinema/sessoes"
          className="flex items-center gap-1.5 rounded-full border border-linha bg-cartao px-3 py-2 text-xs font-medium text-nevoa transition-colors active:border-rosa/50"
        >
          <IconeCalendario size={15} className="text-rosa-suave" aria-hidden />
          {textos.sessao.gestaoAtalho}
          <IconeAvancar size={12} className="text-cinza" aria-hidden />
        </Link>
      </div>

      <CartaoSessao />

      <div className="mt-4">
        <ControleSegmentado
          opcoes={[
            { valor: 'buscar', rotulo: textos.cinema.abaBuscar },
            { valor: 'listas', rotulo: textos.cinema.abaListas },
          ]}
          valor={aba}
          aoMudar={trocarAba}
        />
      </div>

      <div className="mt-4">{aba === 'buscar' ? <BuscaCinema /> : <ListasCinema />}</div>

      {aba === 'listas' && <SessoesPassadas />}
    </main>
  )
}
