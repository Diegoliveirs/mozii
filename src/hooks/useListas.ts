import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAviso } from '../componentes/ui/Avisos'
import { useRepositorios } from '../dados/ContextoRepositorios'
import type { RefFilme } from '../dominio/tipos'
import { textos } from '../lib/textos'
import { chaveFeed } from './useMural'

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
  const { listas, mural } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: ({ listaId, filme }: { listaId: string; filme: RefFilme; nomeLista: string }) =>
      listas.adicionarFilme(listaId, filme),
    onSuccess: async (_resultado, { listaId, filme, nomeLista }) => {
      clienteQuery.invalidateQueries({ queryKey: chaveListas })
      clienteQuery.invalidateQueries({ queryKey: chaveItens(listaId) })
      clienteQuery.invalidateQueries({ queryKey: chaveContem(filme.tmdbId) })

      // Atividade no Mural ("X adicionou Y à lista Z") — gerada no cliente.
      // Se falhar, a ação principal já valeu: silêncio de propósito.
      await mural
        .registrarAtividade({
          acao: 'adicionou_na_lista',
          tmdbId: filme.tmdbId,
          tituloFilme: filme.titulo,
          listaId,
          nomeLista,
        })
        .then(() => clienteQuery.invalidateQueries({ queryKey: chaveFeed }))
        .catch(() => {})
    },
  })
}

export function useRemoverItem() {
  const { listas } = useRepositorios()
  const clienteQuery = useQueryClient()
  const avisar = useAviso()
  return useMutation({
    mutationFn: ({ itemId }: { itemId: string; listaId: string }) => listas.removerItem(itemId),
    onSuccess: (_resultado, { listaId }) => {
      clienteQuery.invalidateQueries({ queryKey: chaveListas })
      clienteQuery.invalidateQueries({ queryKey: chaveItens(listaId) })
      clienteQuery.invalidateQueries({ queryKey: ['listas', 'contem'] })
    },
    onError: () => avisar(textos.comuns.erroInesperado, 'erro'),
  })
}

export function useMarcarAssistido() {
  const { listas, mural } = useRepositorios()
  const clienteQuery = useQueryClient()
  const avisar = useAviso()
  return useMutation({
    mutationFn: ({
      itemId,
      assistido,
    }: {
      itemId: string
      assistido: boolean
      listaId: string
      filme: RefFilme
      nomeLista: string
    }) => listas.marcarAssistido(itemId, assistido),
    onSuccess: async (_resultado, { listaId, assistido, filme, nomeLista }) => {
      clienteQuery.invalidateQueries({ queryKey: chaveListas })
      clienteQuery.invalidateQueries({ queryKey: chaveItens(listaId) })

      // Só o "assistiu" vira atividade; desmarcar é correção, não notícia.
      if (assistido) {
        await mural
          .registrarAtividade({
            acao: 'marcou_assistido',
            tmdbId: filme.tmdbId,
            tituloFilme: filme.titulo,
            listaId,
            nomeLista,
          })
          .then(() => clienteQuery.invalidateQueries({ queryKey: chaveFeed }))
          .catch(() => {})
      }
    },
    onError: () => avisar(textos.comuns.erroInesperado, 'erro'),
  })
}
