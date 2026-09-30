import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SessaoCinema } from '../../dominio/tipos'
import {
  useCancelarSessao,
  useConcluirSessao,
  useSessoesAgendadas,
  useSessoesConcluidas,
} from '../../hooks/useSessoes'
import { contagemRegressiva, formatarQuando } from '../../lib/datas'
import { textos } from '../../lib/textos'
import { Poster } from '../filmes/Poster'
import { Botao } from '../ui/Botao'
import { DialogoConfirmar } from '../ui/DialogoConfirmar'
import { IconeConfirmado } from '../ui/icones'

/**
 * A memória do Cinema: sessões cujo horário já passou. As que ainda
 * esperam o veredito ganham o "Como foi?"; as concluídas viram linhas
 * apagadas com o check — presentes, mas sem pedir atenção.
 */
export function SessoesPassadas() {
  const agendadas = useSessoesAgendadas()
  const concluidas = useSessoesConcluidas(5)

  const pendentes =
    agendadas.data?.filter((sessao) => contagemRegressiva(sessao.agendadaPara) === null) ?? []

  if (pendentes.length === 0 && (concluidas.data?.length ?? 0) === 0) return null

  return (
    <section className="mt-8">
      <h2 className="text-xs font-medium tracking-wide text-texto-discreto uppercase">
        {textos.sessao.passadasTitulo}
      </h2>
      <div className="mt-2 space-y-2">
        {pendentes.map((sessao) => (
          <SessaoPendente key={sessao.id} sessao={sessao} />
        ))}
        {concluidas.data?.map((sessao) => (
          <div key={sessao.id} className="flex items-center gap-3 px-1 py-1.5 opacity-55">
            <Poster
              caminho={sessao.filme.caminhoPoster}
              titulo={sessao.filme.titulo}
              largura={185}
              className="w-8"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-texto">{sessao.filme.titulo}</p>
              <p className="text-xs text-texto-discreto">
                {formatarQuando(sessao.agendadaPara)} · {textos.sessao.concluida}
              </p>
            </div>
            <IconeConfirmado
              size={18}
              weight="fill"
              className="shrink-0 text-sucesso"
              aria-hidden
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export function SessaoPendente({ sessao }: { sessao: SessaoCinema }) {
  const navegar = useNavigate()
  const concluir = useConcluirSessao()
  const cancelar = useCancelarSessao()
  const [aberta, setAberta] = useState(false)
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)

  return (
    <div className="rounded-cartao border border-borda bg-superficie px-3 py-2.5">
      <div className="flex items-center gap-3">
        <Poster
          caminho={sessao.filme.caminhoPoster}
          titulo={sessao.filme.titulo}
          largura={185}
          className="w-8"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-texto">{sessao.filme.titulo}</p>
          <p className="text-xs text-texto-discreto">{formatarQuando(sessao.agendadaPara)}</p>
        </div>
        <button
          type="button"
          aria-expanded={aberta}
          onClick={() => setAberta((estava) => !estava)}
          className="shrink-0 rounded-full bg-afeto/25 px-3 py-1.5 text-xs font-medium text-afeto-claro"
        >
          {textos.sessao.comoFoiCurto}
        </button>
      </div>

      {aberta && (
        <div className="entrada-folha mt-3 space-y-2">
          <p className="text-sm text-texto-secundario">{textos.sessao.comoFoi}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Botao
              onClick={() =>
                navegar('/novo', { state: { filme: sessao.filme, sessaoId: sessao.id } })
              }
              className="px-4 py-2 text-xs"
            >
              {textos.sessao.avaliarFilme}
            </Botao>
            <Botao
              variante="fantasma"
              carregando={concluir.isPending}
              onClick={() => concluir.mutate({ sessaoId: sessao.id, publicacaoAvaliacaoId: null })}
              className="px-3 py-2 text-xs"
            >
              {textos.sessao.soMarcar}
            </Botao>
            <button
              type="button"
              onClick={() => setConfirmandoCancelamento(true)}
              className="px-1 text-xs text-texto-discreto underline"
            >
              {textos.sessao.cancelar}
            </button>
          </div>
        </div>
      )}

      <DialogoConfirmar
        aberto={confirmandoCancelamento}
        titulo={textos.sessao.cancelarConfirmar}
        descricao={textos.sessao.cancelarExplicacao}
        rotuloConfirmar={textos.comuns.confirmar}
        perigosa
        confirmando={cancelar.isPending}
        aoConfirmar={async () => {
          await cancelar.mutateAsync(sessao.id)
          setConfirmandoCancelamento(false)
        }}
        aoCancelar={() => setConfirmandoCancelamento(false)}
      />
    </div>
  )
}
