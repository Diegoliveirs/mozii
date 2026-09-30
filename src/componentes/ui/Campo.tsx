import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

const base =
  'w-full rounded-campo border border-borda bg-vidro px-4 py-3 text-texto outline-none transition-colors placeholder:text-texto-discreto focus:border-primario focus:ring-2 focus:ring-primario/25'

/** Campo de texto canônico — borda + anel suave na cor de ação ao focar. */
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
