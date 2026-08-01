import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DialogoConfirmar } from '../componentes/ui/DialogoConfirmar'
import { ModalSorteio } from '../componentes/filmes/ModalSorteio'
import { Poster } from '../componentes/filmes/Poster'
import { ModalAgendarSessao } from '../componentes/sessoes/ModalAgendarSessao'
import type { ItemLista } from '../dominio/tipos'
import { useCasalComMembros } from '../hooks/useCasal'
import {
  useExcluirLista,
  useItensLista,
  useListas,
  useMarcarAssistido,
  useRemoverItem,
} from '../hooks/useListas'
import { textos } from '../lib/textos'

/** Uma lista do casal: itens, marcar assistido e o sorteio "O que ver hoje". */
export function PaginaLista() {
  const { listaId } = useParams()
  const navegar = useNavigate()
  const listas = useListas()
  const itens = useItensLista(listaId!)
  const casal = useCasalComMembros()
  const marcar = useMarcarAssistido()
  const remover = useRemoverItem()
  const excluir = useExcluirLista()
  const [sorteioAberto, setSorteioAberto] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [agendandoItem, setAgendandoItem] = useState<ItemLista | null>(null)

  const lista = listas.data?.find((cada) => cada.id === listaId)
  const naoAssistidos = itens.data?.filter((item) => !item.assistido) ?? []

  function nomeDe(perfilId: string): string {
    return casal.data?.membros.find((membro) => membro.id === perfilId)?.nomeExibicao ?? '…'
  }

  async function aoExcluirLista() {
    await excluir.mutateAsync(listaId!)
    navegar('/cinema?aba=listas', { replace: true })
  }

  return (
    <main className="px-5 pt-8">
      <h1 className="font-voz text-3xl text-neve">{lista?.nome ?? '…'}</h1>
      {lista && (
        <p className="mt-1 text-sm text-cinza">
          {textos.lista.progresso(lista.qtdAssistidos, lista.qtdItens)}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setSorteioAberto(true)}
          disabled={naoAssistidos.length === 0}
          className="flex-1 rounded-xl bg-rosa py-3 font-medium text-neve disabled:opacity-50"
        >
          {textos.sorteio.botao}
        </button>
        <Link
          to="/cinema"
          className="rounded-xl border border-linha-forte px-4 py-3 text-sm text-nevoa"
        >
          {textos.lista.adicionarFilme}
        </Link>
      </div>

      {itens.data?.length === 0 && (
        <p className="mt-6 text-center text-sm text-nevoa">{textos.lista.vazia}</p>
      )}

      {(itens.data?.length ?? 0) > 0 && naoAssistidos.length === 0 && (
        <p className="mt-4 rounded-xl bg-cartao p-3 text-center text-sm text-rosa-suave">
          {textos.sorteio.todosAssistidos}
        </p>
      )}

      <ul className="mt-4 space-y-3 pb-8">
        {itens.data?.map((item) => (
          <li key={item.id} className="flex items-center gap-3 rounded-xl bg-cartao p-2.5">
            <Link to={`/filme/${item.filme.tmdbId}`} className="shrink-0">
              <Poster
                caminho={item.filme.caminhoPoster}
                titulo={item.filme.titulo}
                largura={185}
                className={`w-14 ${item.assistido ? 'opacity-50' : ''}`}
              />
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                to={`/filme/${item.filme.tmdbId}`}
                className={`block truncate ${item.assistido ? 'text-cinza line-through' : 'text-neve'}`}
              >
                {item.filme.titulo}
              </Link>
              <p className="text-xs text-cinza">
                {item.filme.anoLancamento && `${item.filme.anoLancamento} · `}
                {textos.lista.adicionadoPor(nomeDe(item.adicionadoPor))}
              </p>
            </div>

            <button
              type="button"
              aria-label={
                item.assistido ? textos.lista.desmarcarAssistido : textos.lista.marcarAssistido
              }
              onClick={() =>
                marcar.mutate({
                  itemId: item.id,
                  listaId: item.listaId,
                  assistido: !item.assistido,
                  filme: item.filme,
                  nomeLista: lista?.nome ?? '',
                })
              }
              className={`rounded-full px-2.5 py-1 text-lg ${
                item.assistido ? 'bg-rosa/20 text-rosa-suave' : 'bg-veu text-cinza'
              }`}
            >
              ✓
            </button>

            {!item.assistido && (
              <button
                type="button"
                aria-label={`${textos.sessao.modalTitulo}: ${item.filme.titulo}`}
                onClick={() => setAgendandoItem(item)}
                className="text-lg"
              >
                🍿
              </button>
            )}

            <button
              type="button"
              aria-label={textos.lista.removerItem}
              onClick={() => remover.mutate({ itemId: item.id, listaId: item.listaId })}
              className="pr-1 text-cinza"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setConfirmandoExclusao(true)}
        className="mb-8 text-sm text-rosa-suave underline"
      >
        {textos.lista.excluir}
      </button>

      {sorteioAberto && naoAssistidos.length > 0 && (
        <ModalSorteio
          naoAssistidos={naoAssistidos}
          aoFechar={() => setSorteioAberto(false)}
          aoAgendar={(item) => {
            setSorteioAberto(false)
            setAgendandoItem(item)
          }}
        />
      )}

      {agendandoItem && (
        <ModalAgendarSessao
          filme={agendandoItem.filme}
          itemListaId={agendandoItem.id}
          aoFechar={() => setAgendandoItem(null)}
        />
      )}

      <DialogoConfirmar
        aberto={confirmandoExclusao}
        titulo={textos.lista.excluirConfirmar}
        descricao={textos.lista.excluirExplicacao}
        rotuloConfirmar={textos.comuns.confirmar}
        aoConfirmar={aoExcluirLista}
        aoCancelar={() => setConfirmandoExclusao(false)}
      />
    </main>
  )
}
