import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

const base =
  'w-full rounded-campo border border-borda bg-vidro px-4 py-3 text-texto outline-none transition-colors placeholder:text-texto-discreto focus:border-primario focus:ring-2 focus:ring-primario/25'

/**
 * Campo de texto canônico — borda + anel suave na cor de ação ao focar.
 * Com `rotulo`, o rótulo mora DENTRO da moldura (caixa-alta, discreto) e
 * `className` vai para a moldura; o `<label>` envolve o input, então o
 * nome acessível é o próprio rótulo.
 */
export function Campo({
  rotulo,
  className = '',
  ...resto
}: InputHTMLAttributes<HTMLInputElement> & { rotulo?: string }) {
  if (!rotulo) return <input className={`${base} ${className}`} {...resto} />

  return (
    <label
      className={`flex flex-col gap-1 rounded-campo border border-borda bg-vidro px-4 pt-2.5 pb-2 transition-colors focus-within:border-primario focus-within:ring-2 focus-within:ring-primario/25 ${className}`}
    >
      <span className="text-[11px] font-medium tracking-[0.12em] text-texto-discreto uppercase">
        {rotulo}
      </span>
      <input
        className="w-full bg-transparent text-texto outline-none placeholder:text-texto-apagado"
        {...resto}
      />
    </label>
  )
}

/**
 * Área de texto com a mesma pele do Campo. `livre` tira a moldura: o texto
 * fica solto na página (o compositor de publicação).
 */
export function AreaTexto({
  livre = false,
  className = '',
  ...resto
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { livre?: boolean }) {
  const pele = livre
    ? 'w-full bg-transparent text-texto outline-none placeholder:text-texto-discreto'
    : base
  return <textarea className={`${pele} ${className}`} {...resto} />
}
