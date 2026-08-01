/**
 * Tipos puros do domínio do Mozii.
 * Regra da casa: nada de Supabase aqui — estes tipos descrevem o app,
 * não o backend. A tradução linha-do-banco ↔ domínio fica nos mapeadores.
 */

export interface UsuarioAutenticado {
  id: string
  email: string | null
}

export interface Perfil {
  id: string
  nomeExibicao: string
  urlAvatar: string | null
  casalId: string | null
}

export interface Casal {
  id: string
  codigoConvite: string
  dataAniversario: string | null
  criadoEm: string
}

/** O casal com as (até duas) pessoas dele — o que as telas realmente usam. */
export interface CasalComMembros {
  casal: Casal
  membros: Perfil[]
}

/** Filme como vive no nosso cache (tabela `filmes`). */
export interface RefFilme {
  tmdbId: number
  titulo: string
  caminhoPoster: string | null
  anoLancamento: number | null
}

export interface Lista {
  id: string
  nome: string
  criadoPor: string
  criadoEm: string
  qtdItens: number
  qtdAssistidos: number
  /** Até 3 pôsteres para a capa em mosaico. */
  postersCapa: string[]
}

export interface ItemLista {
  id: string
  listaId: string
  filme: RefFilme
  assistido: boolean
  adicionadoPor: string
  criadoEm: string
}
