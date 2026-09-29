import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRepositorios } from '../dados/ContextoRepositorios'
import type { UsuarioAutenticado } from '../dominio/tipos'
import { desinscrever } from '../lib/notificacoes'

/**
 * Sessão atual. `carregando` cobre a primeira leitura — as guardas
 * não redirecionam antes de saber se existe sessão.
 */
export function useAutenticacao() {
  const { autenticacao } = useRepositorios()
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    autenticacao.usuarioAtual().then((atual) => {
      if (!ativo) return
      setUsuario(atual)
      setCarregando(false)
    })

    const cancelar = autenticacao.aoMudarAutenticacao((novo) => {
      if (!ativo) return
      setUsuario(novo)
      setCarregando(false)
    })

    return () => {
      ativo = false
      cancelar()
    }
  }, [autenticacao])

  return { usuario, carregando }
}

export function useEntrar() {
  const { autenticacao } = useRepositorios()
  return useMutation({
    mutationFn: (dados: { email: string; senha: string }) => autenticacao.entrar(dados),
  })
}

export function useCadastrar() {
  const { autenticacao } = useRepositorios()
  return useMutation({
    mutationFn: (dados: { email: string; senha: string; nomeExibicao: string }) =>
      autenticacao.cadastrar(dados),
  })
}

export function useReenviarConfirmacao() {
  const { autenticacao } = useRepositorios()
  return useMutation({
    mutationFn: (email: string) => autenticacao.reenviarConfirmacao(email),
  })
}

export function useConfirmarEmail() {
  const { autenticacao } = useRepositorios()
  return useMutation({ mutationFn: () => autenticacao.confirmarEmail() })
}

// O cache é zerado em main.tsx a cada troca de conta — não aqui, para valer
// também para logout em outra aba ou sessão expirada.
export function useSair() {
  const { autenticacao, notificacoes } = useRepositorios()
  return useMutation({
    mutationFn: async () => {
      // O push é deste aparelho E desta conta: sem desligar antes de sair,
      // quem entrar depois aqui continua recebendo as notificações do casal.
      // Ainda logado, para a RLS deixar apagar a linha. Falha aqui não
      // impede o logout.
      try {
        const endpoint = await desinscrever()
        if (endpoint) await notificacoes.removerInscricao(endpoint)
      } catch {
        // sem push neste aparelho (ou já desligado): segue o logout
      }
      await autenticacao.sair()
    },
  })
}
