import { describe, expect, it } from 'vitest'
import { quebrarLinhas } from '../layoutCartao'

describe('quebrarLinhas', () => {
  it('quebra por palavra respeitando o máximo de caracteres', () => {
    expect(quebrarLinhas('um filme lindo demais', 12, 5)).toEqual(['um filme', 'lindo demais'])
  })

  it('texto curto vira uma linha só', () => {
    expect(quebrarLinhas('perfeito', 20, 3)).toEqual(['perfeito'])
  })

  it('limita as linhas e sinaliza o corte com reticências', () => {
    const linhas = quebrarLinhas('uma frase muito longa que não cabe de jeito nenhum', 10, 2)
    expect(linhas).toHaveLength(2)
    expect(linhas[1].endsWith('…')).toBe(true)
  })

  it('palavra gigante é cortada na marra em vez de estourar a linha', () => {
    const linhas = quebrarLinhas('inacreditavelmente bom', 10, 3)
    expect(linhas[0].length).toBeLessThanOrEqual(10)
  })
})
