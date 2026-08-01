import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { urlPoster } from '../../api/tmdb'
import type { SessaoCinema } from '../../dominio/tipos'
import {
  useCancelarSessao,
  useConcluirSessao,
  useReagendarSessao,
  useSessoesAgendadas,
} from '../../hooks/useSessoes'
import { contagemRegressiva, formatarQuando } from '../../lib/datas'
import { baixarIcs, gerarIcs } from '../../lib/ics'
import { textos } from '../../lib/textos'
import { DialogoConfirmar } from '../ui/DialogoConfirmar'

/**
 * O cartão fixo no topo do Mural quando há sessão marcada.
 * Futuro: contagem regressiva ao vivo (re-render por minuto).
 * Horário passado: vira "E aí, como foi? 🍿" até alguém resolver.
 */
export function CartaoSessao() {
  const sessoes = useSessoesAgendadas()
  const proxima = sessoes.data?.[0]

  // Tique de 1 minuto só para a contagem regressiva respirar.
  const [, setTique] = useState(0)
  useEffect(() => {
    const intervalo = setInterval(() => setTique((atual) => atual + 1), 60_000)
    return () => clearInterval(intervalo)
  }, [])

  if (!proxima) return null
  return <ConteudoCartao sessao={proxima} />
}

function ConteudoCartao({ sessao }: { sessao: SessaoCinema }) {
  const navegar = useNavigate()
  const concluir = useConcluirSessao()
  const cancelar = useCancelarSessao()
  const reagendar = useReagendarSessao()
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)
  const [reagendando, setReagendando] = useState(false)
  const [novoQuando, setNovoQuando] = useState('')

  const restante = contagemRegressiva(sessao.agendadaPara)
  const fundo = urlPoster(sessao.filme.caminhoPoster, 500)

  function aoBaixarIcs() {
    baixarIcs(
      'sessao-mozii.ics',
      gerarIcs({
        id: sessao.id,
        titulo: `Cinema: ${sessao.filme.titulo}`,
        descricao: [textos.sessao.descricaoIcs, sessao.observacao].filter(Boolean).join(' — '),
        inicio: new Date(sessao.agendadaPara),
        duracaoMinutos: 180,
      }),
    )
  }

  return (
    <section className="relative mt-4 overflow-hidden rounded-2xl bg-cartao">
      {fundo && (
        <img
          src={fundo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
      )}

      <div className="relative p-4">
        <p className="text-xs font-medium tracking-wide text-rosa-suave uppercase">
          {restante ? textos.sessao.cartaoTitulo : textos.sessao.comoFoi}
        </p>

        <Link
          to={`/filme/${sessao.filme.tmdbId}`}
          className="mt-1 block font-voz text-2xl text-neve"
        >
          {sessao.filme.titulo}
        </Link>
        <p className="mt-0.5 text-sm text-nevoa">
          {formatarQuando(sessao.agendadaPara)}
          {restante && (
            <span className="ml-2 rounded-full bg-rosa/25 px-2 py-0.5 text-rosa-suave">
              {restante}
            </span>
          )}
        </p>
        {sessao.observacao && <p className="mt-1 text-sm text-cinza">💬 {sessao.observacao}</p>}

        {restante ? (
          // ── Sessão futura: calendário, reagendar, cancelar ────────────
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={aoBaixarIcs}
              className="rounded-xl border border-linha-forte px-3 py-2 text-sm text-nevoa"
            >
              {textos.sessao.calendario}
            </button>
            <button
              type="button"
              onClick={() => setReagendando((estava) => !estava)}
              className="rounded-xl border border-linha-forte px-3 py-2 text-sm text-nevoa"
            >
              {textos.sessao.reagendar}
            </button>
            <button
              type="button"
              onClick={() => setConfirmandoCancelamento(true)}
              className="px-2 text-sm text-cinza underline"
            >
              {textos.sessao.cancelar}
            </button>
          </div>
        ) : (
          // ── Horário passou: avaliar ou só marcar como assistida ───────
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                navegar('/novo', { state: { filme: sessao.filme, sessaoId: sessao.id } })
              }
              className="rounded-xl bg-rosa px-4 py-2 text-sm font-medium text-neve"
            >
              {textos.sessao.avaliarFilme}
            </button>
            <button
              type="button"
              onClick={() => concluir.mutate({ sessaoId: sessao.id, publicacaoAvaliacaoId: null })}
              disabled={concluir.isPending}
              className="rounded-xl border border-linha-forte px-3 py-2 text-sm text-nevoa disabled:opacity-60"
            >
              {textos.sessao.soMarcar}
            </button>
            <button
              type="button"
              onClick={() => setConfirmandoCancelamento(true)}
              className="px-2 text-sm text-cinza underline"
            >
              {textos.sessao.cancelar}
            </button>
          </div>
        )}

        {reagendando && (
          <div className="entrada-folha mt-3 flex gap-2">
            <input
              type="datetime-local"
              value={novoQuando}
              onChange={(evento) => setNovoQuando(evento.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-linha bg-veu px-3 py-2 text-sm text-neve outline-none focus:border-rosa"
            />
            <button
              type="button"
              disabled={!novoQuando || reagendar.isPending}
              onClick={async () => {
                await reagendar.mutateAsync({
                  sessaoId: sessao.id,
                  agendadaPara: new Date(novoQuando).toISOString(),
                })
                setReagendando(false)
                setNovoQuando('')
              }}
              className="rounded-xl bg-rosa px-4 py-2 text-sm font-medium text-neve disabled:opacity-50"
            >
              {textos.comuns.salvar}
            </button>
          </div>
        )}
      </div>

      <DialogoConfirmar
        aberto={confirmandoCancelamento}
        titulo={textos.sessao.cancelarConfirmar}
        descricao={textos.sessao.cancelarExplicacao}
        rotuloConfirmar={textos.comuns.confirmar}
        aoConfirmar={async () => {
          await cancelar.mutateAsync(sessao.id)
          setConfirmandoCancelamento(false)
        }}
        aoCancelar={() => setConfirmandoCancelamento(false)}
      />
    </section>
  )
}
