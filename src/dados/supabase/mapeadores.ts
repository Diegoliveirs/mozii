import type { Casal, Perfil, RefFilme } from '../../dominio/tipos'

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
