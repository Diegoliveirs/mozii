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

describe('contagemRegressiva', () => {
  it('dias, horas, minutos e o "é agora"', async () => {
    const { contagemRegressiva } = await import('../datas')
    const em = (minutos: number) => new Date(agora.getTime() + minutos * 60_000).toISOString()
    expect(contagemRegressiva(em(3 * 24 * 60), agora)).toBe('em 3 dias')
    expect(contagemRegressiva(em(27 * 60), agora)).toBe('em 1 dia')
    expect(contagemRegressiva(em(5 * 60), agora)).toBe('em 5 h')
    expect(contagemRegressiva(em(42), agora)).toBe('em 42 min')
    expect(contagemRegressiva(em(0), agora)).toBe('é agora! 🍿')
  })

  it('horário passado retorna null (vira o estado "como foi?")', async () => {
    const { contagemRegressiva } = await import('../datas')
    const passado = new Date(agora.getTime() - 3600_000).toISOString()
    expect(contagemRegressiva(passado, agora)).toBeNull()
  })
})

describe('formatarQuando', () => {
  it('dia por extenso com hora compacta', async () => {
    const { formatarQuando } = await import('../datas')
    expect(formatarQuando('2026-08-15T20:00:00-03:00')).toBe('sábado, 15 de ago · 20h')
    expect(formatarQuando('2026-08-15T20:30:00-03:00')).toBe('sábado, 15 de ago · 20h30')
  })
})

describe('valorParaCampoDataHoraLocal', () => {
  it('gera o formato aceito pelo campo datetime-local', async () => {
    const { valorParaCampoDataHoraLocal } = await import('../datas')
    expect(valorParaCampoDataHoraLocal('2026-08-15T20:30:00-03:00')).toMatch(
      /^2026-08-(15|16)T\d{2}:30$/,
    )
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
