/**
 * Fonte ÚNICA do layout do cartão de compartilhar (Stories, 1080×1920).
 * Constantes e temas moram aqui; o desenho em canvas fica em
 * `desenharCartao.ts`. Mudou o visual? Muda aqui, os dois acompanham.
 */

export const CARTAO = {
  largura: 1080,
  altura: 1920,
  margem: 96,
  poster: { largura: 560, altura: 840, raio: 24 },
  estrela: { tamanho: 64, espaco: 12 },
} as const

export interface TemaCartao {
  nome: string
  fundoTopo: string
  fundoBase: string
  destaque: string
  texto: string
  textoSuave: string
}

export const TEMAS = {
  meianoite: {
    nome: 'Meia-noite',
    fundoTopo: '#221d2b',
    fundoBase: '#0e0b12',
    destaque: '#d4537e',
    texto: '#f2edf5',
    textoSuave: '#c3bccd',
  },
  vinho: {
    nome: 'Vinho',
    fundoTopo: '#3b0f1f',
    fundoBase: '#160309',
    destaque: '#ed93b1',
    texto: '#fdf1f5',
    textoSuave: '#d9aebc',
  },
  oceano: {
    nome: 'Oceano',
    fundoTopo: '#0c2a3d',
    fundoBase: '#04101a',
    destaque: '#7fc8e8',
    texto: '#eef7fc',
    textoSuave: '#a9c8d8',
  },
} as const satisfies Record<string, TemaCartao>

export type NomeTema = keyof typeof TEMAS

/**
 * Quebra de texto gulosa por palavra, com limite de linhas — a última
 * ganha reticências se o texto não coube. Pura e testada.
 */
export function quebrarLinhas(texto: string, maxCaracteres: number, maxLinhas: number): string[] {
  const palavras = texto.split(/\s+/).filter(Boolean)
  const linhas: string[] = []
  let atual = ''

  for (const palavra of palavras) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra
    if (tentativa.length <= maxCaracteres) {
      atual = tentativa
      continue
    }
    if (atual) linhas.push(atual)
    // Palavra maior que a linha inteira: corta na marra.
    atual = palavra.length > maxCaracteres ? palavra.slice(0, maxCaracteres) : palavra

    if (linhas.length === maxLinhas) break
  }
  if (atual && linhas.length < maxLinhas) linhas.push(atual)

  const coube = linhas.join(' ').length >= texto.trim().replace(/\s+/g, ' ').length
  if (!coube && linhas.length > 0) {
    const ultima = linhas[linhas.length - 1]
    linhas[linhas.length - 1] = `${ultima.slice(0, maxCaracteres - 1)}…`
  }
  return linhas
}
