import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'

/**
 * Casca de todo modal centrado: véu escuro, painel com foco inicial,
 * Esc e toque fora fecham. Conteúdo e largura ficam com quem usa.
 */
export function ModalBase({
  rotulo,
  aoFechar,
  className = '',
  children,
}: {
  rotulo: string
  aoFechar: () => void
  className?: string
  children: ReactNode
}) {
  const painelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    painelRef.current?.focus()
  }, [])

  function aoTeclar(evento: KeyboardEvent) {
    if (evento.key === 'Escape') aoFechar()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-fundo-profundo/85 px-6"
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
        className={`cartao entrada-pop w-full p-5 outline-none ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
