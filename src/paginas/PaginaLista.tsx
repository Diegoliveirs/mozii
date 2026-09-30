import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CabecalhoPagina } from '../componentes/layout/CabecalhoPagina'
import { classesBotao } from '../componentes/ui/estiloBotao'
import { DialogoConfirmar } from '../componentes/ui/DialogoConfirmar'
import { ModalSorteio } from '../componentes/filmes/ModalSorteio'
import { Poster } from '../componentes/filmes/Poster'
import { ModalAgendarSessao } from '../componentes/sessoes/ModalAgendarSessao'
import { EstadoVazio } from '../componentes/ui/EstadoVazio'
import { Botao } from '../componentes/ui/Botao'
import { CapaEmLeque } from '../componentes/filmes/CapaEmLeque'
import {
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
          <div className="relative flex flex-col items-center pt-2 text-center">
            <div
              aria-hidden
              className="absolute top-0 h-56 w-56 rounded-full bg-afeto/15 blur-3xl"
            />
            <div className="relative w-56">
              <CapaEmLeque caminhos={lista.postersCapa} tamanho="grande" />
            </div>
            <p className="relative mt-4 titulo text-4xl leading-tight tracking-tight text-texto">
              {lista.nome}
            </p>
            <div className="relative mt-3 flex w-56 items-center gap-2.5">
              <div className="h-[3px] flex-1 rounded-full bg-borda-forte">
                <div
                  className="h-full rounded-full bg-afeto transition-all"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <p className="shrink-0 text-xs text-texto-secundario">
                {textos.lista.progresso(lista.qtdAssistidos, lista.qtdItens)}
              </p>
            </div>
          </div>
        )}

        <Botao
          onClick={() => setSorteioAberto(true)}
          disabled={naoAssistidos.length === 0}
          grande
          className="mt-6 w-full"
        >
          <IconeSorteio size={20} aria-hidden />
          {textos.sorteio.botao}
        </Botao>

        {itens.data?.length === 0 && (
          <div className="mt-5">
            <EstadoVazio
              icone={<IconeFilme size={26} aria-hidden />}
              titulo={textos.lista.vazia}
              acao={
                <Link to="/cinema" className={classesBotao()}>
                  {textos.lista.adicionarFilme}
                </Link>
              }
            />
          </div>
        )}

        {(itens.data?.length ?? 0) > 0 && naoAssistidos.length === 0 && (
          <p className="mt-4 text-center font-titulo text-texto-secundario italic">
            {textos.sorteio.todosAssistidos}
          </p>
        )}

        <ul className="mt-4 pb-4">
          {itens.data?.map((item) => (
            <li
              key={item.id}
              className={`flex items-center gap-3.5 border-b border-borda py-3 last:border-b-0 ${
                item.assistido ? 'opacity-55' : ''
              }`}
            >
              <Link to={`/filme/${item.filme.tmdbId}`} className="shrink-0">
                <Poster
                  caminho={item.filme.caminhoPoster}
                  titulo={item.filme.titulo}
                  largura={185}
                  className="w-12"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  to={`/filme/${item.filme.tmdbId}`}
                  className={`block truncate titulo text-lg ${
                    item.assistido ? 'text-texto-discreto' : 'text-texto'
                  }`}
                >
                  {item.filme.titulo}
                </Link>
                <p className="text-xs text-texto-discreto">
                  {item.filme.anoLancamento && `${item.filme.anoLancamento} · `}
                  {textos.lista.adicionadoPor(nomeDe(item.adicionadoPor))}
                </p>
              </div>

              {!item.assistido && (
                <button
                  type="button"
                  aria-label={`${textos.sessao.modalTitulo}: ${item.filme.titulo}`}
                  onClick={() => setAgendandoItem(item)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-vidro-borda text-texto-secundario transition-transform active:scale-90"
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
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 ${
                  item.assistido
                    ? 'bg-metal/15 text-metal'
                    : 'border border-vidro-borda text-texto-secundario'
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
                className="p-1 text-texto-discreto transition-transform active:scale-90"
              >
                <IconeFechar size={17} aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        <Link
          to="/cinema"
          className="mb-3 flex items-center justify-center gap-1.5 rounded-botao border border-dashed border-borda-forte py-3.5 text-sm text-texto-secundario"
        >
          <IconeMais size={16} aria-hidden />
          {textos.lista.adicionarFilme}
        </Link>

        <button
          type="button"
          onClick={() => setConfirmandoExclusao(true)}
          className="mb-8 text-sm text-perigo-texto underline"
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
