const RECORTE = {
  // Mostra só a metade de DENTRO do cartão — e 1px a mais, para cobrir a
  // linha da borda do ingresso (o absoluto se ancora por dentro da borda).
  topo: '-top-2 [clip-path:inset(calc(50%-1px)_-1px_-1px_-1px)]',
  base: '-bottom-2 [clip-path:inset(-1px_-1px_calc(50%-1px)_-1px)]',
  esquerda: '-left-2 [clip-path:inset(-1px_-1px_-1px_calc(50%-1px))]',
  direita: '-right-2 [clip-path:inset(-1px_calc(50%-1px)_-1px_-1px)]',
} as const

const FUNDO = { fundo: 'bg-fundo', superficie: 'bg-superficie' } as const

/**
 * Uma perfuração do ingresso: meia-lua na cor de trás (`sobre`) que morde
 * a borda, com o contorno do ingresso fazendo a curva. O ingresso NÃO pode
 * ter `overflow-hidden` — ele cortaria a meia-lua por dentro da borda e a
 * linha passaria reta por cima do recorte. `className` posiciona no eixo
 * da linha picotada (ex.: `left-[92px]`, ou `top-0 -translate-y-1/2`).
 */
export function Perfuracao({
  lado,
  sobre = 'fundo',
  className = '',
}: {
  lado: keyof typeof RECORTE
  sobre?: keyof typeof FUNDO
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={`absolute h-4 w-4 rounded-full border border-(--ingresso-borda) ${FUNDO[sobre]} ${RECORTE[lado]} ${className}`}
    />
  )
}
