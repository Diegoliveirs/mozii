import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ModalCompartilhar } from '../componentes/compartilhar/ModalCompartilhar'
import { CabecalhoPagina } from '../componentes/layout/CabecalhoPagina'
import { CartaoPublicacao, EMOJI_CURTIDA } from '../componentes/mural/CartaoPublicacao'
import { Comentarios } from '../componentes/mural/Comentarios'
import { EstrelasNota } from '../componentes/mural/EstrelasNota'
import { AreaTexto } from '../componentes/ui/Campo'
import { Botao } from '../componentes/ui/Botao'
import { DialogoConfirmar } from '../componentes/ui/DialogoConfirmar'
import { Esqueleto } from '../componentes/ui/Esqueleto'
import { IconeCompartilhar, IconeLixeira } from '../componentes/ui/icones'
import { useAutenticacao } from '../hooks/useAutenticacao'
import { useCasalComMembros } from '../hooks/useCasal'
import {
  useAlternarReacao,
  useContagemComentarios,
  useEditarAvaliacao,
  useExcluirPublicacao,
  usePublicacao,
  useReacoesLote,
} from '../hooks/useMural'
import { textos } from '../lib/textos'

/**
 * Detalhe da publicação: foto em destaque, conversa aberta e, para o
 * autor, a lixeira no topo — apagar é uma ação visível, não escondida.
 */
export function PaginaPublicacao() {
  const { publicacaoId } = useParams()
  const navegar = useNavigate()
  const { state } = useLocation() as {
    state?: { focarComentario?: boolean; voltarPara?: string }
  }
  const { usuario } = useAutenticacao()
  const casal = useCasalComMembros()
  const publicacao = usePublicacao(publicacaoId!)

  const ids = publicacao.data ? [publicacao.data.id] : []
  const reacoes = useReacoesLote(ids)
  const contagens = useContagemComentarios(ids)
  const reagir = useAlternarReacao(ids)
  const editar = useEditarAvaliacao()
  const excluir = useExcluirPublicacao()

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [compartilhando, setCompartilhando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [notaEditada, setNotaEditada] = useState(0)
  const [corpoEditado, setCorpoEditado] = useState('')

  if (publicacao.isPending) {
    return (
      <main>
        <CabecalhoPagina titulo={textos.publicacao.titulo} fallback={state?.voltarPara ?? '/'} />
        <div className="mt-4 px-5">
          <Esqueleto className="h-56 rounded-2xl" />
        </div>
      </main>
    )
  }
  if (!publicacao.data) {
    return (
      <main>
        <CabecalhoPagina titulo={textos.publicacao.titulo} fallback={state?.voltarPara ?? '/'} />
        <p className="px-5 pt-4 text-nevoa">{textos.publicacao.naoEncontrada}</p>
      </main>
    )
  }

  const dados = publicacao.data
  const souAutor = dados.autorId === usuario?.id

  function comecarEdicao() {
    setNotaEditada(dados.nota ?? 0)
    setCorpoEditado(dados.corpo ?? '')
    setEditando(true)
  }

  async function aoSalvarEdicao() {
    await editar.mutateAsync({
      id: dados.id,
      nota: notaEditada,
      corpo: corpoEditado.trim() || null,
    })
    setEditando(false)
    if (state?.voltarPara) navegar(state.voltarPara, { replace: true })
  }

  async function aoExcluir() {
    await excluir.mutateAsync(dados.id)
    navegar(state?.voltarPara ?? '/', { replace: true })
  }

  return (
    <main className="pb-8">
      <CabecalhoPagina
        titulo={textos.publicacao.titulo}
        fallback={state?.voltarPara ?? '/'}
        acao={
          <div className="flex items-center gap-1">
            {dados.tipo === 'avaliacao' && !editando && (
              <button
                type="button"
                aria-label={textos.compartilhar.botaoAbrir}
                onClick={() => setCompartilhando(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-nevoa transition-transform active:scale-90"
              >
                <IconeCompartilhar size={19} aria-hidden />
              </button>
            )}
            {souAutor && (
              <button
                type="button"
                aria-label={textos.publicacao.excluir}
                onClick={() => setConfirmandoExclusao(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-erro transition-transform active:scale-90"
              >
                <IconeLixeira size={19} aria-hidden />
              </button>
            )}
          </div>
        }
      />

      <div className="mt-2 px-5">
        {editando ? (
          <div className="rounded-2xl border border-linha bg-cartao p-4">
            <p className="text-sm text-nevoa">{textos.novo.notaRotulo}</p>
            <EstrelasNota valor={notaEditada} aoMudar={setNotaEditada} />
            <AreaTexto
              rows={3}
              maxLength={2000}
              value={corpoEditado}
              onChange={(evento) => setCorpoEditado(evento.target.value)}
              className="mt-3 resize-none"
            />
            <div className="mt-3 flex gap-2">
              <Botao variante="fantasma" onClick={() => setEditando(false)} className="flex-1">
                {textos.comuns.cancelar}
              </Botao>
              <Botao
                onClick={aoSalvarEdicao}
                carregando={editar.isPending}
                disabled={notaEditada === 0}
                className="flex-1"
              >
                {textos.comuns.salvar}
              </Botao>
            </div>
          </div>
        ) : (
          <CartaoPublicacao
            publicacao={dados}
            membros={casal.data?.membros ?? []}
            meuId={usuario?.id}
            reacoes={reacoes.data ?? []}
            qtdComentarios={contagens.data?.[dados.id] ?? 0}
            aoCurtir={() => reagir.mutate({ publicacaoId: dados.id, emoji: EMOJI_CURTIDA })}
          />
        )}

        {souAutor && dados.tipo === 'avaliacao' && !editando && (
          <button
            type="button"
            onClick={comecarEdicao}
            className="mt-3 text-sm text-nevoa underline"
          >
            {textos.publicacao.editar}
          </button>
        )}

        {!editando && (
          <section className="mt-6">
            <h2 className="text-xs font-medium tracking-wide text-cinza uppercase">
              {textos.publicacao.comentarios}
            </h2>
            <div className="mt-3">
              <Comentarios
                publicacaoId={dados.id}
                membros={casal.data?.membros ?? []}
                focarCampo={state?.focarComentario ?? false}
              />
            </div>
          </section>
        )}
      </div>

      {compartilhando && (
        <ModalCompartilhar
          publicacao={dados}
          nomes={(casal.data?.membros ?? []).map((membro) => membro.nomeExibicao)}
          aoFechar={() => setCompartilhando(false)}
        />
      )}

      <DialogoConfirmar
        aberto={confirmandoExclusao}
        titulo={textos.publicacao.excluirConfirmar}
        descricao={textos.publicacao.excluirExplicacao}
        rotuloConfirmar={textos.comuns.confirmar}
        perigosa
        confirmando={excluir.isPending}
        aoConfirmar={aoExcluir}
        aoCancelar={() => setConfirmandoExclusao(false)}
      />
    </main>
  )
}
