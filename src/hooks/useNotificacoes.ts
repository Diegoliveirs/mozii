import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAviso } from '../componentes/ui/Avisos'
import { useRepositorios } from '../dados/ContextoRepositorios'
import type { PreferenciasNotificacao } from '../dados/repositorios'
import { ambiente } from '../lib/ambiente'
import { desinscrever, inscrever, inscricaoAtual } from '../lib/notificacoes'
import { textos } from '../lib/textos'

const chavePreferencias = ['notificacoes', 'preferencias'] as const
const chaveInscricao = ['notificacoes', 'inscricao'] as const

/** O endpoint ativo NESTE aparelho (null = push desligado aqui). */
export function useInscricaoAtual() {
  return useQuery({ queryKey: chaveInscricao, queryFn: inscricaoAtual })
}

export function usePreferencias(habilitado = true) {
  const { notificacoes } = useRepositorios()
  return useQuery({
    queryKey: chavePreferencias,
    queryFn: () => notificacoes.preferencias(),
    enabled: habilitado,
  })
}

export function useSalvarPreferencias() {
  const { notificacoes } = useRepositorios()
  const clienteQuery = useQueryClient()
  const avisar = useAviso()
  return useMutation({
    mutationFn: (parcial: Partial<PreferenciasNotificacao>) =>
      notificacoes.salvarPreferencias(parcial),
    onSettled: () => clienteQuery.invalidateQueries({ queryKey: chavePreferencias }),
    onError: () => avisar(textos.comuns.erroInesperado, 'erro'),
  })
}

/**
 * Liga o push NESTE aparelho. Precisa nascer de um gesto do usuário:
 * pede a permissão nativa, inscreve no push e grava no banco.
 */
export function useAtivarNotificacoes() {
  const { notificacoes } = useRepositorios()
  const clienteQuery = useQueryClient()
  const avisar = useAviso()
  return useMutation({
    mutationFn: async () => {
      if (!ambiente.chavePublicaVapid) throw new Error('sem chave VAPID configurada')
      const permissao = await Notification.requestPermission()
      if (permissao !== 'granted') throw new Error('permissao-negada')
      const dados = await inscrever(ambiente.chavePublicaVapid)
      await notificacoes.salvarInscricao(dados)
    },
    onSuccess: () => avisar(textos.notificacoes.ativadas),
    onError: (erro) => {
      // Negar não é erro do app: a seção de permissões explica o caminho.
      if (erro.message !== 'permissao-negada') avisar(textos.comuns.erroInesperado, 'erro')
    },
    onSettled: () => clienteQuery.invalidateQueries({ queryKey: chaveInscricao }),
  })
}

/** Desliga o push neste aparelho (desinscreve e apaga do banco). */
export function useDesativarNotificacoes() {
  const { notificacoes } = useRepositorios()
  const clienteQuery = useQueryClient()
  const avisar = useAviso()
  return useMutation({
    mutationFn: async () => {
      const endpoint = await desinscrever()
      if (endpoint) await notificacoes.removerInscricao(endpoint)
    },
    onSuccess: () => avisar(textos.notificacoes.desativadas),
    onError: () => avisar(textos.comuns.erroInesperado, 'erro'),
    onSettled: () => clienteQuery.invalidateQueries({ queryKey: chaveInscricao }),
  })
}
