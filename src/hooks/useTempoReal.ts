import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRepositorios } from '../dados/ContextoRepositorios'
import { useMeuPerfil } from './useCasal'

/**
 * Tempo real do casal: cada mudança que o par fizer invalida as queries
 * correspondentes — o TanStack Query rebusca e a tela atualiza sozinha.
 * Montado UMA vez, na CascaApp.
 */
const invalidacoesPorTabela: Record<string, string[][]> = {
  publicacoes: [['mural']],
  comentarios: [
    ['mural', 'comentarios'],
    ['mural', 'contagem-comentarios'],
  ],
  reacoes: [['mural', 'reacoes']],
  listas: [['listas']],
  itens_lista: [['listas']],
}

export function useTempoReal() {
  const { mural } = useRepositorios()
  const { data: perfil } = useMeuPerfil()
  const clienteQuery = useQueryClient()
  const casalId = perfil?.casalId

  useEffect(() => {
    if (!casalId) return

    return mural.subscreverAoCasal(casalId, (tabela) => {
      for (const chave of invalidacoesPorTabela[tabela] ?? []) {
        clienteQuery.invalidateQueries({ queryKey: chave })
      }
    })
  }, [casalId, mural, clienteQuery])
}
