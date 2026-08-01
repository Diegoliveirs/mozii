import { describe, expect, it } from 'vitest'
import { codigoCompleto, normalizarCodigo } from '../codigo'

describe('normalizarCodigo', () => {
  it('coloca em maiúsculas e remove o que não é letra ou número', () => {
    expect(normalizarCodigo(' ab 3-x!y ')).toBe('AB3XY')
  })

  it('corta no tamanho máximo de 6', () => {
    expect(normalizarCodigo('ABCDEFGHI')).toBe('ABCDEF')
  })

  it('aceita colar o código com espaços em volta', () => {
    expect(normalizarCodigo('  QWERTY  ')).toBe('QWERTY')
  })
})

describe('codigoCompleto', () => {
  it('só é completo com exatamente 6 caracteres', () => {
    expect(codigoCompleto('ABCDE')).toBe(false)
    expect(codigoCompleto('ABCDEF')).toBe(true)
  })
})
