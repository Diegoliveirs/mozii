import { FeedPublicacoes } from '../componentes/mural/FeedPublicacoes'
import { CartaoSessao } from '../componentes/sessoes/CartaoSessao'
import { useCasalComMembros } from '../hooks/useCasal'
import { textos } from '../lib/textos'

/** O Mural: cabeçalho do casal + feed infinito compartilhado. */
export function PaginaMural() {
  const casal = useCasalComMembros()
  const membros = casal.data?.membros ?? []

  return (
    <main className="area-segura-topo px-5 pt-8 pb-4">
      <h1 className="font-voz text-3xl text-neve">{textos.mural.titulo}</h1>
      {casal.data && (
        <p className="mt-1 text-rosa-suave">
          {textos.mural.juntos(membros.map((membro) => membro.nomeExibicao))}
        </p>
      )}
      {casal.data && membros.length < 2 && (
        <p className="mt-4 rounded-xl bg-cartao p-4 text-sm text-nevoa">
          {textos.mural.esperandoPar}
        </p>
      )}

      <CartaoSessao />

      <FeedPublicacoes mensagemVazio={textos.mural.vazio} />
    </main>
  )
}
