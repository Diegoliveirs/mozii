import { Link } from 'react-router-dom'
import type { Perfil, Publicacao, Reacao } from '../../dominio/tipos'
import { useUrlFoto } from '../../hooks/useMural'
import { tempoAtras } from '../../lib/datas'
import { textos } from '../../lib/textos'
import { Poster } from '../filmes/Poster'
import { AvatarPerfil } from './AvatarPerfil'
import { BarraReacoes } from './BarraReacoes'
import { ComentariosInline } from './ComentariosInline'
import { EstrelasNota } from './EstrelasNota'

function FotoDaPublicacao({ caminho }: { caminho: string }) {
  const url = useUrlFoto(caminho)
  if (!url.data) return <div className="mt-2 h-48 animate-pulse rounded-xl bg-veu" />
  return <img src={url.data} alt="" className="mt-2 max-h-96 w-full rounded-xl object-cover" />
}

/**
 * Um cartão do Mural. Os 4 tipos moram aqui:
 * texto (corpo/foto), avaliação (pôster + estrelas), atividade (linha
 * compacta) e momento (Fase 4). Reações/comentários valem para todos.
 */
export function CartaoPublicacao({
  publicacao,
  membros,
  reacoes,
  qtdComentarios,
  meuId,
  aoReagir,
  comentariosAbertos = false,
}: {
  publicacao: Publicacao
  membros: Perfil[]
  reacoes: Reacao[]
  qtdComentarios: number
  meuId: string | undefined
  aoReagir: (emoji: string) => void
  comentariosAbertos?: boolean
}) {
  const indiceAutor = Math.max(
    0,
    membros.findIndex((m) => m.id === publicacao.autorId),
  )
  const nomeAutor = membros.find((m) => m.id === publicacao.autorId)?.nomeExibicao ?? '…'

  // Atividade é uma linha discreta, sem cartão cheio.
  if (publicacao.tipo === 'atividade' && publicacao.metaAtividade) {
    const meta = publicacao.metaAtividade
    const frase =
      meta.acao === 'adicionou_na_lista'
        ? textos.atividade.adicionou(nomeAutor, meta.tituloFilme, meta.nomeLista)
        : textos.atividade.assistiu(nomeAutor, meta.tituloFilme)
    return (
      <div className="flex items-center gap-2 px-1 text-sm text-cinza">
        <span aria-hidden>{meta.acao === 'adicionou_na_lista' ? '🎬' : '✓'}</span>
        <Link to={`/filme/${meta.tmdbId}`} className="min-w-0 truncate">
          {frase}
        </Link>
        <span className="ml-auto shrink-0 text-xs">{tempoAtras(publicacao.criadoEm)}</span>
      </div>
    )
  }

  return (
    <article className="rounded-2xl bg-cartao p-4">
      <header className="flex items-center gap-2">
        <AvatarPerfil nome={nomeAutor} indice={indiceAutor} />
        <span className="font-medium text-neve">{nomeAutor}</span>
        <Link
          to={`/publicacao/${publicacao.id}`}
          className="ml-auto text-xs text-cinza"
          aria-label={textos.publicacao.titulo}
        >
          {tempoAtras(publicacao.criadoEm)}
        </Link>
      </header>

      {publicacao.tipo === 'avaliacao' && publicacao.filme && (
        <div className="mt-3 flex gap-3">
          <Link to={`/filme/${publicacao.filme.tmdbId}`} className="shrink-0">
            <Poster
              caminho={publicacao.filme.caminhoPoster}
              titulo={publicacao.filme.titulo}
              largura={185}
              className="w-16"
            />
          </Link>
          <div className="min-w-0">
            <Link to={`/filme/${publicacao.filme.tmdbId}`} className="font-medium text-neve">
              {publicacao.filme.titulo}
              {publicacao.filme.anoLancamento && (
                <span className="text-cinza"> ({publicacao.filme.anoLancamento})</span>
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
        <p className="mt-2 whitespace-pre-wrap text-nevoa">{publicacao.corpo}</p>
      )}

      {publicacao.caminhoFoto && <FotoDaPublicacao caminho={publicacao.caminhoFoto} />}

      <BarraReacoes reacoes={reacoes} meuId={meuId} aoReagir={aoReagir} />
      <ComentariosInline
        publicacaoId={publicacao.id}
        quantidade={qtdComentarios}
        membros={membros}
        abertoInicial={comentariosAbertos}
      />
    </article>
  )
}
