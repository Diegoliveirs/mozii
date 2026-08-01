import { useState, type FormEvent } from 'react'
import type { RefFilme } from '../../dominio/tipos'
import { useAgendarSessao } from '../../hooks/useSessoes'
import { textos } from '../../lib/textos'
import { Poster } from '../filmes/Poster'

/**
 * Agendamento de sessão: data/hora nativa do celular + combinados.
 * Chamado da página do filme, do item da lista e do resultado do sorteio.
 */
export function ModalAgendarSessao({
  filme,
  itemListaId,
  aoFechar,
}: {
  filme: RefFilme
  itemListaId: string | null
  aoFechar: () => void
}) {
  const agendar = useAgendarSessao()
  const [quando, setQuando] = useState('')
  const [observacao, setObservacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  async function aoAgendar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    try {
      await agendar.mutateAsync({
        filme,
        agendadaPara: new Date(quando).toISOString(),
        observacao: observacao.trim() || null,
        itemListaId,
      })
      aoFechar()
    } catch {
      setErro(textos.comuns.erroInesperado)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-abismo/80"
      role="dialog"
      aria-modal="true"
      aria-label={textos.sessao.modalTitulo}
      onClick={aoFechar}
    >
      <form
        onSubmit={aoAgendar}
        className="entrada-folha w-full max-w-md rounded-t-2xl bg-cartao p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 className="font-voz text-xl text-neve">{textos.sessao.modalTitulo}</h2>

        <div className="mt-4 flex items-center gap-3">
          <Poster
            caminho={filme.caminhoPoster}
            titulo={filme.titulo}
            largura={185}
            className="w-12"
          />
          <p className="font-medium text-neve">
            {filme.titulo}
            {filme.anoLancamento && <span className="text-cinza"> ({filme.anoLancamento})</span>}
          </p>
        </div>

        <label className="mt-4 flex flex-col gap-1.5 text-sm text-nevoa">
          {textos.sessao.quandoRotulo}
          <input
            type="datetime-local"
            required
            value={quando}
            onChange={(evento) => setQuando(evento.target.value)}
            className="rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none focus:border-rosa"
          />
        </label>

        <input
          type="text"
          maxLength={280}
          placeholder={textos.sessao.observacaoDica}
          value={observacao}
          onChange={(evento) => setObservacao(evento.target.value)}
          className="mt-3 w-full rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none placeholder:text-cinza focus:border-rosa"
        />

        {erro && <p className="mt-3 text-sm text-rosa-suave">{erro}</p>}

        <button
          type="submit"
          disabled={!quando || agendar.isPending}
          className="mt-4 w-full rounded-xl bg-rosa py-3 font-medium text-neve disabled:opacity-60"
        >
          {agendar.isPending ? textos.sessao.agendando : textos.sessao.agendar}
        </button>
      </form>
    </div>
  )
}
