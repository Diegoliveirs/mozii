import { urlPoster } from '../../api/tmdb'
import { IconeFilme } from '../ui/icones'

/** Pôster com fallback: filmes sem imagem ganham um cartão neutro. */
export function Poster({
  caminho,
  titulo,
  largura = 342,
  className = '',
}: {
  caminho: string | null
  titulo: string
  largura?: 185 | 342 | 500
  className?: string
}) {
  const url = urlPoster(caminho, largura)

  if (!url) {
    return (
      <div
        aria-label={titulo}
        className={`flex aspect-[2/3] items-center justify-center rounded-lg bg-veu text-cinza ${className}`}
      >
        <IconeFilme size={22} aria-hidden />
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={titulo}
      loading="lazy"
      className={`aspect-[2/3] rounded-lg object-cover ${className}`}
    />
  )
}
