import type { IdTema, TemaCompleto, TemaParcial } from './contrato'

/**
 * Registro de todos os temas. É o ÚNICO lugar para registrar um tema e
 * para escolher o padrão. Cada tema carrega por `import()`: o código, o
 * CSS e os assets só baixam quando ele está ativo.
 */

/** O tema que vale quando nenhum evento está na janela. */
export const TEMA_PADRAO: IdTema = 'noir'

export type EntradaRegistro =
  | { carregar: () => Promise<TemaCompleto> }
  | {
      /** Tema completo de onde vem tudo o que o evento não define. */
      base: IdTema
      /** Janela anual no formato 'MM-DD' (ex.: '12-01' a '12-26'). Pode virar o ano. */
      inicio: string
      fim: string
      carregar: () => Promise<TemaParcial>
    }

export type Registro = Record<IdTema, EntradaRegistro>

export const registro: Registro = {
  noir: {
    carregar: (): Promise<TemaCompleto> => import('./noir/tema').then((modulo) => modulo.tema),
  },
  classico: {
    carregar: (): Promise<TemaCompleto> => import('./classico/tema').then((modulo) => modulo.tema),
  },
}
