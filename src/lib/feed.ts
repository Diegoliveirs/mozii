/**
 * Agrupa as atividades seguidas do feed ("Diego marcou X como assistido")
 * num bloco só: entre elas, pílulas coladas; entre blocos, o respiro e o
 * divisor do feed. Sem isso, cada pílula ganhava o respiro de uma
 * publicação inteira.
 */
export function agruparAtividades<T extends { tipo: string }>(itens: T[]): T[][] {
  const blocos: T[][] = []
  for (const item of itens) {
    const ultimo = blocos.at(-1)
    if (item.tipo === 'atividade' && ultimo?.[0].tipo === 'atividade') ultimo.push(item)
    else blocos.push([item])
  }
  return blocos
}
