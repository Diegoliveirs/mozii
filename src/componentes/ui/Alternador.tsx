/**
 * Interruptor (switch) no padrão do app: pílula rosa quando ligado.
 * Sempre com `aria-label` ou rótulo visível ao lado.
 */
export function Alternador({
  ligado,
  aoMudar,
  rotulo,
  desabilitado = false,
}: {
  ligado: boolean
  aoMudar: (novo: boolean) => void
  rotulo: string
  desabilitado?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      disabled={desabilitado}
      onClick={() => aoMudar(!ligado)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
        ligado ? 'bg-rosa' : 'bg-linha-forte'
      }`}
    >
      <span
        aria-hidden
        className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-neve transition-all ${
          ligado ? 'left-[19px]' : 'left-[3px]'
        }`}
      />
    </button>
  )
}
