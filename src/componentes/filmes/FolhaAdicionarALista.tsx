import { useState, type FormEvent } from 'react'
import type { RefFilme } from '../../dominio/tipos'
import {
  useAdicionarFilme,
  useCriarLista,
  useListas,
  useListasQueContem,
} from '../../hooks/useListas'
import { textos } from '../../lib/textos'

/**
 * Folha que sobe do rodapé para escolher em qual lista o filme entra.
 * Listas que já contêm o filme aparecem marcadas; dá para criar uma
 * lista nova sem sair daqui.
 */
export function FolhaAdicionarALista({
  filme,
  aoFechar,
}: {
  filme: RefFilme
  aoFechar: () => void
}) {
  const listas = useListas()
  const contem = useListasQueContem(filme.tmdbId)
  const adicionar = useAdicionarFilme()
  const criarLista = useCriarLista()
  const [nomeNova, setNomeNova] = useState('')

  async function aoEscolher(listaId: string) {
    if (contem.data?.includes(listaId)) return
    await adicionar.mutateAsync({ listaId, filme })
  }

  async function aoCriarLista(evento: FormEvent) {
    evento.preventDefault()
    const lista = await criarLista.mutateAsync(nomeNova.trim())
    setNomeNova('')
    await adicionar.mutateAsync({ listaId: lista.id, filme })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-abismo/80"
      role="dialog"
      aria-modal="true"
      aria-label={textos.folhaLista.titulo}
      onClick={aoFechar}
    >
      <div
        className="entrada-folha w-full max-w-md rounded-t-2xl bg-cartao p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 className="font-voz text-xl text-neve">{textos.folhaLista.titulo}</h2>

        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {listas.data?.map((lista) => {
            const jaEsta = contem.data?.includes(lista.id)
            return (
              <li key={lista.id}>
                <button
                  type="button"
                  onClick={() => aoEscolher(lista.id)}
                  disabled={jaEsta || adicionar.isPending}
                  className="flex w-full items-center justify-between rounded-xl bg-veu px-4 py-3 text-left text-neve disabled:opacity-60"
                >
                  {lista.nome}
                  {jaEsta && (
                    <span className="text-sm text-rosa-suave">✓ {textos.folhaLista.jaEsta}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <form onSubmit={aoCriarLista} className="mt-4 flex gap-2">
          <input
            type="text"
            maxLength={60}
            placeholder={textos.cinema.novaListaDica}
            value={nomeNova}
            onChange={(evento) => setNomeNova(evento.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none placeholder:text-cinza focus:border-rosa"
          />
          <button
            type="submit"
            disabled={nomeNova.trim().length === 0 || criarLista.isPending || adicionar.isPending}
            className="rounded-xl bg-rosa px-4 py-3 text-sm font-medium text-neve disabled:opacity-50"
          >
            {textos.cinema.novaListaBotao}
          </button>
        </form>
      </div>
    </div>
  )
}
