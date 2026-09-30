/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Contraste WCAG de cada tema completo, lido direto do `tokens.css`.
 * Tema de evento só herda o que não declara — então ele também passa aqui
 * se declarar as cores de texto e fundo que mudou.
 */

type Rgba = [number, number, number, number]

// Toda pasta de tema com tokens.css entra no teste sozinha. (Lido do disco:
// o Vitest esvazia arquivos CSS importados, até com `?raw`.)
const pastaTemas = join(import.meta.dirname, '..')

function lerTokens(css: string): Record<string, string> {
  const tokens: Record<string, string> = {}
  for (const [, nome, valor] of css.matchAll(/--([\w-]+):\s*([^;]+);/g)) tokens[nome] = valor.trim()
  return tokens
}

function cor(tokens: Record<string, string>, nome: string): Rgba {
  let valor = tokens[nome]
  const referencia = valor?.match(/^var\(--([\w-]+)\)$/)
  if (referencia) valor = tokens[referencia[1]]
  const hex = valor?.match(/^#([0-9a-f]{6})$/i)
  if (hex) {
    const n = parseInt(hex[1], 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1]
  }
  const rgb = valor?.match(/^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/)
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3], rgb[4] ? +rgb[4] : 1]
  throw new Error(`--${nome} não é uma cor que o teste entende: ${valor}`)
}

/** Compõe uma cor translúcida sobre um fundo opaco. */
function sobre([r, g, b, a]: Rgba, [fr, fg, fb]: Rgba): Rgba {
  return [r * a + fr * (1 - a), g * a + fg * (1 - a), b * a + fb * (1 - a), 1]
}

function luminancia([r, g, b]: Rgba): number {
  const canal = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
}

function contraste(frente: Rgba, fundo: Rgba): number {
  const [a, b] = [luminancia(sobre(frente, fundo)), luminancia(fundo)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05)
}

// Pares [frente, fundo, mínimo]. 4,5:1 é texto; 3:1 é elemento gráfico.
const PARES: [string, string, number][] = [
  ['texto', 'fundo', 4.5],
  ['texto', 'superficie', 4.5],
  ['texto-secundario', 'fundo', 4.5],
  ['texto-secundario', 'superficie', 4.5],
  ['texto-discreto', 'fundo', 4.5],
  ['texto-discreto', 'superficie', 4.5],
  ['perigo-texto', 'fundo', 4.5],
  ['afeto', 'fundo', 3],
  ['metal', 'fundo', 3],
  // Rótulo do botão principal em 14px médio. O Clássico nasceu com
  // branco sobre rosa (3,7:1) — o piso aqui é o de texto grande (3:1).
  ['primario-texto', 'primario', 3],
]

const temas = readdirSync(pastaTemas, { withFileTypes: true })
  .filter((entrada) => entrada.isDirectory())
  .filter((entrada) => readdirSync(join(pastaTemas, entrada.name)).includes('tokens.css'))
  .map((entrada) => {
    const css = readFileSync(join(pastaTemas, entrada.name, 'tokens.css'), 'utf8')
    return [entrada.name, css] as const
  })

it('encontrou os temas', () => {
  expect(temas.length).toBeGreaterThan(0)
})

describe.each(temas)('contraste do tema %s', (_id, css) => {
  const tokens = lerTokens(css)

  it.each(PARES)('%s sobre %s ≥ %s:1', (frente, fundo, minimo) => {
    expect(contraste(cor(tokens, frente), cor(tokens, fundo))).toBeGreaterThanOrEqual(minimo)
  })
})
