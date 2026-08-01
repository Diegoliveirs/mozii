import { describe, expect, it } from 'vitest'
import { tempoAtras } from '../datas'

const agora = new Date('2026-08-01T15:00:00-03:00')

function atras(segundos: number): string {
  return new Date(agora.getTime() - segundos * 1000).toISOString()
}

describe('tempoAtras', () => {
  it('agora, minutos e horas', () => {
    expect(tempoAtras(atras(10), agora)).toBe('agora')
    expect(tempoAtras(atras(5 * 60), agora)).toBe('há 5 min')
    expect(tempoAtras(atras(2 * 3600), agora)).toBe('há 2 h')
  })

  it('ontem e dias', () => {
    expect(tempoAtras(atras(26 * 3600), agora)).toBe('ontem')
    expect(tempoAtras(atras(3 * 24 * 3600), agora)).toBe('há 3 dias')
  })

  it('mais de uma semana vira data por extenso em pt-BR', () => {
    expect(tempoAtras(atras(30 * 24 * 3600), agora)).toBe('2 de jul')
  })
})

describe('rotuloDoDia', () => {
  it('hoje, ontem, mesmo ano e ano diferente', async () => {
    const { rotuloDoDia } = await import('../datas')
    expect(rotuloDoDia('2026-08-01', agora)).toBe('Hoje')
    expect(rotuloDoDia('2026-07-31', agora)).toBe('Ontem')
    expect(rotuloDoDia('2026-03-12', agora)).toBe('12 de março')
    expect(rotuloDoDia('2024-12-25', agora)).toBe('25 de dezembro de 2024')
  })
})
