import type { ButtonHTMLAttributes } from 'react'
import { classesBotao, type VarianteBotao } from './estiloBotao'

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
  variante?: VarianteBotao
  carregando?: boolean
}) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      className={`${classesBotao(variante)} ${className}`}
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
