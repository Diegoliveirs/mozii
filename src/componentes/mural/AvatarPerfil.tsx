/**
 * Avatar simples: a foto (quando houver, Fase 4) ou a inicial do nome.
 * A cor vem do índice da pessoa no casal — cada um tem a sua.
 */
const CORES = ['bg-rosa text-neve', 'bg-estrela text-abismo']

export function AvatarPerfil({
  nome,
  indice,
  tamanho = 'medio',
}: {
  nome: string
  indice: number
  tamanho?: 'pequeno' | 'medio'
}) {
  const dimensao = tamanho === 'pequeno' ? 'h-6 w-6 text-xs' : 'h-9 w-9 text-sm'
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full font-medium ${dimensao} ${
        CORES[indice % CORES.length]
      }`}
    >
      {nome.charAt(0).toUpperCase()}
    </span>
  )
}
