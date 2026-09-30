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
    <main className="area-segura-topo px-5 pt-8 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="titulo text-3xl tracking-tight text-texto">{textos.perfil.titulo}</h1>
        <Link
          to="/ajustes"
          aria-label={textos.ajustes.titulo}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-vidro text-texto-secundario transition-transform active:scale-90"
        >
          <IconeAjustes size={19} aria-hidden />
        </Link>
      </div>

      {/* Seletor: os avatares do casal; o exibido fica em destaque */}
      <div className="mt-4 flex items-center gap-4">
        {membros.map((membro, indice) => (
          <Link
            key={membro.id}
            to={membro.id === usuario?.id ? '/perfil' : `/perfil/${membro.id}`}
            className={membro.id === perfilExibido.id ? '' : 'opacity-40'}
          >
            <AvatarPerfil
              nome={membro.nomeExibicao}
              indice={indice}
              caminhoAvatar={membro.urlAvatar}
              tamanho="grande"
            />
          </Link>
        ))}
        <span className="font-titulo text-xl text-texto">{perfilExibido.nomeExibicao}</span>
      </div>

      {/* As 4 estatísticas */}
      {estatisticas && (
        <div className="mt-5 grid grid-cols-4 gap-2 text-center">
          {(
            [
              [estatisticas.filmesAvaliados, textos.perfil.stats.avaliados],
              [estatisticas.notaMedia ?? '—', textos.perfil.stats.media],
              [estatisticas.avaliadosEsteAno, textos.perfil.stats.esteAno],
              [estatisticas.listasCriadas, textos.perfil.stats.listas],
            ] as const
          ).map(([valor, rotulo]) => (
            <div key={rotulo} className="rounded-xl border border-borda bg-superficie p-3">
              <p className="titulo text-xl text-texto">{valor}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-texto-discreto">{rotulo}</p>
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
        <div className="mt-3 grid grid-cols-3 gap-2">
          {avaliacoes.data?.slice(0, 9).map(
            (avaliacao) =>
              avaliacao.filme && (
                <Link key={avaliacao.id} to={`/publicacao/${avaliacao.id}`}>
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
