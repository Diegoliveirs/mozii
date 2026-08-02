import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'

/**
 * Base única das folhas que sobem do rodapé. Concentra o que toda folha
 * precisa para parecer app de verdade: alça de arrasto, fechamento por
 * Esc e por toque no véu, trava do scroll do body e foco no painel.
 */
export function FolhaBase({
  rotulo,
  titulo,
  aoFechar,
  children,
}: {
  rotulo: string
  titulo?: string
  aoFechar: () => void
  children: ReactNode
}) {
  const painelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    painelRef.current?.focus()
    return () => {
      document.body.style.overflow = anterior
    }
  }, [])

  function aoTeclar(evento: KeyboardEvent) {
    if (evento.key === 'Escape') aoFechar()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-abismo/80"
      role="dialog"
      aria-modal="true"
      aria-label={rotulo}
      onClick={aoFechar}
      onKeyDown={aoTeclar}
    >
      <div
        ref={painelRef}
        tabIndex={-1}
        onClick={(evento) => evento.stopPropagation()}
        className="entrada-folha max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border-t border-linha bg-cartao p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-cartao outline-none"
      >
        <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-linha-forte" />
        {titulo && <h2 className="font-voz text-xl text-neve">{titulo}</h2>}
        {children}
      </div>
    </div>
  )
}
