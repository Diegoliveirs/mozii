import type { ButtonHTMLAttributes } from 'react'

const variantes = {
  primario: 'bg-rosa font-medium text-neve',
  secundario: 'border border-rosa text-rosa-suave',
  fantasma: 'border border-linha-forte text-nevoa',
  perigo: 'border border-erro/40 bg-erro/15 font-medium text-erro',
} as const

/**
 * Botão canônico do app. Enquanto `carregando`, mostra um spinner e
 * bloqueia toques — o rótulo continua o mesmo, sem "Salvando…".
 */
export function Botao({
  variante = 'primario',
  carregando = false,
  className = '',
  disabled,
  children,
  type = 'button',
  ...resto
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: keyof typeof variantes
  carregando?: boolean
}) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition-transform duration-100 active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100 ${variantes[variante]} ${className}`}
      {...resto}
    >
      {carregando && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  )
}
