import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRepositorios } from '../dados/ContextoRepositorios'
import type { RefFilme } from '../dominio/tipos'
import { formatarQuando } from '../lib/datas'
import { chaveFeed } from './useMural'
import { chaveListas } from './useListas'

export const chaveSessoes = ['sessoes'] as const

export function useSessoesAgendadas() {
  const { sessoes } = useRepositorios()
  return useQuery({ queryKey: chaveSessoes, queryFn: () => sessoes.agendadas() })
}

export const chaveSessoesConcluidas = ['sessoes', 'concluidas'] as const

/** As últimas sessões já concluídas — a memória recente do Cinema. */
export function useSessoesConcluidas(limite = 5) {
  const { sessoes } = useRepositorios()
  return useQuery({
    queryKey: [...chaveSessoesConcluidas, limite],
    queryFn: () => sessoes.concluidas(limite),
  })
}

/** Agenda a sessão e publica a atividade "X agendou Y para sábado às 20h". */
export function useAgendarSessao() {
  const { sessoes, mural } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: (dados: {
      filme: RefFilme
      agendadaPara: string
      observacao: string | null
      itemListaId: string | null
    }) => sessoes.agendar(dados),
    onSuccess: async (sessao) => {
      clienteQuery.invalidateQueries({ queryKey: chaveSessoes })

      await mural
        .registrarAtividade({
          acao: 'agendou_sessao',
          tmdbId: sessao.filme.tmdbId,
          tituloFilme: sessao.filme.titulo,
          quando: formatarQuando(sessao.agendadaPara),
        })
        .then(() => clienteQuery.invalidateQueries({ queryKey: chaveFeed }))
        .catch(() => {})
    },
  })
}

export function useReagendarSessao() {
  const { sessoes } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: ({ sessaoId, agendadaPara }: { sessaoId: string; agendadaPara: string }) =>
      sessoes.reagendar(sessaoId, agendadaPara),
    onSuccess: () => clienteQuery.invalidateQueries({ queryKey: chaveSessoes }),
  })
}

export function useCancelarSessao() {
  const { sessoes } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: (sessaoId: string) => sessoes.cancelar(sessaoId),
    onSuccess: () => clienteQuery.invalidateQueries({ queryKey: chaveSessoes }),
  })
}

/** Concluir toca sessão, lista de origem e (via avaliação) o feed. */
export function useConcluirSessao() {
  const { sessoes } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: ({
      sessaoId,
      publicacaoAvaliacaoId,
    }: {
      sessaoId: string
      publicacaoAvaliacaoId: string | null
    }) => sessoes.concluir(sessaoId, publicacaoAvaliacaoId),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: chaveSessoes })
      clienteQuery.invalidateQueries({ queryKey: chaveListas })
      clienteQuery.invalidateQueries({ queryKey: chaveFeed })
    },
  })
}
