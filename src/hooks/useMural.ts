import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRepositorios } from '../dados/ContextoRepositorios'
import type { Comentario, Reacao, RefFilme } from '../dominio/tipos'
import { useAutenticacao } from './useAutenticacao'

export const chaveFeed = ['mural', 'feed'] as const
export const chaveComentarios = (publicacaoId: string) =>
  ['mural', 'comentarios', publicacaoId] as const
export const chaveReacoes = (ids: string[]) => ['mural', 'reacoes', ids] as const

export function useFeedInfinito() {
  const { mural } = useRepositorios()
  return useInfiniteQuery({
    queryKey: chaveFeed,
    queryFn: ({ pageParam }) => mural.feed(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (ultima) => ultima.proximoCursor,
  })
}

export function usePublicacao(id: string) {
  const { mural } = useRepositorios()
  return useQuery({
    queryKey: ['mural', 'publicacao', id],
    queryFn: () => mural.publicacao(id),
  })
}

export function useCriarTexto() {
  const { mural } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: (dados: { corpo: string | null; caminhoFoto: string | null }) =>
      mural.criarTexto(dados),
    onSuccess: () => clienteQuery.invalidateQueries({ queryKey: chaveFeed }),
  })
}

export function useCriarAvaliacao() {
  const { mural } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: (dados: { filme: RefFilme; nota: number; corpo: string | null }) =>
      mural.criarAvaliacao(dados),
    onSuccess: () => clienteQuery.invalidateQueries({ queryKey: chaveFeed }),
  })
}

export function useEditarAvaliacao() {
  const { mural } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: ({ id, nota, corpo }: { id: string; nota: number; corpo: string | null }) =>
      mural.editarAvaliacao(id, { nota, corpo }),
    onSuccess: (_r, { id }) => {
      clienteQuery.invalidateQueries({ queryKey: chaveFeed })
      clienteQuery.invalidateQueries({ queryKey: ['mural', 'publicacao', id] })
    },
  })
}

export function useExcluirPublicacao() {
  const { mural } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mural.excluirPublicacao(id),
    onSuccess: () => clienteQuery.invalidateQueries({ queryKey: chaveFeed }),
  })
}

export function useComentarios(publicacaoId: string, habilitado = true) {
  const { mural } = useRepositorios()
  return useQuery({
    queryKey: chaveComentarios(publicacaoId),
    queryFn: () => mural.comentarios(publicacaoId),
    enabled: habilitado,
  })
}

/** Comentário com update otimista: aparece na hora, desfaz se falhar. */
export function useComentar() {
  const { mural } = useRepositorios()
  const { usuario } = useAutenticacao()
  const clienteQuery = useQueryClient()

  return useMutation({
    mutationFn: ({ publicacaoId, corpo }: { publicacaoId: string; corpo: string }) =>
      mural.comentar(publicacaoId, corpo),
    onMutate: async ({ publicacaoId, corpo }) => {
      const chave = chaveComentarios(publicacaoId)
      await clienteQuery.cancelQueries({ queryKey: chave })
      const anteriores = clienteQuery.getQueryData<Comentario[]>(chave)

      clienteQuery.setQueryData<Comentario[]>(chave, (atuais = []) => [
        ...atuais,
        {
          id: `otimista-${Date.now()}`,
          publicacaoId,
          autorId: usuario?.id ?? '',
          corpo,
          criadoEm: new Date().toISOString(),
        },
      ])
      return { anteriores, chave }
    },
    onError: (_erro, _dados, contexto) => {
      if (contexto) clienteQuery.setQueryData(contexto.chave, contexto.anteriores)
    },
    onSettled: (_r, _e, { publicacaoId }) => {
      clienteQuery.invalidateQueries({ queryKey: chaveComentarios(publicacaoId) })
      clienteQuery.invalidateQueries({ queryKey: ['mural', 'contagem-comentarios'] })
    },
  })
}

/** Reações e contagem de comentários da página visível do feed, em lote. */
export function useReacoesLote(publicacaoIds: string[]) {
  const { mural } = useRepositorios()
  return useQuery({
    queryKey: chaveReacoes(publicacaoIds),
    queryFn: () => mural.reacoesDe(publicacaoIds),
    enabled: publicacaoIds.length > 0,
  })
}

export function useContagemComentarios(publicacaoIds: string[]) {
  const { mural } = useRepositorios()
  return useQuery({
    queryKey: ['mural', 'contagem-comentarios', publicacaoIds],
    queryFn: () => mural.contagemComentarios(publicacaoIds),
    enabled: publicacaoIds.length > 0,
  })
}

/** Reação com update otimista sobre o lote em cache. */
export function useAlternarReacao(publicacaoIds: string[]) {
  const { mural } = useRepositorios()
  const { usuario } = useAutenticacao()
  const clienteQuery = useQueryClient()

  return useMutation({
    mutationFn: ({ publicacaoId, emoji }: { publicacaoId: string; emoji: string }) =>
      mural.alternarReacao(publicacaoId, emoji),
    onMutate: async ({ publicacaoId, emoji }) => {
      const chave = chaveReacoes(publicacaoIds)
      await clienteQuery.cancelQueries({ queryKey: chave })
      const anteriores = clienteQuery.getQueryData<Reacao[]>(chave)

      clienteQuery.setQueryData<Reacao[]>(chave, (atuais = []) => {
        const minha = atuais.find(
          (reacao) =>
            reacao.publicacaoId === publicacaoId &&
            reacao.autorId === usuario?.id &&
            reacao.emoji === emoji,
        )
        if (minha) return atuais.filter((reacao) => reacao.id !== minha.id)
        return [
          ...atuais,
          {
            id: `otimista-${Date.now()}`,
            publicacaoId,
            autorId: usuario?.id ?? '',
            emoji,
          },
        ]
      })
      return { anteriores, chave }
    },
    onError: (_erro, _dados, contexto) => {
      if (contexto) clienteQuery.setQueryData(contexto.chave, contexto.anteriores)
    },
    onSettled: () => clienteQuery.invalidateQueries({ queryKey: ['mural', 'reacoes'] }),
  })
}

/** URL assinada de uma foto privada (45 min de frescor; a URL vale 60). */
export function useUrlFoto(caminho: string | null) {
  const { arquivos } = useRepositorios()
  return useQuery({
    queryKey: ['arquivos', 'url', caminho],
    queryFn: () => arquivos.urlFoto(caminho!),
    enabled: !!caminho,
    staleTime: 45 * 60_000,
  })
}
