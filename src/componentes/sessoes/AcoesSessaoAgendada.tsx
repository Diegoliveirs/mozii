import { useState } from 'react'
import type { SessaoCinema } from '../../dominio/tipos'
import { useCancelarSessao, useReagendarSessao } from '../../hooks/useSessoes'
import { valorParaCampoDataHoraLocal } from '../../lib/datas'
import { baixarIcs, gerarIcs } from '../../lib/ics'
import { textos } from '../../lib/textos'
import { Botao } from '../ui/Botao'
import { DialogoConfirmar } from '../ui/DialogoConfirmar'
import { IconeCalendario, IconeReagendar } from '../ui/icones'

/** Ações compartilhadas pelo ingresso em destaque e pela gestão de sessões. */
export function AcoesSessaoAgendada({ sessao }: { sessao: SessaoCinema }) {
  const cancelar = useCancelarSessao()
  const reagendar = useReagendarSessao()
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)
  const [reagendando, setReagendando] = useState(false)
  const [novoQuando, setNovoQuando] = useState(() =>
    valorParaCampoDataHoraLocal(sessao.agendadaPara),
  )

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
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={aoBaixarIcs}
          className="flex items-center gap-1 rounded-full bg-veu px-3 py-1.5 text-xs text-nevoa"
        >
          <IconeCalendario size={14} aria-hidden />
          {textos.sessao.calendario}
        </button>
        <button
          type="button"
          aria-expanded={reagendando}
          onClick={() => setReagendando((estava) => !estava)}
          className="flex items-center gap-1 rounded-full bg-veu px-3 py-1.5 text-xs text-nevoa"
        >
          <IconeReagendar size={14} aria-hidden />
          {textos.sessao.reagendar}
        </button>
        <button
          type="button"
          onClick={() => setConfirmandoCancelamento(true)}
          className="px-1 text-xs text-cinza underline"
        >
          {textos.sessao.cancelar}
        </button>
      </div>

      {reagendando && (
        <div className="entrada-folha mt-3 flex gap-2">
          <input
            type="datetime-local"
            aria-label={textos.sessao.novaDataRotulo}
            value={novoQuando}
            onChange={(evento) => setNovoQuando(evento.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-linha bg-veu px-3 py-2 text-sm text-neve outline-none focus:border-rosa"
          />
          <Botao
            carregando={reagendar.isPending}
            disabled={!novoQuando}
            onClick={async () => {
              await reagendar.mutateAsync({
                sessaoId: sessao.id,
                agendadaPara: new Date(novoQuando).toISOString(),
              })
              setReagendando(false)
            }}
            className="px-4 py-2"
          >
            {textos.comuns.salvar}
          </Botao>
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
    </>
  )
}
