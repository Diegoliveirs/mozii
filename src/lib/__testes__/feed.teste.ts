import { describe, expect, it } from 'vitest'
import { agruparAtividades } from '../feed'

const item = (tipo: string, id: number) => ({ tipo, id })

describe('agruparAtividades', () => {
  it('junta atividades seguidas e deixa as publicações sozinhas', () => {
    const feed = [
      item('texto', 1),
      item('atividade', 2),
      item('atividade', 3),
      item('avaliacao', 4),
      item('atividade', 5),
    ]
    expect(agruparAtividades(feed).map((bloco) => bloco.map((i) => i.id))).toEqual([
      [1],
      [2, 3],
      [4],
      [5],
    ])
  })

  it('publicações seguidas não se juntam', () => {
    expect(agruparAtividades([item('texto', 1), item('texto', 2)])).toHaveLength(2)
  })
})
