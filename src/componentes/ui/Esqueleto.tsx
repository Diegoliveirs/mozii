/**
 * Bloco pulsante exibido enquanto o conteúdo real carrega.
 * Dimensione pela className (h-*, w-*, aspect-*).
 */
export function Esqueleto({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-xl bg-veu ${className}`} />
}
