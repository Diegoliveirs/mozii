import { Link } from 'react-router-dom'
import type { Perfil, Publicacao, Reacao } from '../../dominio/tipos'
import { tempoAtras } from '../../lib/datas'
import { textos } from '../../lib/textos'
import { Poster } from '../filmes/Poster'
import { GradeFotos } from '../ui/GradeFotos'
import { IconeConfirmado, IconeFilme, IconeSessao } from '../ui/icones'
import { AcoesPublicacao } from './AcoesPublicacao'
import { AvatarPerfil } from './AvatarPerfil'
import { EstrelasNota } from './EstrelasNota'

/** O emoji que representa o like — único valor gravado nas reações. */
export const EMOJI_CURTIDA = '❤️'

/**
 * Uma publicação do Mural, sem caixa: o respiro e os divisores do feed
 * separam uma da outra. Os 4 tipos moram aqui: texto (corpo/foto),
 * avaliação (pôster + estrelas + citação), atividade (pílula compacta) e
 * momento. Tocar abre a visão detalhada.
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
  const autor = membros.find((membro) => membro.id === publicacao.autorId)
  const indiceAutor = Math.max(
    0,
    membros.findIndex((membro) => membro.id === publicacao.autorId),
  )
  const nomeAutor = autor?.nomeExibicao ?? '…'

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
      <div className="flex items-center gap-2 rounded-full bg-vidro px-3.5 py-2.5 text-sm text-texto-secundario">
        <Icone size={16} aria-hidden className="shrink-0 text-texto-discreto" />
        <Link to={`/filme/${meta.tmdbId}`} className="min-w-0 truncate">
          {frase}
        </Link>
        <span className="ml-auto shrink-0 text-xs text-texto-discreto">
          {tempoAtras(publicacao.criadoEm)}
        </span>
      </div>
    )
  }

  const ehAvaliacao = publicacao.tipo === 'avaliacao'

  return (
    <article onClick={aoAbrir} className={aoAbrir ? 'cursor-pointer' : ''}>
      <header className="flex items-center gap-2.5">
        <AvatarPerfil
          nome={nomeAutor}
          indice={indiceAutor}
          caminhoAvatar={autor?.urlAvatar}
          tamanho="pequeno"
        />
        <span className="text-sm font-medium text-texto">{nomeAutor}</span>
        <span className="text-sm text-texto-discreto">· {tempoAtras(publicacao.criadoEm)}</span>
      </header>

      <GradeFotos caminhos={publicacao.caminhosFotos} className="mt-3" />

      {ehAvaliacao && publicacao.filme && (
        <div className="mt-4 flex items-end gap-4">
          <Link
            to={`/filme/${publicacao.filme.tmdbId}`}
            onClick={(evento) => evento.stopPropagation()}
            className="shrink-0"
          >
            <Poster
              caminho={publicacao.filme.caminhoPoster}
              titulo={publicacao.filme.titulo}
              largura={185}
              className="w-24"
            />
          </Link>
          <div className="min-w-0 pb-1">
            <Link
              to={`/filme/${publicacao.filme.tmdbId}`}
              onClick={(evento) => evento.stopPropagation()}
              className="titulo text-2xl leading-tight text-texto"
            >
              {publicacao.filme.titulo}
              {publicacao.filme.anoLancamento && (
                <span className="font-sans text-sm font-normal text-texto-discreto">
                  {' '}
                  ({publicacao.filme.anoLancamento})
                </span>
              )}
            </Link>
            {publicacao.nota !== null && (
              <div className="mt-2">
                <EstrelasNota valor={publicacao.nota} />
              </div>
            )}
          </div>
        </div>
      )}

      {publicacao.corpo &&
        (ehAvaliacao ? (
          <p className="mt-4 border-l border-metal/50 pl-4 font-titulo text-lg leading-relaxed font-light whitespace-pre-wrap text-texto-secundario italic">
            {publicacao.corpo}
          </p>
        ) : (
          <p className="mt-3 font-titulo text-lg leading-relaxed whitespace-pre-wrap text-texto">
            {publicacao.corpo}
          </p>
        ))}

      <div className="mt-3">
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
