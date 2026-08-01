/**
 * Lógica pura do sorteio "O que ver hoje" (efeito caça-níquel).
 *
 * A graça está nos ATRASOS CRESCENTES: cada quadro demora mais que o
 * anterior, produzindo a desaceleração até "travar" no filme sorteado
 * (~1,5s no total). Os valores vêm do Mozii original, ajustados no olho.
 */
export const ATRASOS_ROLAGEM = [70, 70, 80, 95, 115, 140, 170, 210, 260, 320] as const

/** Sorteia o índice vencedor. `aleatorio` é injetável para os testes. */
export function sortearIndice(qtdItens: number, aleatorio: () => number = Math.random): number {
  if (qtdItens <= 0) throw new Error('nada para sortear')
  return Math.floor(aleatorio() * qtdItens)
}

/**
 * A sequência de índices exibidos durante a rolagem: um por quadro,
 * percorrendo os itens em ordem circular e TERMINANDO no vencedor.
 */
export function sequenciaDeRolagem(qtdItens: number, indiceVencedor: number): number[] {
  if (qtdItens <= 0) throw new Error('nada para sortear')
  if (indiceVencedor < 0 || indiceVencedor >= qtdItens) throw new Error('vencedor fora da lista')

  const quadros = ATRASOS_ROLAGEM.length
  // Anda para trás a partir do vencedor para saber onde a rolagem começa.
  const inicio = (((indiceVencedor - (quadros - 1)) % qtdItens) + qtdItens) % qtdItens

  return Array.from({ length: quadros }, (_ignorado, quadro) => (inicio + quadro) % qtdItens)
}
