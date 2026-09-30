import { urlPoster } from '../../api/tmdb'
import { IconeSessao } from '../ui/icones'

const TAMANHOS = {
  normal: { caixa: 'h-32', capa: 'h-28 w-[4.75rem]', lado: 'top-4' },
  grande: { caixa: 'h-44', capa: 'h-36 w-24', lado: 'top-6' },
} as const

/** Até três capas de uma lista, abertas em leque (a do meio por cima). */
export function CapaEmLeque({
  caminhos,
  tamanho = 'normal',
}: {
  caminhos: string[]
  tamanho?: keyof typeof TAMANHOS
}) {
  const medidas = TAMANHOS[tamanho]
  if (caminhos.length === 0) {
    return (
      <div className={`flex ${medidas.caixa} items-center justify-center rounded-poster bg-vidro`}>
        <IconeSessao size={26} className="text-texto-discreto" aria-hidden />
      </div>
    )
  }

  const [meio, esquerda, direita] = caminhos
  const capa = (caminho: string, posicao: string) => (
    <img
      src={urlPoster(caminho, 185) ?? ''}
      alt=""
      className={`absolute ${medidas.capa} rounded-poster object-cover shadow-poster ${posicao}`}
    />
  )
  return (
    <div aria-hidden className={`relative ${medidas.caixa}`}>
      {esquerda && capa(esquerda, `${medidas.lado} left-0 -rotate-8`)}
      {direita && capa(direita, `${medidas.lado} right-0 rotate-8`)}
      {capa(meio, 'top-0 left-1/2 -translate-x-1/2')}
    </div>
  )
}
