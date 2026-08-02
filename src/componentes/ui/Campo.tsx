import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

const base =
  'w-full rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none transition-colors placeholder:text-cinza focus:border-rosa focus:ring-2 focus:ring-rosa/25'

/** Campo de texto canônico — borda rosa + anel suave no foco. */
export function Campo({ className = '', ...resto }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${base} ${className}`} {...resto} />
}

/** Área de texto com a mesma pele do Campo. */
export function AreaTexto({
  className = '',
  ...resto
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${base} ${className}`} {...resto} />
}
