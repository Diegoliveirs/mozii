import { createContext, useContext, type ReactNode } from 'react'
import type { Repositorios } from './repositorios'

/**
 * Injeção de dependência dos repositórios. É o ÚNICO Context do app
 * fora do TanStack Query — estado de tela é useState local.
 */
const Contexto = createContext<Repositorios | null>(null)

export function ProvedorRepositorios({
  repositorios,
  children,
}: {
  repositorios: Repositorios
  children: ReactNode
}) {
  return <Contexto.Provider value={repositorios}>{children}</Contexto.Provider>
}

export function useRepositorios(): Repositorios {
  const repositorios = useContext(Contexto)
  if (!repositorios) {
    throw new Error('useRepositorios precisa estar dentro de <ProvedorRepositorios>')
  }
  return repositorios
}
