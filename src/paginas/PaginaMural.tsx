import { CartaoPublicacao } from '../componentes/mural/CartaoPublicacao'
import { useAutenticacao } from '../hooks/useAutenticacao'
import { useCasalComMembros } from '../hooks/useCasal'
import {
  useAlternarReacao,
  useContagemComentarios,
  useFeedInfinito,
  useReacoesLote,
} from '../hooks/useMural'
import { textos } from '../lib/textos'

/** O Mural: feed infinito do casal, com reações e comentários em cada cartão. */
export function PaginaMural() {
  const { usuario } = useAutenticacao()
  const casal = useCasalComMembros()
  const feed = useFeedInfinito()

  const publicacoes = feed.data?.pages.flatMap((pagina) => pagina.itens) ?? []
  const ids = publicacoes.map((publicacao) => publicacao.id)
  const reacoes = useReacoesLote(ids)
  const contagens = useContagemComentarios(ids)
  const reagir = useAlternarReacao(ids)

  const membros = casal.data?.membros ?? []

  return (
    <main className="px-5 pt-8 pb-4">
      <h1 className="font-voz text-3xl text-neve">{textos.mural.titulo}</h1>
      {casal.data && (
        <p className="mt-1 text-rosa-suave">
          {textos.mural.juntos(membros.map((membro) => membro.nomeExibicao))}
        </p>
      )}
      {casal.data && membros.length < 2 && (
        <p className="mt-4 rounded-xl bg-cartao p-4 text-sm text-nevoa">
          {textos.mural.esperandoPar}
        </p>
      )}

      {feed.isLoading && <p className="mt-6 text-cinza">{textos.comuns.carregando}</p>}

      {feed.isSuccess && publicacoes.length === 0 && (
        <p className="mt-8 text-center text-nevoa">{textos.mural.vazio}</p>
      )}

      <div className="mt-5 space-y-4">
        {publicacoes.map((publicacao) => (
          <CartaoPublicacao
            key={publicacao.id}
            publicacao={publicacao}
            membros={membros}
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
    </main>
  )
}
