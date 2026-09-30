import { IconeEmail } from './icones'

/** O envelope em círculo de vidro com halo de afeto — telas de e-mail. */
export function SeloEnvelope() {
  return (
    <span
      aria-hidden
      className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-vidro-borda bg-vidro text-afeto-claro shadow-[0_30px_60px_-20px_color-mix(in_oklab,var(--afeto)_40%,transparent)]"
    >
      <IconeEmail size={44} weight="light" />
    </span>
  )
}
