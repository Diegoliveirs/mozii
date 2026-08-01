import { Outlet, useLocation } from 'react-router-dom'
import { useTempoReal } from '../../hooks/useTempoReal'
import { BarraNavegacao } from './BarraNavegacao'

/**
 * Casca das telas privadas: conteúdo + navegação inferior fixa.
 * A `key` pela rota reativa a animação de entrada a cada troca de página.
 * O canal de tempo real do casal é montado aqui, uma única vez.
 */
export function CascaApp() {
  useTempoReal()
  const { pathname } = useLocation()

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-20">
      <div key={pathname} className="entrada-pagina">
        <Outlet />
      </div>
      <BarraNavegacao />
    </div>
  )
}
