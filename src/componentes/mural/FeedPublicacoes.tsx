import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { CartaoPublicacao, EMOJI_CURTIDA } from './CartaoPublicacao'
import { useAutenticacao } from '../../hooks/useAutenticacao'
import { useCasalComMembros } from '../../hooks/useCasal'
import {
  useAlternarReacao,
  useContagemComentarios,
  useFeedInfinito,
  useReacoesLote,
} from '../../hooks/useMural'
import { textos } from '../../lib/textos'
import { Esqueleto } from '../ui/Esqueleto'
import { EstadoVazio } from '../ui/EstadoVazio'
import { IconeMural } from '../ui/icones'

/**
 * O feed de publicações com curtidas/contagens em lote e paginação.
 * Sem `autorId` é o Mural; com, é o feed pessoal ("Pegadas" do perfil).
 */
export function FeedPublicacoes({
  autorId,
  mensagemVazio,
  descricaoVazio,
  acaoVazio,
}: {
  autorId?: string
  mensagemVazio: string
  descricaoVazio?: string
  acaoVazio?: ReactNode
}) {
  const navegar = useNavigate()
  const { usuario } = useAutenticacao()
  const casal = useCasalComMembros()
  const feed = useFeedInfinito(autorId)

  const publicacoes = feed.data?.pages.flatMap((pagina) => pagina.itens) ?? []
  const ids = publicacoes.map((publicacao) => publicacao.id)
  const reacoes = useReacoesLote(ids)
  const contagens = useContagemComentarios(ids)
  const reagir = useAlternarReacao(ids)

  return (
    <>
      {feed.isLoading && (
        <div className="mt-5 space-y-4">
          <Esqueleto className="h-40 rounded-2xl" />
          <Esqueleto className="h-24 rounded-2xl" />
        </div>
      )}

      {feed.isSuccess && publicacoes.length === 0 && (
        <div className="mt-6">
          <EstadoVazio
            icone={<IconeMural size={28} aria-hidden />}
            titulo={mensagemVazio}
            descricao={descricaoVazio}
            acao={acaoVazio}
          />
        </div>
      )}

      <div className="mt-5 space-y-4">
        {publicacoes.map((publicacao) => (
          <CartaoPublicacao
            key={publicacao.id}
            publicacao={publicacao}
            membros={casal.data?.membros ?? []}
            meuId={usuario?.id}
            reacoes={reacoes.data?.filter((reacao) => reacao.publicacaoId === publicacao.id) ?? []}
            qtdComentarios={contagens.data?.[publicacao.id] ?? 0}
            aoCurtir={() => reagir.mutate({ publicacaoId: publicacao.id, emoji: EMOJI_CURTIDA })}
            aoAbrir={() => navegar(`/publicacao/${publicacao.id}`)}
          />
        ))}
      </div>

      {feed.hasNextPage && (
        <button
          type="button"
          onClick={() => feed.fetchNextPage()}
          disabled={feed.isFetchingNextPage}
          className="mt-4 w-full rounded-xl border border-linha-forte py-3 text-sm text-nevoa disabled:opacity-50"
        >
          {feed.isFetchingNextPage ? textos.comuns.carregando : textos.mural.carregarMais}
        </button>
      )}
    </>
  )
}
