import type { PropsCabecalhoPagina } from '../../temas/contrato'
import { useTema } from '../../temas/contextoTema'

/**
 * Cabeçalho das telas INTERNAS (voltar + título). Quem desenha é o tema
 * ativo; as páginas só dizem o título e para onde o voltar leva.
 */
export function CabecalhoPagina(props: PropsCabecalhoPagina) {
  const { CabecalhoPagina: CabecalhoDoTema } = useTema().componentes
  return <CabecalhoDoTema {...props} />
}
