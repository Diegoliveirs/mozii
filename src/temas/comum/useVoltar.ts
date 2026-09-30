import { useNavigate } from 'react-router-dom'

/**
 * Voltar usa o histórico quando existe; num link direto/PWA (sem
 * histórico), vai para a rota-mãe (`fallback`) — ninguém fica preso numa tela.
 */
export function useVoltar(fallback: string) {
  const navegar = useNavigate()

  return function voltar() {
    // idx > 0 = há uma entrada anterior DESTE app no histórico.
    const indice = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (indice > 0) navegar(-1)
    else navegar(fallback, { replace: true })
  }
}
