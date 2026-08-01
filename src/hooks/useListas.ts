import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRepositorios } from '../dados/ContextoRepositorios'
import type { RefFilme } from '../dominio/tipos'

export const chaveListas = ['listas'] as const
const chaveItens = (listaId: string) => ['listas', 'itens', listaId] as const
const chaveContem = (tmdbId: number) => ['listas', 'contem', tmdbId] as const

export function useListas() {
  const { listas } = useRepositorios()
  return useQuery({ queryKey: chaveListas, queryFn: () => listas.listas() })
}

export function useItensLista(listaId: string) {
  const { listas } = useRepositorios()
  return useQuery({ queryKey: chaveItens(listaId), queryFn: () => listas.itensDaLista(listaId) })
}

export function useListasQueContem(tmdbId: number | null) {
  const { listas } = useRepositorios()
  return useQuery({
    queryKey: chaveContem(tmdbId ?? 0),
    queryFn: () => listas.listasQueContem(tmdbId!),
    enabled: tmdbId !== null,
  })
}

export function useCriarLista() {
  const { listas } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: (nome: string) => listas.criarLista(nome),
    onSuccess: () => clienteQuery.invalidateQueries({ queryKey: chaveListas }),
  })
}

export function useExcluirLista() {
  const { listas } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: (listaId: string) => listas.excluirLista(listaId),
    onSuccess: () => clienteQuery.invalidateQueries({ queryKey: chaveListas }),
  })
}

export function useAdicionarFilme() {
  const { listas } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: ({ listaId, filme }: { listaId: string; filme: RefFilme }) =>
      listas.adicionarFilme(listaId, filme),
    onSuccess: (_resultado, { listaId, filme }) => {
      clienteQuery.invalidateQueries({ queryKey: chaveListas })
      clienteQuery.invalidateQueries({ queryKey: chaveItens(listaId) })
      clienteQuery.invalidateQueries({ queryKey: chaveContem(filme.tmdbId) })
    },
  })
}

export function useRemoverItem() {
  const { listas } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId }: { itemId: string; listaId: string }) => listas.removerItem(itemId),
    onSuccess: (_resultado, { listaId }) => {
      clienteQuery.invalidateQueries({ queryKey: chaveListas })
      clienteQuery.invalidateQueries({ queryKey: chaveItens(listaId) })
      clienteQuery.invalidateQueries({ queryKey: ['listas', 'contem'] })
    },
  })
}

export function useMarcarAssistido() {
  const { listas } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, assistido }: { itemId: string; assistido: boolean; listaId: string }) =>
      listas.marcarAssistido(itemId, assistido),
    onSuccess: (_resultado, { listaId }) => {
      clienteQuery.invalidateQueries({ queryKey: chaveListas })
      clienteQuery.invalidateQueries({ queryKey: chaveItens(listaId) })
    },
  })
}
