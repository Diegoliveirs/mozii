import { useState } from 'react'
import { useUrlsFotos } from '../../hooks/useMomentos'
import { Esqueleto } from './Esqueleto'
import { Lightbox } from './Lightbox'

/**
 * As fotos de uma publicação ou memória: uma ocupa a largura toda, várias
 * viram grade de duas colunas. Tocar abre o lightbox. Os cliques param
 * aqui — o cartão em volta pode ser clicável (abrir o detalhe).
 */
export function GradeFotos({
  caminhos,
  className = '',
}: {
  caminhos: string[]
  className?: string
}) {
  const urls = useUrlsFotos(caminhos)
  const [fotoAberta, setFotoAberta] = useState<number | null>(null)

  if (caminhos.length === 0) return null

  return (
    <div onClick={(evento) => evento.stopPropagation()} className={className}>
      <div
        className={`grid gap-1 overflow-hidden rounded-cartao ${caminhos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
      >
        {urls.data
          ? urls.data.map((url, indice) => (
              <button key={url} type="button" onClick={() => setFotoAberta(indice)}>
                <img src={url} alt="" className="max-h-80 w-full object-cover" loading="lazy" />
              </button>
            ))
          : caminhos.map((caminho) => <Esqueleto key={caminho} className="h-44 rounded-none" />)}
      </div>

      {fotoAberta !== null && urls.data && (
        <Lightbox
          urls={urls.data}
          indiceInicial={fotoAberta}
          aoFechar={() => setFotoAberta(null)}
        />
      )}
    </div>
  )
}
