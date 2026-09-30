import { describe, expect, it } from 'vitest'
import type { IdTema, TemaCompleto } from '../contrato'
import { mesclarTema } from '../mesclarTema'

const Nada = () => null
const Barra = () => null
const Neve = () => null
const Laco = () => null

const base: TemaCompleto = {
  id: 'classico',
  componentes: {
    BarraNavegacao: Barra,
    CabecalhoPagina: Nada,
    TelaAbertura: Nada,
    CamadaAderecos: Nada,
  },
  encaixes: {},
  textos: { saudacao: (nomes) => nomes.join(' ♥ ') },
}

describe('mesclarTema', () => {
  it('o evento sobrescreve só o que declara; o resto vem da base', () => {
    const tema = mesclarTema(base, {
      id: 'natal' as IdTema,
      componentes: { CamadaAderecos: Neve },
      encaixes: { 'ingresso-canto': Laco },
      textos: { saudacao: (nomes) => `Feliz Natal, ${nomes.join(' & ')}` },
    })

    expect(tema.id).toBe('natal')
    expect(tema.componentes.CamadaAderecos).toBe(Neve)
    expect(tema.componentes.BarraNavegacao).toBe(Barra)
    expect(tema.encaixes['ingresso-canto']).toBe(Laco)
    expect(tema.textos.saudacao(['Diego', 'Bia'])).toBe('Feliz Natal, Diego & Bia')
  })

  it('evento vazio vira uma cópia da base', () => {
    const tema = mesclarTema(base, { id: 'vazio' as IdTema })
    expect(tema.componentes).toEqual(base.componentes)
    expect(tema.textos.saudacao(['Diego', 'Bia'])).toBe('Diego ♥ Bia')
  })
})
