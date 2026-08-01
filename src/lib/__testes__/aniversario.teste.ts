import { describe, expect, it } from 'vitest'
import { marcosDeAniversario } from '../aniversario'

const hoje = new Date(2026, 7, 1) // 1º de agosto de 2026

describe('marcosDeAniversario', () => {
  it('um marco por ano completo, do mais recente para o mais antigo', () => {
    const marcos = marcosDeAniversario('2023-05-10', hoje)
    expect(marcos.map((marco) => marco.data)).toEqual(['2026-05-10', '2025-05-10', '2024-05-10'])
    expect(marcos[0].rotulo).toBe('3 anos juntos 💜')
    expect(marcos[2].rotulo).toBe('1 ano juntos 💜')
  })

  it('aniversário ainda não chegado no ano não vira marco', () => {
    const marcos = marcosDeAniversario('2024-12-25', hoje)
    expect(marcos).toHaveLength(1)
    expect(marcos[0].data).toBe('2025-12-25')
  })

  it('sem data de aniversário, sem marcos', () => {
    expect(marcosDeAniversario(null, hoje)).toEqual([])
  })
})
