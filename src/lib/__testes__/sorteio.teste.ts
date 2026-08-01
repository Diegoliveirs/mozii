import { describe, expect, it } from 'vitest'
import { ATRASOS_ROLAGEM, sequenciaDeRolagem, sortearIndice } from '../sorteio'

describe('sortearIndice', () => {
  it('cobre todos os índices possíveis', () => {
    expect(sortearIndice(4, () => 0)).toBe(0)
    expect(sortearIndice(4, () => 0.999)).toBe(3)
  })

  it('recusa sortear sem itens', () => {
    expect(() => sortearIndice(0)).toThrow('nada para sortear')
  })
})

describe('sequenciaDeRolagem', () => {
  it('tem um quadro por atraso e termina no vencedor', () => {
    const sequencia = sequenciaDeRolagem(7, 3)
    expect(sequencia).toHaveLength(ATRASOS_ROLAGEM.length)
    expect(sequencia.at(-1)).toBe(3)
  })

  it('percorre os itens em ordem circular, um por quadro', () => {
    const qtd = 5
    const sequencia = sequenciaDeRolagem(qtd, 2)
    for (let quadro = 1; quadro < sequencia.length; quadro++) {
      expect(sequencia[quadro]).toBe((sequencia[quadro - 1] + 1) % qtd)
    }
  })

  it('funciona com menos itens que quadros (lista pequena roda mais de uma volta)', () => {
    const sequencia = sequenciaDeRolagem(2, 1)
    expect(sequencia).toHaveLength(ATRASOS_ROLAGEM.length)
    expect(sequencia.at(-1)).toBe(1)
    expect(new Set(sequencia)).toEqual(new Set([0, 1]))
  })

  it('atrasos crescem (é isso que dá o efeito de desaceleração)', () => {
    for (let indice = 1; indice < ATRASOS_ROLAGEM.length; indice++) {
      expect(ATRASOS_ROLAGEM[indice]).toBeGreaterThanOrEqual(ATRASOS_ROLAGEM[indice - 1])
    }
  })
})
