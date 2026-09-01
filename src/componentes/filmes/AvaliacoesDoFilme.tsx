import { useNavigate } from 'react-router-dom'
import { CartaoPublicacao, EMOJI_CURTIDA } from '../mural/CartaoPublicacao'
import { Esqueleto } from '../ui/Esqueleto'
import { useAutenticacao } from '../../hooks/useAutenticacao'
import { useCasalComMembros } from '../../hooks/useCasal'
import {
  useAlternarReacao,
  useAvaliacoesDoFilme,
  useContagemComentarios,
  useReacoesLote,
} from '../../hooks/useMural'
import { textos } from '../../lib/textos'

/** As avaliações privadas que o casal fez para um filme específico. */
export function AvaliacoesDoFilme({ tmdbId }: { tmdbId: number }) {
  const navegar = useNavigate()
  const { usuario } = useAutenticacao()
  const casal = useCasalComMembros()
  const avaliacoes = useAvaliacoesDoFilme(tmdbId)
  const ids = avaliacoes.data?.map((avaliacao) => avaliacao.id) ?? []
  const reacoes = useReacoesLote(ids)
  const contagens = useContagemComentarios(ids)
  const reagir = useAlternarReacao(ids)

  return (
    <section className="mt-7 pb-8">
      <h2 className="text-xs font-medium tracking-wide text-rosa-suave uppercase">
        {textos.filme.avaliacoes}
      </h2>

      {avaliacoes.isLoading && (
        <div className="mt-3 space-y-3">
          <Esqueleto className="h-32 rounded-2xl" />
        </div>
      )}

      {avaliacoes.isSuccess && avaliacoes.data.length === 0 && (
        <p className="mt-2 text-sm text-cinza">{textos.filme.semAvaliacoes}</p>
      )}

      <div className="mt-3 space-y-4">
        {avaliacoes.data?.map((avaliacao) => (
          <CartaoPublicacao
            key={avaliacao.id}
            publicacao={avaliacao}
            membros={casal.data?.membros ?? []}
            meuId={usuario?.id}
            reacoes={reacoes.data?.filter((reacao) => reacao.publicacaoId === avaliacao.id) ?? []}
            qtdComentarios={contagens.data?.[avaliacao.id] ?? 0}
            aoCurtir={() => reagir.mutate({ publicacaoId: avaliacao.id, emoji: EMOJI_CURTIDA })}
            aoAbrir={() =>
              navegar(`/publicacao/${avaliacao.id}`, { state: { voltarPara: `/filme/${tmdbId}` } })
            }
          />
        ))}
      </div>
    </section>
  )
}
