import type {
  Casal,
  Comentario,
  Favorito,
  MetaAtividade,
  Momento,
  Perfil,
  Publicacao,
  Reacao,
  RefFilme,
  SessaoCinema,
  StatusSessao,
  TipoPublicacao,
} from '../../dominio/tipos'

/**
 * Tradução linha-do-banco (snake_case) → domínio (camelCase).
 * Cada tabela tem seu mapeador; as telas nunca veem snake_case.
 */

interface LinhaPerfil {
  id: string
  nome_exibicao: string
  url_avatar: string | null
  casal_id: string | null
}

interface LinhaCasal {
  id: string
  codigo_convite: string
  data_aniversario: string | null
  criado_em: string
}

export function paraPerfil(linha: LinhaPerfil): Perfil {
  return {
    id: linha.id,
    nomeExibicao: linha.nome_exibicao,
    urlAvatar: linha.url_avatar,
    casalId: linha.casal_id,
  }
}

interface LinhaFilme {
  tmdb_id: number
  titulo: string
  caminho_poster: string | null
  ano_lancamento: number | null
}

export function paraFilme(linha: LinhaFilme): RefFilme {
  return {
    tmdbId: linha.tmdb_id,
    titulo: linha.titulo,
    caminhoPoster: linha.caminho_poster,
    anoLancamento: linha.ano_lancamento,
  }
}

export function paraCasal(linha: LinhaCasal): Casal {
  return {
    id: linha.id,
    codigoConvite: linha.codigo_convite,
    dataAniversario: linha.data_aniversario,
    criadoEm: linha.criado_em,
  }
}

export interface LinhaPublicacao {
  id: string
  autor_id: string
  tipo: TipoPublicacao
  corpo: string | null
  caminho_foto: string | null
  nota: number | string | null
  meta_atividade: MetaAtividade | null
  criado_em: string
  filmes: LinhaFilme | null
}

export function paraPublicacao(linha: LinhaPublicacao): Publicacao {
  return {
    id: linha.id,
    autorId: linha.autor_id,
    tipo: linha.tipo,
    corpo: linha.corpo,
    caminhoFoto: linha.caminho_foto,
    filme: linha.filmes ? paraFilme(linha.filmes) : null,
    // numeric chega como string do PostgREST; o app trabalha com número.
    nota: linha.nota === null ? null : Number(linha.nota),
    metaAtividade: linha.meta_atividade,
    criadoEm: linha.criado_em,
  }
}

interface LinhaComentario {
  id: string
  publicacao_id: string
  autor_id: string
  corpo: string
  criado_em: string
}

export function paraComentario(linha: LinhaComentario): Comentario {
  return {
    id: linha.id,
    publicacaoId: linha.publicacao_id,
    autorId: linha.autor_id,
    corpo: linha.corpo,
    criadoEm: linha.criado_em,
  }
}

interface LinhaMomento {
  id: string
  autor_id: string
  legenda: string | null
  aconteceu_em: string
  caminhos_fotos: string[]
  criado_em: string
}

export function paraMomento(linha: LinhaMomento): Momento {
  return {
    id: linha.id,
    autorId: linha.autor_id,
    legenda: linha.legenda,
    aconteceuEm: linha.aconteceu_em,
    caminhosFotos: linha.caminhos_fotos,
    criadoEm: linha.criado_em,
  }
}

export interface LinhaFavorito {
  id: string
  perfil_id: string
  posicao: number
  filmes: LinhaFilme
}

export function paraFavorito(linha: LinhaFavorito): Favorito {
  return {
    id: linha.id,
    perfilId: linha.perfil_id,
    posicao: linha.posicao,
    filme: paraFilme(linha.filmes),
  }
}

export interface LinhaSessao {
  id: string
  criado_por: string
  item_lista_id: string | null
  agendada_para: string
  observacao: string | null
  status: StatusSessao
  criado_em: string
  filmes: LinhaFilme
}

export function paraSessao(linha: LinhaSessao): SessaoCinema {
  return {
    id: linha.id,
    criadoPor: linha.criado_por,
    filme: paraFilme(linha.filmes),
    itemListaId: linha.item_lista_id,
    agendadaPara: linha.agendada_para,
    observacao: linha.observacao,
    status: linha.status,
    criadoEm: linha.criado_em,
  }
}

interface LinhaReacao {
  id: string
  publicacao_id: string
  autor_id: string
  emoji: string
}

export function paraReacao(linha: LinhaReacao): Reacao {
  return {
    id: linha.id,
    publicacaoId: linha.publicacao_id,
    autorId: linha.autor_id,
    emoji: linha.emoji,
  }
}
