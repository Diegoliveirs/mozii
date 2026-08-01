import { textos } from '../../lib/textos'

/**
 * Confirmação para ações sérias (sair do espaço, excluir conta).
 * Modal simples e nosso: sem lib de dialog para duas perguntas.
 */
export function DialogoConfirmar({
  aberto,
  titulo,
  descricao,
  rotuloConfirmar,
  aoConfirmar,
  aoCancelar,
}: {
  aberto: boolean
  titulo: string
  descricao: string
  rotuloConfirmar: string
  aoConfirmar: () => void
  aoCancelar: () => void
}) {
  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-abismo/80 px-6"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div className="w-full max-w-sm rounded-2xl bg-cartao p-5">
        <h2 className="font-voz text-xl text-neve">{titulo}</h2>
        <p className="mt-2 text-sm text-nevoa">{descricao}</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={aoCancelar}
            className="flex-1 rounded-xl border border-linha-forte py-2.5 text-nevoa"
          >
            {textos.comuns.cancelar}
          </button>
          <button
            type="button"
            onClick={aoConfirmar}
            className="flex-1 rounded-xl bg-rosa py-2.5 font-medium text-neve"
          >
            {rotuloConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
