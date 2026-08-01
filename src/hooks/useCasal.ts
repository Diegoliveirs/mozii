import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useRepositorios } from '../dados/ContextoRepositorios'
import { useAutenticacao } from './useAutenticacao'
import type { Perfil } from '../dominio/tipos'

export const chavePerfil = ['perfil'] as const
export const chaveCasal = ['casal'] as const

/**
 * Grava o vínculo com o casal DIRETO no cache antes de invalidar.
 * Sem isso há uma corrida: a guarda ExigirCasal lê o perfil antigo
 * (casalId nulo) e devolve a pessoa para /parear logo após parear.
 */
function vincularCasalNoCache(clienteQuery: QueryClient, casalId: string) {
  clienteQuery.setQueryData<Perfil | null>(chavePerfil, (antigo) =>
    antigo ? { ...antigo, casalId } : antigo,
  )
  clienteQuery.invalidateQueries({ queryKey: chavePerfil })
  clienteQuery.invalidateQueries({ queryKey: chaveCasal })
}

export function useMeuPerfil() {
  const { casal } = useRepositorios()
  const { usuario } = useAutenticacao()
  return useQuery({
    queryKey: chavePerfil,
    queryFn: () => casal.meuPerfil(),
    enabled: !!usuario,
  })
}

export function useCasalComMembros() {
  const { casal } = useRepositorios()
  const perfil = useMeuPerfil()
  return useQuery({
    queryKey: chaveCasal,
    queryFn: () => casal.casalComMembros(),
    enabled: !!perfil.data?.casalId,
  })
}

export function useCriarCasal() {
  const { casal } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: () => casal.criarCasal(),
    onSuccess: (criado) => vincularCasalNoCache(clienteQuery, criado.id),
  })
}

export function useEntrarNoCasal() {
  const { casal } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: (codigo: string) => casal.entrarNoCasal(codigo),
    onSuccess: (resultado) => {
      // Só atualiza quando realmente entrou (null = código inválido).
      if (resultado) vincularCasalNoCache(clienteQuery, resultado.id)
    },
  })
}

export function useSairDoCasal() {
  const { casal } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: () => casal.sairDoCasal(),
    onSuccess: () => clienteQuery.clear(),
  })
}

export function useAtualizarNomeExibicao() {
  const { casal } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: (nome: string) => casal.atualizarNomeExibicao(nome),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: chavePerfil })
      clienteQuery.invalidateQueries({ queryKey: chaveCasal })
    },
  })
}

export function useSolicitarExclusaoConta() {
  const { casal } = useRepositorios()
  return useMutation({ mutationFn: () => casal.solicitarExclusaoConta() })
}
