import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAutenticacao } from '../../hooks/useAutenticacao'
import { useRepositorios } from '../../dados/ContextoRepositorios'
import { TelaAbertura } from '../ui/TelaAbertura'

/**
 * Bloqueia as rotas privadas sem sessão.
 * Efeito colateral proposital: toda entrada autenticada cancela uma
 * exclusão de conta pendente — desistir é automático, basta voltar.
 */
export function ExigirAutenticacao() {
  const { usuario, carregando } = useAutenticacao()
  const { casal } = useRepositorios()

  useEffect(() => {
    if (usuario) {
      casal.cancelarExclusaoConta().catch(() => {
        // Silencioso de propósito: falhar aqui não pode travar a entrada.
      })
    }
  }, [usuario, casal])

  if (carregando) return <TelaAbertura />
  if (!usuario) return <Navigate to="/entrar" replace />
  return <Outlet />
}
