import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CabecalhoPagina } from '../componentes/layout/CabecalhoPagina'
import { DialogoConfirmar } from '../componentes/ui/DialogoConfirmar'
import { ModalSorteio } from '../componentes/filmes/ModalSorteio'
import { Poster } from '../componentes/filmes/Poster'
import { ModalAgendarSessao } from '../componentes/sessoes/ModalAgendarSessao'
import { EstadoVazio } from '../componentes/ui/EstadoVazio'
import {
  IconeAvancar,
  IconeConfirmado,
  IconeFechar,
  IconeFilme,
  IconeMais,
  IconeSessao,
  IconeSorteio,
} from '../componentes/ui/icones'
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
  const progresso =
    lista && lista.qtdItens > 0 ? Math.round((lista.qtdAssistidos / lista.qtdItens) * 100) : 0

  function nomeDe(perfilId: string): string {
    return casal.data?.membros.find((membro) => membro.id === perfilId)?.nomeExibicao ?? '…'
  }

  async function aoExcluirLista() {
    await excluir.mutateAsync(listaId!)
    navegar('/cinema?aba=listas', { replace: true })
  }

  return (
    <main>
      <CabecalhoPagina titulo={lista?.nome ?? '…'} fallback="/cinema?aba=listas" />
      <div className="px-5">
        {lista && (
          <div>
            <div className="h-1.5 overflow-hidden rounded-full bg-veu">
              <div className="h-full bg-rosa transition-all" style={{ width: `${progresso}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-cinza">
              {textos.lista.progresso(lista.qtdAssistidos, lista.qtdItens)}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setSorteioAberto(true)}
          disabled={naoAssistidos.length === 0}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-rosa/40 bg-cartao px-4 py-3 text-left shadow-cartao transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          <IconeSorteio size={24} className="shrink-0 text-rosa-suave" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-neve">{textos.sorteio.botao}</span>
          </span>
          <IconeAvancar size={16} className="shrink-0 text-cinza" aria-hidden />
        </button>

        {itens.data?.length === 0 && (
          <div className="mt-5">
            <EstadoVazio
              icone={<IconeFilme size={26} aria-hidden />}
              titulo={textos.lista.vazia}
              acao={
                <Link
                  to="/cinema"
                  className="rounded-full bg-rosa px-5 py-2 text-sm font-medium text-neve"
                >
                  {textos.lista.adicionarFilme}
                </Link>
              }
            />
          </div>
        )}

        {(itens.data?.length ?? 0) > 0 && naoAssistidos.length === 0 && (
          <p className="mt-4 rounded-xl border border-linha bg-cartao p-3 text-center text-sm text-rosa-suave">
            {textos.sorteio.todosAssistidos}
          </p>
        )}

        <ul className="mt-4 pb-4">
          {itens.data?.map((item) => (
            <li
              key={item.id}
              className={`flex items-center gap-3 border-b border-linha py-2.5 last:border-b-0 ${
                item.assistido ? 'opacity-55' : ''
              }`}
            >
              <Link to={`/filme/${item.filme.tmdbId}`} className="shrink-0">
                <Poster
                  caminho={item.filme.caminhoPoster}
                  titulo={item.filme.titulo}
                  largura={185}
                  className="w-11"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  to={`/filme/${item.filme.tmdbId}`}
                  className={`block truncate text-sm font-medium ${
                    item.assistido ? 'text-cinza line-through' : 'text-neve'
                  }`}
                >
                  {item.filme.titulo}
                </Link>
                <p className="text-xs text-cinza">
                  {item.filme.anoLancamento && `${item.filme.anoLancamento} · `}
                  {textos.lista.adicionadoPor(nomeDe(item.adicionadoPor))}
                </p>
              </div>

              {!item.assistido && (
                <button
                  type="button"
                  aria-label={`${textos.sessao.modalTitulo}: ${item.filme.titulo}`}
                  onClick={() => setAgendandoItem(item)}
                  className="p-1 text-rosa-suave transition-transform active:scale-90"
                >
                  <IconeSessao size={20} aria-hidden />
                </button>
              )}

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
                className={`p-1 transition-transform active:scale-90 ${
                  item.assistido ? 'text-sucesso' : 'text-cinza'
                }`}
              >
                <IconeConfirmado
                  size={21}
                  weight={item.assistido ? 'fill' : 'regular'}
                  aria-hidden
                />
              </button>

              <button
                type="button"
                aria-label={textos.lista.removerItem}
                onClick={() => remover.mutate({ itemId: item.id, listaId: item.listaId })}
                className="p-1 text-cinza transition-transform active:scale-90"
              >
                <IconeFechar size={17} aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        <Link
          to="/cinema"
          className="mb-2 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-linha-forte py-3 text-sm text-nevoa"
        >
          <IconeMais size={16} aria-hidden />
          {textos.lista.adicionarFilme}
        </Link>

        <button
          type="button"
          onClick={() => setConfirmandoExclusao(true)}
          className="mb-8 text-sm text-erro underline"
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
          perigosa
          confirmando={excluir.isPending}
          aoConfirmar={aoExcluirLista}
          aoCancelar={() => setConfirmandoExclusao(false)}
        />
      </div>
    </main>
  )
}
