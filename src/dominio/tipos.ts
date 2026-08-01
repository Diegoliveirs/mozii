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

export type TipoPublicacao = 'texto' | 'avaliacao' | 'atividade' | 'momento'

/** Atividades geradas pelo app ("Diego adicionou Duna à lista Sexta à noite"). */
export type MetaAtividade = {
  acao: 'adicionou_na_lista' | 'marcou_assistido'
  tmdbId: number
  tituloFilme: string
  listaId: string
  nomeLista: string
}

export interface Publicacao {
  id: string
  autorId: string
  tipo: TipoPublicacao
  corpo: string | null
  caminhoFoto: string | null
  /** Presente quando tipo = 'avaliacao'. */
  filme: RefFilme | null
  nota: number | null
  metaAtividade: MetaAtividade | null
  criadoEm: string
}

/** Uma página do feed infinito. */
export interface PaginaDeFeed {
  itens: Publicacao[]
  proximoCursor: string | null
}

export interface Comentario {
  id: string
  publicacaoId: string
  autorId: string
  corpo: string
  criadoEm: string
}

export interface Reacao {
  id: string
  publicacaoId: string
  autorId: string
  emoji: string
}

/** Uma memória do diário do casal. */
export interface Momento {
  id: string
  autorId: string
  legenda: string | null
  /** Quando aconteceu (pode ser retroativo) — a linha do tempo ordena por isto. */
  aconteceuEm: string
  caminhosFotos: string[]
  criadoEm: string
}

/** Um dos até 5 filmes favoritos de uma pessoa. */
export interface Favorito {
  id: string
  perfilId: string
  filme: RefFilme
  posicao: number
}
