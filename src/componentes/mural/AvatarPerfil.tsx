import { useUrlFoto } from '../../hooks/useMural'

/**
 * Avatar: a foto de perfil (caminho no bucket, assinado na hora) ou a
 * inicial do nome. A cor vem do índice da pessoa no casal.
 */
const CORES = ['bg-rosa text-neve', 'bg-estrela text-abismo']

export function AvatarPerfil({
  nome,
  indice,
  caminhoAvatar = null,
  tamanho = 'medio',
}: {
  nome: string
  indice: number
  caminhoAvatar?: string | null
  tamanho?: 'pequeno' | 'medio' | 'grande'
}) {
  const url = useUrlFoto(caminhoAvatar)
  const dimensao =
    tamanho === 'pequeno'
      ? 'h-6 w-6 text-xs'
      : tamanho === 'grande'
        ? 'h-16 w-16 text-xl'
        : 'h-9 w-9 text-sm'

  if (caminhoAvatar && url.data) {
    return (
      <img src={url.data} alt={nome} className={`shrink-0 rounded-full object-cover ${dimensao}`} />
    )
  }

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
