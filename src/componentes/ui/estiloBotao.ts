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

/**
 * Pele do botão canônico — também para `<Link>` que precisa parecer botão.
 * `grande` é o botão principal de uma tela (formulários de entrada).
 */
export function classesBotao(variante: VarianteBotao = 'primario', grande = false) {
  const tamanho = grande ? 'px-5 py-4 text-[15px]' : 'px-4 py-3 text-sm'
  return `inline-flex items-center justify-center gap-2 rounded-botao ${tamanho} transition-transform duration-100 active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100 ${variantes[variante]}`
}
