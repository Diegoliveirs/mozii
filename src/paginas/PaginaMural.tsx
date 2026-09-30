import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { AvatarPerfil } from '../componentes/mural/AvatarPerfil'
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
  const agora = new Date()

  return (
    <main className="pt-seguro-10 relative px-5 pb-4">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="rotulo-secao">{format(agora, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
          <h1 className="mt-2.5 titulo text-4xl leading-tight tracking-tight text-texto">
            {casal.data && membros.length > 0 ? (
              <>
                {textos.mural.saudacaoDoDia(agora.getHours())} <br />
                <em className="font-light text-afeto">
                  {tema.textos.saudacao(membros.map((membro) => membro.nomeExibicao))}
                </em>
              </>
            ) : (
              textos.mural.titulo
            )}
          </h1>
        </div>
        <div className="mt-1 flex shrink-0 -space-x-3">
          {membros.map((membro, indice) => (
            <span key={membro.id} className="rounded-full ring-2 ring-fundo">
              <AvatarPerfil
                nome={membro.nomeExibicao}
                indice={indice}
                caminhoAvatar={membro.urlAvatar}
              />
            </span>
          ))}
        </div>
      </header>
      <EncaixeAdereco nome="mural-topo" />

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
