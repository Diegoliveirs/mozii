import { describe, expect, it } from 'vitest'
import type { NotaDeAtualizacao } from '../../dominio/tipos'
import { notasDesde } from '../novidades'
import { textos } from '../textos'

const nota = (versao: string): NotaDeAtualizacao => ({
  versao,
  data: '2026-09-30',
  tituloInicio: 'Nota',
  tituloDestaque: versao,
  novidades: [],
  correcoes: [],
  avisos: [],
})
const notas = [nota('2.3'), nota('2.2'), nota('2.1')]

describe('notasDesde', () => {
  it('mostra tudo acima da última vista, da mais nova para a mais antiga', () => {
    expect(notasDesde(notas, '2.1').map((n) => n.versao)).toEqual(['2.3', '2.2'])
  })

  it('já viu a mais nova: nada a mostrar', () => {
    expect(notasDesde(notas, '2.3')).toEqual([])
  })

  it('sem registro ou versão desconhecida: só a mais nova', () => {
    expect(notasDesde(notas, null).map((n) => n.versao)).toEqual(['2.3'])
    expect(notasDesde(notas, '1.0').map((n) => n.versao)).toEqual(['2.3'])
  })
})

describe('as notas publicadas', () => {
  const publicadas = textos.novidades.notas

  it('têm versões únicas e datas válidas, da mais nova para a mais antiga', () => {
    const versoes = publicadas.map((n) => n.versao)
    expect(new Set(versoes).size).toBe(versoes.length)
    for (const n of publicadas) expect(n.data).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const datas = publicadas.map((n) => n.data)
    expect([...datas].sort().reverse()).toEqual(datas)
  })

  it('toda nota diz alguma coisa', () => {
    for (const n of publicadas) {
      expect(n.novidades.length + n.correcoes.length + n.avisos.length).toBeGreaterThan(0)
    }
  })
})
