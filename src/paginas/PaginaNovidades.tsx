import { CabecalhoPagina } from '../componentes/layout/CabecalhoPagina'
import { CartaoNota } from '../componentes/novidades/CartaoNota'
import { textos } from '../lib/textos'

/** O histórico das notas de atualização, da mais nova para a mais antiga. */
export function PaginaNovidades() {
  return (
    <main className="pb-4">
      <CabecalhoPagina titulo={textos.novidades.titulo} fallback="/ajustes" />
      <div className="space-y-12 px-5 pt-4">
        {textos.novidades.notas.map((nota) => (
          <CartaoNota key={nota.versao} nota={nota} />
        ))}
      </div>
    </main>
  )
}
