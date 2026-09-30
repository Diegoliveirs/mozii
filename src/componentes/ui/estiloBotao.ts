/**
 * Aparência das variantes do botão canônico — só tokens: cada tema muda
 * o resultado sem tocar aqui. O secundário tem tokens próprios porque
 * muda de natureza entre temas (contorno no Clássico, vidro no Noir).
 */
const variantes = {
  primario: 'bg-primario font-medium text-primario-texto',
  secundario:
    'border border-(--botao-secundario-borda) bg-(--botao-secundario-fundo) text-(--botao-secundario-texto)',
  fantasma: 'border border-borda-forte text-texto-secundario',
  perigo: 'border border-perigo/40 bg-perigo/15 font-medium text-perigo-texto',
} as const

export type VarianteBotao = keyof typeof variantes

/** Pele do botão canônico — para `<Link>` que precisa parecer botão. */
export function classesBotao(variante: VarianteBotao = 'primario') {
  return `inline-flex items-center justify-center gap-2 rounded-botao px-4 py-3 text-sm transition-transform duration-100 active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100 ${variantes[variante]}`
}
