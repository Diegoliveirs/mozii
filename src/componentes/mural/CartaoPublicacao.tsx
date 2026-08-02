import { Link } from 'react-router-dom'
import type { Perfil, Publicacao, Reacao } from '../../dominio/tipos'
import { useUrlFoto } from '../../hooks/useMural'
import { tempoAtras } from '../../lib/datas'
import { textos } from '../../lib/textos'
import { Poster } from '../filmes/Poster'
import { Esqueleto } from '../ui/Esqueleto'
import { IconeConfirmado, IconeFilme, IconeSessao } from '../ui/icones'
import { AcoesPublicacao } from './AcoesPublicacao'
import { AvatarPerfil } from './AvatarPerfil'
import { EstrelasNota } from './EstrelasNota'

/** O emoji que representa o like — único valor gravado nas reações. */
export const EMOJI_CURTIDA = '❤️'

function FotoDaPublicacao({ caminho }: { caminho: string }) {
  const url = useUrlFoto(caminho)
  if (!url.data) return <Esqueleto className="mt-3 h-64 w-full rounded-none" />
  // A foto é o foco: sangra de borda a borda do cartão.
  return <img src={url.data} alt="" className="mt-3 max-h-[420px] w-full object-cover" />
}

/**
 * Um cartão do Mural. Os 4 tipos moram aqui:
 * texto (corpo/foto), avaliação (pôster + estrelas), atividade (linha
 * compacta) e momento. Tocar no cartão abre a visão detalhada.
 */
export function CartaoPublicacao({
  publicacao,
  membros,
  reacoes,
  qtdComentarios,
  meuId,
  aoCurtir,
  aoAbrir,
}: {
  publicacao: Publicacao
  membros: Perfil[]
  reacoes: Reacao[]
  qtdComentarios: number
  meuId: string | undefined
  aoCurtir: () => void
  /** Abre o detalhe; ausente quando o cartão JÁ é o detalhe. */
  aoAbrir?: () => void
}) {
  const indiceAutor = Math.max(
    0,
    membros.findIndex((m) => m.id === publicacao.autorId),
  )
  const nomeAutor = membros.find((m) => m.id === publicacao.autorId)?.nomeExibicao ?? '…'

  const curtidasDeCoracao = reacoes.filter((reacao) => reacao.emoji === EMOJI_CURTIDA)
  const curti = curtidasDeCoracao.some((reacao) => reacao.autorId === meuId)

  // Atividade é uma linha discreta, sem cartão cheio.
  if (publicacao.tipo === 'atividade' && publicacao.metaAtividade) {
    const meta = publicacao.metaAtividade
    const frase =
      meta.acao === 'agendou_sessao'
        ? textos.atividade.agendou(nomeAutor, meta.tituloFilme, meta.quando)
        : meta.acao === 'adicionou_na_lista'
          ? textos.atividade.adicionou(nomeAutor, meta.tituloFilme, meta.nomeLista)
          : textos.atividade.assistiu(nomeAutor, meta.tituloFilme)
    const Icone =
      meta.acao === 'agendou_sessao'
        ? IconeSessao
        : meta.acao === 'adicionou_na_lista'
          ? IconeFilme
          : IconeConfirmado
    return (
      <div className="flex items-center gap-2 px-1 text-sm text-cinza">
        <Icone size={16} aria-hidden className="shrink-0" />
        <Link to={`/filme/${meta.tmdbId}`} className="min-w-0 truncate">
          {frase}
        </Link>
        <span className="ml-auto shrink-0 text-xs">{tempoAtras(publicacao.criadoEm)}</span>
      </div>
    )
  }

  return (
    <article
      onClick={aoAbrir}
      className={`overflow-hidden rounded-2xl border border-linha bg-cartao shadow-cartao ${
        aoAbrir ? 'cursor-pointer' : ''
      }`}
    >
      <header className="flex items-center gap-2 px-4 pt-3.5">
        <AvatarPerfil nome={nomeAutor} indice={indiceAutor} />
        <span className="font-medium text-neve">{nomeAutor}</span>
        <span className="ml-auto text-xs text-cinza">{tempoAtras(publicacao.criadoEm)}</span>
      </header>

      {publicacao.caminhoFoto && <FotoDaPublicacao caminho={publicacao.caminhoFoto} />}

      {publicacao.tipo === 'avaliacao' && publicacao.filme && (
        <div className="mt-3 flex gap-3 px-4">
          <Link
            to={`/filme/${publicacao.filme.tmdbId}`}
            onClick={(evento) => evento.stopPropagation()}
            className="shrink-0"
          >
            <Poster
              caminho={publicacao.filme.caminhoPoster}
              titulo={publicacao.filme.titulo}
              largura={185}
              className="w-16"
            />
          </Link>
          <div className="min-w-0">
            <Link
              to={`/filme/${publicacao.filme.tmdbId}`}
              onClick={(evento) => evento.stopPropagation()}
              className="font-voz text-lg font-semibold text-neve"
            >
              {publicacao.filme.titulo}
              {publicacao.filme.anoLancamento && (
                <span className="font-sans text-sm font-normal text-cinza">
                  {' '}
                  ({publicacao.filme.anoLancamento})
                </span>
              )}
            </Link>
            {publicacao.nota !== null && (
              <div className="mt-1">
                <EstrelasNota valor={publicacao.nota} />
              </div>
            )}
          </div>
        </div>
      )}

      {publicacao.corpo && (
        <p className="mt-2.5 px-4 whitespace-pre-wrap text-nevoa">{publicacao.corpo}</p>
      )}

      <div className="px-4 pt-3 pb-3.5">
        <AcoesPublicacao
          curtidas={curtidasDeCoracao.length}
          curti={curti}
          qtdComentarios={qtdComentarios}
          aoCurtir={aoCurtir}
          aoComentar={aoAbrir}
        />
      </div>
    </article>
  )
}
