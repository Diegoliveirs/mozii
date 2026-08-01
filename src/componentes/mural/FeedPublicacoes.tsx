import { CartaoPublicacao } from './CartaoPublicacao'
import { useAutenticacao } from '../../hooks/useAutenticacao'
import { useCasalComMembros } from '../../hooks/useCasal'
import {
  useAlternarReacao,
  useContagemComentarios,
  useFeedInfinito,
  useReacoesLote,
} from '../../hooks/useMural'
import { textos } from '../../lib/textos'

/**
 * O feed de publicações com reações/contagens em lote e paginação.
 * Sem `autorId` é o Mural; com, é o feed pessoal ("Pegadas" do perfil).
 */
export function FeedPublicacoes({
  autorId,
  mensagemVazio,
}: {
  autorId?: string
  mensagemVazio: string
}) {
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
      {feed.isLoading && <p className="mt-6 text-cinza">{textos.comuns.carregando}</p>}

      {feed.isSuccess && publicacoes.length === 0 && (
        <p className="mt-8 text-center text-nevoa">{mensagemVazio}</p>
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
            aoReagir={(emoji) => reagir.mutate({ publicacaoId: publicacao.id, emoji })}
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
