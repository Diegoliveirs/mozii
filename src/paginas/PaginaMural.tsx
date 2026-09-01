import { Link } from 'react-router-dom'
import { ConviteNotificacoes } from '../componentes/mural/ConviteNotificacoes'
import { FeedPublicacoes } from '../componentes/mural/FeedPublicacoes'
import { useCasalComMembros } from '../hooks/useCasal'
import { textos } from '../lib/textos'

/** O Mural: cabeçalho do casal + feed infinito compartilhado. */
export function PaginaMural() {
  const casal = useCasalComMembros()
  const membros = casal.data?.membros ?? []

  return (
    <main className="area-segura-topo px-5 pt-8 pb-4">
      <h1 className="font-voz text-3xl font-semibold tracking-tight text-neve">
        {casal.data && membros.length > 0
          ? textos.mural.juntos(membros.map((membro) => membro.nomeExibicao))
          : textos.mural.titulo}
      </h1>
      <p className="mt-1 text-sm text-rosa-suave">{textos.app.slogan}</p>

      {casal.data && membros.length < 2 && (
        <p className="mt-4 rounded-xl border border-linha bg-cartao p-4 text-sm text-nevoa">
          {textos.mural.esperandoPar}
        </p>
      )}

      <ConviteNotificacoes casalCompleto={membros.length === 2} />

      <FeedPublicacoes
        mensagemVazio={textos.mural.vazio}
        descricaoVazio={textos.mural.vazioDica}
        acaoVazio={
          <Link to="/novo" className="rounded-full bg-rosa px-5 py-2 text-sm font-medium text-neve">
            {textos.mural.vazioAcao}
          </Link>
        }
      />
    </main>
  )
}
