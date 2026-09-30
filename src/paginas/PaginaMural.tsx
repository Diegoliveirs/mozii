import { Link } from 'react-router-dom'
import { classesBotao } from '../componentes/ui/estiloBotao'
import { ConviteNotificacoes } from '../componentes/mural/ConviteNotificacoes'
import { FeedPublicacoes } from '../componentes/mural/FeedPublicacoes'
import { useCasalComMembros } from '../hooks/useCasal'
import { useTema } from '../temas/contextoTema'
import { EncaixeAdereco } from '../temas/EncaixeAdereco'
import { textos } from '../lib/textos'

/** O Mural: cabeçalho do casal + feed infinito compartilhado. */
export function PaginaMural() {
  const casal = useCasalComMembros()
  const membros = casal.data?.membros ?? []
  const tema = useTema()

  return (
    <main className="area-segura-topo relative px-5 pt-8 pb-4">
      <h1 className="titulo text-3xl tracking-tight text-texto">
        {casal.data && membros.length > 0
          ? tema.textos.saudacao(membros.map((membro) => membro.nomeExibicao))
          : textos.mural.titulo}
      </h1>
      <EncaixeAdereco nome="mural-topo" />
      <p className="mt-1 text-sm text-afeto-claro">{textos.app.slogan}</p>

      {casal.data && membros.length < 2 && (
        <p className="mt-4 rounded-xl border border-borda bg-superficie p-4 text-sm text-texto-secundario">
          {textos.mural.esperandoPar}
        </p>
      )}

      <ConviteNotificacoes casalCompleto={membros.length === 2} />

      <FeedPublicacoes
        mensagemVazio={textos.mural.vazio}
        descricaoVazio={textos.mural.vazioDica}
        acaoVazio={
          <Link to="/novo" className={classesBotao()}>
            {textos.mural.vazioAcao}
          </Link>
        }
      />
    </main>
  )
}
