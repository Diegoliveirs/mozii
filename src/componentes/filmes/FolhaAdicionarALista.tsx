import { useState, type FormEvent } from 'react'
import type { RefFilme } from '../../dominio/tipos'
import {
  useAdicionarFilme,
  useCriarLista,
  useListas,
  useListasQueContem,
} from '../../hooks/useListas'
import { textos } from '../../lib/textos'
import { Botao } from '../ui/Botao'
import { Campo } from '../ui/Campo'
import { FolhaBase } from '../ui/FolhaBase'
import { IconeConfirmado } from '../ui/icones'

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

  async function aoEscolher(listaId: string, nomeLista: string) {
    if (contem.data?.includes(listaId)) return
    await adicionar.mutateAsync({ listaId, filme, nomeLista })
  }

  async function aoCriarLista(evento: FormEvent) {
    evento.preventDefault()
    const lista = await criarLista.mutateAsync(nomeNova.trim())
    setNomeNova('')
    await adicionar.mutateAsync({ listaId: lista.id, filme, nomeLista: lista.nome })
  }

  return (
    <FolhaBase
      rotulo={textos.folhaLista.titulo}
      titulo={textos.folhaLista.titulo}
      aoFechar={aoFechar}
    >
      <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
        {listas.data?.map((lista) => {
          const jaEsta = contem.data?.includes(lista.id)
          return (
            <li key={lista.id}>
              <button
                type="button"
                onClick={() => aoEscolher(lista.id, lista.nome)}
                disabled={jaEsta || adicionar.isPending}
                className="flex w-full items-center justify-between rounded-xl bg-veu px-4 py-3 text-left text-neve transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                {lista.nome}
                {jaEsta && (
                  <span className="flex items-center gap-1 text-sm text-rosa-suave">
                    <IconeConfirmado size={15} weight="fill" aria-hidden />
                    {textos.folhaLista.jaEsta}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <form onSubmit={aoCriarLista} className="mt-4 flex gap-2">
        <Campo
          type="text"
          maxLength={60}
          placeholder={textos.cinema.novaListaDica}
          value={nomeNova}
          onChange={(evento) => setNomeNova(evento.target.value)}
          className="min-w-0 flex-1"
        />
        <Botao
          type="submit"
          carregando={criarLista.isPending || adicionar.isPending}
          disabled={nomeNova.trim().length === 0}
          className="shrink-0"
        >
          {textos.cinema.novaListaBotao}
        </Botao>
      </form>
    </FolhaBase>
  )
}
