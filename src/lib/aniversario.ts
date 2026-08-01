/**
 * Marcos de aniversário do casal para a linha do tempo dos Momentos:
 * um marco por ano completo desde a data do relacionamento até hoje.
 * Lógica pura — `hoje` é injetável para os testes.
 */
export interface MarcoAniversario {
  /** Data do marco no formato AAAA-MM-DD (bate com `aconteceu_em`). */
  data: string
  anos: number
  rotulo: string
}

export function marcosDeAniversario(
  dataAniversario: string | null,
  hoje: Date = new Date(),
): MarcoAniversario[] {
  if (!dataAniversario) return []

  const [ano, mes, dia] = dataAniversario.split('-').map(Number)
  const marcos: MarcoAniversario[] = []

  for (let anos = 1; ; anos++) {
    const marco = new Date(ano + anos, mes - 1, dia)
    if (marco > hoje) break
    const dataFormatada = `${marco.getFullYear()}-${String(mes).padStart(2, '0')}-${String(
      dia,
    ).padStart(2, '0')}`
    marcos.push({
      data: dataFormatada,
      anos,
      rotulo: anos === 1 ? '1 ano juntos 💜' : `${anos} anos juntos 💜`,
    })
  }

  return marcos.reverse() // mais recente primeiro, como a linha do tempo
}
