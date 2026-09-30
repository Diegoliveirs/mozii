import type { ReactNode } from 'react'
import type { TemaCompleto } from './contrato'
import { ContextoTema } from './contextoTema'

/**
 * Entrega o tema ao app e monta a camada de adereços. A camada é
 * decorativa por construção (aria-hidden, sem toque, sem animação com
 * `prefers-reduced-motion`) — nenhum tema precisa lembrar disso.
 */
export function ProvedorTema({ tema, children }: { tema: TemaCompleto; children: ReactNode }) {
  const { CamadaAderecos } = tema.componentes
  return (
    <ContextoTema.Provider value={tema}>
      {children}
      <div aria-hidden className="camada-aderecos">
        <CamadaAderecos />
      </div>
    </ContextoTema.Provider>
  )
}
