import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ModalCompartilhar } from '../componentes/compartilhar/ModalCompartilhar'
import { CartaoPublicacao } from '../componentes/mural/CartaoPublicacao'
import { EstrelasNota } from '../componentes/mural/EstrelasNota'
import { DialogoConfirmar } from '../componentes/ui/DialogoConfirmar'
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

/** Detalhe da publicação: conversa aberta + editar/excluir (só do autor). */
export function PaginaPublicacao() {
  const { publicacaoId } = useParams()
  const navegar = useNavigate()
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
    return <main className="px-5 pt-8 text-cinza">{textos.comuns.carregando}</main>
  }
  if (!publicacao.data) {
    return <main className="px-5 pt-8 text-nevoa">{textos.publicacao.naoEncontrada}</main>
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
  }

  async function aoExcluir() {
    await excluir.mutateAsync(dados.id)
    navegar('/', { replace: true })
  }

  return (
    <main className="px-5 pt-8 pb-8">
      <h1 className="font-voz text-3xl text-neve">{textos.publicacao.titulo}</h1>

      <div className="mt-5">
        {editando ? (
          <div className="rounded-2xl bg-cartao p-4">
            <p className="text-sm text-nevoa">{textos.novo.notaRotulo}</p>
            <EstrelasNota valor={notaEditada} aoMudar={setNotaEditada} />
            <textarea
              rows={3}
              maxLength={2000}
              value={corpoEditado}
              onChange={(evento) => setCorpoEditado(evento.target.value)}
              className="mt-3 w-full resize-none rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none focus:border-rosa"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="flex-1 rounded-xl border border-linha-forte py-2.5 text-nevoa"
              >
                {textos.comuns.cancelar}
              </button>
              <button
                type="button"
                onClick={aoSalvarEdicao}
                disabled={editar.isPending || notaEditada === 0}
                className="flex-1 rounded-xl bg-rosa py-2.5 font-medium text-neve disabled:opacity-60"
              >
                {textos.comuns.salvar}
              </button>
            </div>
          </div>
        ) : (
          <CartaoPublicacao
            publicacao={dados}
            membros={casal.data?.membros ?? []}
            meuId={usuario?.id}
            reacoes={reacoes.data ?? []}
            qtdComentarios={contagens.data?.[dados.id] ?? 0}
            aoReagir={(emoji) => reagir.mutate({ publicacaoId: dados.id, emoji })}
            comentariosAbertos
          />
        )}
      </div>

      {dados.tipo === 'avaliacao' && !editando && (
        <button
          type="button"
          onClick={() => setCompartilhando(true)}
          className="mt-4 w-full rounded-xl border border-rosa py-3 font-medium text-rosa-suave"
        >
          {textos.compartilhar.botaoAbrir}
        </button>
      )}

      {souAutor && !editando && (
        <div className="mt-6 flex flex-col items-start gap-3">
          {dados.tipo === 'avaliacao' && (
            <button type="button" onClick={comecarEdicao} className="text-sm text-nevoa underline">
              {textos.publicacao.editar}
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmandoExclusao(true)}
            className="text-sm text-rosa-suave underline"
          >
            {textos.publicacao.excluir}
          </button>
        </div>
      )}

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
        aoConfirmar={aoExcluir}
        aoCancelar={() => setConfirmandoExclusao(false)}
      />
    </main>
  )
}
