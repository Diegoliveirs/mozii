import { Link, useParams } from 'react-router-dom'
import { Poster } from '../componentes/filmes/Poster'
import { AvatarPerfil } from '../componentes/mural/AvatarPerfil'
import { EstrelasNota } from '../componentes/mural/EstrelasNota'
import { FeedPublicacoes } from '../componentes/mural/FeedPublicacoes'
import { FavoritosFileira } from '../componentes/perfil/FavoritosFileira'
import { HistogramaNotas } from '../componentes/perfil/HistogramaNotas'
import { useAutenticacao } from '../hooks/useAutenticacao'
import { useCasalComMembros } from '../hooks/useCasal'
import { useAvaliacoesDe, useEstatisticasPerfil } from '../hooks/usePerfilCinefilo'
import { IconeAjustes, IconePegadas } from '../componentes/ui/icones'
import { textos } from '../lib/textos'

/**
 * Perfil estilo Letterboxd — o próprio (/perfil) ou o do par
 * (/perfil/:membroId). O seletor de avatares troca entre os dois.
 */
export function PaginaPerfil() {
  const { membroId } = useParams()
  const { usuario } = useAutenticacao()
  const casal = useCasalComMembros()

  const membros = casal.data?.membros ?? []
  const perfilExibido = membroId
    ? membros.find((membro) => membro.id === membroId)
    : membros.find((membro) => membro.id === usuario?.id)

  const estatisticas = useEstatisticasPerfil(perfilExibido?.id)
  const avaliacoes = useAvaliacoesDe(perfilExibido?.id)
  const souEu = perfilExibido?.id === usuario?.id

  if (!perfilExibido) {
    return <main className="px-5 pt-8 text-texto-discreto">{textos.comuns.carregando}</main>
  }

  return (
    <main className="area-segura-topo relative px-5 pt-8 pb-8">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-afeto/15 blur-3xl"
      />
      <div className="relative flex items-center justify-between">
        {/* Seletor: os dois do casal; o exibido fica aceso */}
        <nav
          aria-label={textos.perfil.titulo}
          className="flex rounded-full border border-vidro-borda bg-vidro p-1"
        >
          {membros.map((membro) => (
            <Link
              key={membro.id}
              to={membro.id === usuario?.id ? '/perfil' : `/perfil/${membro.id}`}
              aria-current={membro.id === perfilExibido.id ? 'page' : undefined}
              className={`rounded-full px-3.5 py-2 text-[13px] ${
                membro.id === perfilExibido.id
                  ? 'bg-primario font-medium text-primario-texto'
                  : 'text-texto-secundario'
              }`}
            >
              {membro.nomeExibicao}
            </Link>
          ))}
        </nav>
        <Link
          to="/ajustes"
          aria-label={textos.ajustes.titulo}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-vidro-borda bg-vidro text-texto transition-transform active:scale-90"
        >
          <IconeAjustes size={19} aria-hidden />
        </Link>
      </div>

      <div className="relative mt-8 flex flex-col items-center text-center">
        <span className="rounded-full ring-2 ring-afeto/60 ring-offset-4 ring-offset-fundo">
          <AvatarPerfil
            nome={perfilExibido.nomeExibicao}
            indice={Math.max(
              0,
              membros.findIndex((membro) => membro.id === perfilExibido.id),
            )}
            caminhoAvatar={perfilExibido.urlAvatar}
            tamanho="grande"
          />
        </span>
        <h1 className="mt-5 titulo text-4xl leading-none tracking-tight text-texto">
          {perfilExibido.nomeExibicao}
        </h1>
      </div>

      {/* As 4 estatísticas */}
      {estatisticas && (
        <div className="mt-8 grid grid-cols-4 divide-x divide-borda border-y border-borda py-4 text-center">
          {(
            [
              [estatisticas.filmesAvaliados, textos.perfil.stats.avaliados],
              [estatisticas.notaMedia ?? '—', textos.perfil.stats.media],
              [estatisticas.avaliadosEsteAno, textos.perfil.stats.esteAno],
              [estatisticas.listasCriadas, textos.perfil.stats.listas],
            ] as const
          ).map(([valor, rotulo]) => (
            <div key={rotulo} className="px-1">
              <p className="titulo text-2xl text-texto">{valor}</p>
              <p className="mt-1 text-[11px] leading-tight text-texto-discreto">{rotulo}</p>
            </div>
          ))}
        </div>
      )}

      <FavoritosFileira perfilId={perfilExibido.id} editavel={souEu} />

      {/* Avaliações recentes */}
      <section className="mt-7">
        <h2 className="rotulo-secao">{textos.perfil.avaliacoesRecentes}</h2>
        {avaliacoes.data?.length === 0 && (
          <p className="mt-2 text-sm text-texto-discreto">{textos.perfil.semAvaliacoes}</p>
        )}
        <div className="-mx-5 mt-3 flex snap-x gap-3.5 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
          {avaliacoes.data?.slice(0, 9).map(
            (avaliacao) =>
              avaliacao.filme && (
                <Link
                  key={avaliacao.id}
                  to={`/publicacao/${avaliacao.id}`}
                  className="w-26 shrink-0 snap-start"
                >
                  <Poster
                    caminho={avaliacao.filme.caminhoPoster}
                    titulo={avaliacao.filme.titulo}
                    largura={185}
                  />
                  {avaliacao.nota !== null && (
                    <div className="mt-1 origin-left scale-75">
                      <EstrelasNota valor={avaliacao.nota} />
                    </div>
                  )}
                </Link>
              ),
          )}
        </div>
      </section>

      {estatisticas && estatisticas.filmesAvaliados > 0 && (
        <HistogramaNotas distribuicao={estatisticas.distribuicaoNotas} />
      )}

      {/* Feed pessoal */}
      <section className="mt-7">
        <h2 className="flex items-center gap-1.5 rotulo-secao">
          <IconePegadas size={14} aria-hidden />
          {souEu ? textos.perfil.pegadas : textos.perfil.pegadasDe(perfilExibido.nomeExibicao)}
        </h2>
        <FeedPublicacoes autorId={perfilExibido.id} mensagemVazio={textos.perfil.semAvaliacoes} />
      </section>
    </main>
  )
}
