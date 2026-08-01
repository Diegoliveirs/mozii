import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRepositorios } from '../dados/ContextoRepositorios'
import type { UsuarioAutenticado } from '../dominio/tipos'

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

export function useSair() {
  const { autenticacao } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: () => autenticacao.sair(),
    // Sessão nova = cache zerado: nada de dados de uma conta vazando na outra.
    onSuccess: () => clienteQuery.clear(),
  })
}
