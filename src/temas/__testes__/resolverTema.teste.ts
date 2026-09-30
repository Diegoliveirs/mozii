import { describe, expect, it } from 'vitest'
import type { IdTema, TemaCompleto, TemaParcial } from '../contrato'
import type { Registro } from '../registro'
import { dentroDaJanela, pilhaDoTema, resolverTema } from '../resolverTema'

// Registro de mentira: 'classico' faz papel de base e de "evento" nos testes.
const completo = (): Promise<TemaCompleto> => Promise.reject(new Error('não carrega'))
const parcial = (): Promise<TemaParcial> => Promise.reject(new Error('não carrega'))
const semEvento: Registro = { classico: { carregar: completo }, noir: { carregar: completo } }
const comEvento = {
  classico: { carregar: completo },
  natal: { base: 'classico', inicio: '12-01', fim: '12-26', carregar: parcial },
} as unknown as Registro

describe('dentroDaJanela', () => {
  it('janela comum é inclusiva nas pontas', () => {
    expect(dentroDaJanela('12-01', '12-01', '12-26')).toBe(true)
    expect(dentroDaJanela('12-26', '12-01', '12-26')).toBe(true)
    expect(dentroDaJanela('11-30', '12-01', '12-26')).toBe(false)
  })

  it('janela que atravessa o ano novo', () => {
    expect(dentroDaJanela('12-31', '12-26', '01-02')).toBe(true)
    expect(dentroDaJanela('01-02', '12-26', '01-02')).toBe(true)
    expect(dentroDaJanela('01-03', '12-26', '01-02')).toBe(false)
  })
})

describe('resolverTema', () => {
  const dezembro = new Date(2026, 11, 20)
  const outubro = new Date(2026, 9, 1)

  it('fora de qualquer janela vale o padrão', () => {
    expect(resolverTema(outubro, comEvento, 'classico')).toBe('classico')
  })

  it('dentro da janela vale o evento', () => {
    expect(resolverTema(dezembro, comEvento, 'classico')).toBe('natal')
  })

  it('o pedido pela URL vence a data', () => {
    expect(resolverTema(dezembro, comEvento, 'classico', 'classico')).toBe('classico')
  })

  it('pedido desconhecido é ignorado', () => {
    expect(resolverTema(outubro, semEvento, 'classico', 'inexistente')).toBe('classico')
    expect(resolverTema(outubro, semEvento, 'classico', 'toString')).toBe('classico')
  })
})

describe('pilhaDoTema', () => {
  it('tema completo sozinho; evento vai por cima da base', () => {
    expect(pilhaDoTema('classico', comEvento)).toEqual(['classico'])
    expect(pilhaDoTema('natal' as IdTema, comEvento)).toEqual(['classico', 'natal'])
  })
})
