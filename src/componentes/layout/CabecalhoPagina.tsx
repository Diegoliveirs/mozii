import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconeVoltar } from '../ui/icones'

/**
 * Cabeçalho das telas INTERNAS: botão voltar + título, fixo no topo e
 * respeitando a área segura do iPhone. Voltar usa o histórico quando
 * existe; num link direto/PWA (sem histórico), vai para a rota-mãe
 * (`fallback`) — o usuário nunca fica preso numa tela.
 */
export function CabecalhoPagina({
  titulo,
  fallback,
  acao,
}: {
  titulo: string
  /** Para onde o voltar leva quando não há histórico (ex.: '/cinema'). */
  fallback: string
  /** Conteúdo opcional alinhado à direita (ex.: engrenagem). */
  acao?: ReactNode
}) {
  const navegar = useNavigate()

  function aoVoltar() {
    // idx > 0 = há uma entrada anterior DESTE app no histórico.
    const indice = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (indice > 0) navegar(-1)
    else navegar(fallback, { replace: true })
  }

  return (
    <header className="area-segura-topo sticky top-0 z-10 bg-noite/95 backdrop-blur">
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          type="button"
          aria-label="Voltar"
          onClick={aoVoltar}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-veu text-neve transition-transform active:scale-90"
        >
          <IconeVoltar size={18} aria-hidden />
        </button>
        <h1 className="min-w-0 flex-1 truncate font-voz text-xl text-neve">{titulo}</h1>
        {acao}
      </div>
    </header>
  )
}
