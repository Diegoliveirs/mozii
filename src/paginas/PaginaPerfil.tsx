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
    return <main className="px-5 pt-8 text-cinza">{textos.comuns.carregando}</main>
  }

  return (
    <main className="area-segura-topo px-5 pt-8 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="font-voz text-3xl text-neve">{textos.perfil.titulo}</h1>
        <Link to="/ajustes" aria-label={textos.ajustes.titulo} className="text-xl">
          ⚙️
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
        <span className="font-voz text-xl text-neve">{perfilExibido.nomeExibicao}</span>
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
            <div key={rotulo} className="rounded-xl bg-cartao p-3">
              <p className="text-xl font-medium text-neve">{valor}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-cinza">{rotulo}</p>
            </div>
          ))}
        </div>
      )}

      <FavoritosFileira perfilId={perfilExibido.id} editavel={souEu} />

      {/* Avaliações recentes */}
      <section className="mt-6">
        <h2 className="font-medium text-neve">{textos.perfil.avaliacoesRecentes}</h2>
        {avaliacoes.data?.length === 0 && (
          <p className="mt-2 text-sm text-cinza">{textos.perfil.semAvaliacoes}</p>
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
      <section className="mt-6">
        <h2 className="font-medium text-neve">
          {souEu ? textos.perfil.pegadas : textos.perfil.pegadasDe(perfilExibido.nomeExibicao)}
        </h2>
        <FeedPublicacoes autorId={perfilExibido.id} mensagemVazio={textos.perfil.semAvaliacoes} />
      </section>
    </main>
  )
}
