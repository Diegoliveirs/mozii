import type { NotaDeAtualizacao } from '../dominio/tipos'

/**
 * As notas que a pessoa ainda não viu: tudo acima da última vista (a lista
 * vem da mais nova para a mais antiga). Sem registro — ou com uma versão
 * que não existe mais — mostra só a mais nova, nunca o histórico inteiro.
 */
export function notasDesde(
  notas: readonly NotaDeAtualizacao[],
  ultimaVista: string | null,
): NotaDeAtualizacao[] {
  const indice = ultimaVista === null ? -1 : notas.findIndex((nota) => nota.versao === ultimaVista)
  if (indice === -1) return notas.slice(0, 1)
  return notas.slice(0, indice)
}

// A marca vive no aparelho: o toque em "Atualizar" grava, o app novo consome.
const CHAVE_MARCA = 'mozii:mostrar-novidades'
const CHAVE_ULTIMA_VISTA = 'mozii:ultima-nota-vista'

/** Chamado no toque em "Atualizar", antes do recarregamento. */
export function marcarNovidadesParaMostrar() {
  try {
    localStorage.setItem(CHAVE_MARCA, 'sim')
  } catch {
    // Sem storage (aba anônima): o app só não mostra a nota.
  }
}

/** Lê e apaga a marca — a nota aparece uma vez por atualização. */
export function consumirMarcaDeNovidades(): { marcado: boolean; ultimaVista: string | null } {
  try {
    const marcado = localStorage.getItem(CHAVE_MARCA) === 'sim'
    localStorage.removeItem(CHAVE_MARCA)
    return { marcado, ultimaVista: localStorage.getItem(CHAVE_ULTIMA_VISTA) }
  } catch {
    return { marcado: false, ultimaVista: null }
  }
}

export function registrarNotaVista(versao: string) {
  try {
    localStorage.setItem(CHAVE_ULTIMA_VISTA, versao)
  } catch {
    // Sem storage: na próxima atualização mostra de novo, sem prejuízo.
  }
}
