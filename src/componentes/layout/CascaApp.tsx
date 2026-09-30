import { Outlet, useLocation } from 'react-router-dom'
import { useTempoReal } from '../../hooks/useTempoReal'
import { abaNovaPublicacao, abasNavegacao } from '../../temas/comum/abasNavegacao'
import { useTema } from '../../temas/contextoTema'

/**
 * Casca das telas privadas: conteúdo + navegação do tema ativo.
 * A `key` pela rota reativa a animação de entrada a cada troca de página.
 * O canal de tempo real do casal é montado aqui, uma única vez.
 */
export function CascaApp() {
  useTempoReal()
  const { pathname } = useLocation()
  const { BarraNavegacao } = useTema().componentes

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-(--respiro-navegacao)">
      <div key={pathname} className="entrada-pagina">
        <Outlet />
      </div>
      <BarraNavegacao abas={abasNavegacao} abaNova={abaNovaPublicacao} />
    </div>
  )
}
