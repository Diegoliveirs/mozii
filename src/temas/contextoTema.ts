import { createContext, useContext } from 'react'
import type { TemaCompleto } from './contrato'

export const ContextoTema = createContext<TemaCompleto | null>(null)

/** O tema ativo, já mesclado com a base. */
export function useTema(): TemaCompleto {
  const tema = useContext(ContextoTema)
  if (!tema) throw new Error('useTema fora do ProvedorTema')
  return tema
}
