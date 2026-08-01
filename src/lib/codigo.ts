/**
 * Normalização do código de convite digitado.
 * O banco também normaliza (upper/trim), mas fazer aqui melhora a UX:
 * o campo mostra o código já no formato certo enquanto a pessoa digita.
 */
export const TAMANHO_CODIGO = 6

export function normalizarCodigo(bruto: string): string {
  return bruto
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, TAMANHO_CODIGO)
}

export function codigoCompleto(codigo: string): boolean {
  return codigo.length === TAMANHO_CODIGO
}
