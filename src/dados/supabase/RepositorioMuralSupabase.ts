import type { RepositorioMural } from '../repositorios'
import type {
  Comentario,
  MetaAtividade,
  PaginaDeFeed,
  Publicacao,
  Reacao,
} from '../../dominio/tipos'
import { supabase } from './cliente'
import { paraComentario, paraPublicacao, paraReacao, type LinhaPublicacao } from './mapeadores'

const TAMANHO_PAGINA = 20
const COLUNAS =
  'id, autor_id, tipo, corpo, caminho_foto, nota, meta_atividade, criado_em, filmes(*)'

async function sessaoAtual(): Promise<{ usuarioId: string; casalId: string }> {
  const { data } = await supabase.auth.getSession()
  const usuarioId = data.session?.user.id
  if (!usuarioId) throw new Error('sem sessão ativa')

  const perfil = await supabase.from('perfis').select('casal_id').eq('id', usuarioId).single()
  if (perfil.error) throw perfil.error
  if (!perfil.data.casal_id) throw new Error('sem casal')

  return { usuarioId, casalId: perfil.data.casal_id }
}

/** O Mural: publicações, comentários, reações e o canal de tempo real. */
export const repositorioMuralSupabase: RepositorioMural = {
  async feed(cursor: string | null, autorId?: string): Promise<PaginaDeFeed> {
    let consulta = supabase
      .from('publicacoes')
      .select(COLUNAS)
      .order('criado_em', { ascending: false })
      .limit(TAMANHO_PAGINA)
    if (cursor) consulta = consulta.lt('criado_em', cursor)
    if (autorId) consulta = consulta.eq('autor_id', autorId)

    const { data, error } = await consulta
    if (error) throw error

    const itens = (data as unknown as LinhaPublicacao[]).map(paraPublicacao)
    return {
      itens,
      proximoCursor: itens.length === TAMANHO_PAGINA ? itens[itens.length - 1].criadoEm : null,
    }
  },

  async avaliacoesDe(autorId: string): Promise<Publicacao[]> {
    const { data, error } = await supabase
      .from('publicacoes')
      .select(COLUNAS)
      .eq('autor_id', autorId)
      .eq('tipo', 'avaliacao')
      .order('criado_em', { ascending: false })
    if (error) throw error
    return (data as unknown as LinhaPublicacao[]).map(paraPublicacao)
  },

  async publicacao(id: string): Promise<Publicacao | null> {
    const { data, error } = await supabase
      .from('publicacoes')
      .select(COLUNAS)
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? paraPublicacao(data as unknown as LinhaPublicacao) : null
  },

  async criarTexto(dados): Promise<Publicacao> {
    const { usuarioId, casalId } = await sessaoAtual()
    const { data, error } = await supabase
      .from('publicacoes')
      .insert({
        casal_id: casalId,
        autor_id: usuarioId,
        tipo: 'texto',
        corpo: dados.corpo,
        caminho_foto: dados.caminhoFoto,
      })
      .select(COLUNAS)
      .single()
    if (error) throw error
    return paraPublicacao(data as unknown as LinhaPublicacao)
  },

  async criarAvaliacao({ filme, nota, corpo }): Promise<Publicacao> {
    // O filme entra no cache global primeiro (único caminho de escrita).
    const { error: erroCache } = await supabase.rpc('gravar_filme', {
      p_tmdb_id: filme.tmdbId,
      p_titulo: filme.titulo,
      p_caminho_poster: filme.caminhoPoster,
      p_ano_lancamento: filme.anoLancamento,
    })
    if (erroCache) throw erroCache

    const { usuarioId, casalId } = await sessaoAtual()
    const { data, error } = await supabase
      .from('publicacoes')
      .insert({
        casal_id: casalId,
        autor_id: usuarioId,
        tipo: 'avaliacao',
        tmdb_id: filme.tmdbId,
        nota,
        corpo,
      })
      .select(COLUNAS)
      .single()
    if (error) throw error
    return paraPublicacao(data as unknown as LinhaPublicacao)
  },

  async editarAvaliacao(id, { nota, corpo }) {
    const { error } = await supabase.from('publicacoes').update({ nota, corpo }).eq('id', id)
    if (error) throw error
  },

  async excluirPublicacao(id) {
    const { error } = await supabase.from('publicacoes').delete().eq('id', id)
    if (error) throw error
  },

  async registrarAtividade(meta: MetaAtividade) {
    const { usuarioId, casalId } = await sessaoAtual()
    const { error } = await supabase.from('publicacoes').insert({
      casal_id: casalId,
      autor_id: usuarioId,
      tipo: 'atividade',
      meta_atividade: meta,
    })
    if (error) throw error
  },

  async comentarios(publicacaoId): Promise<Comentario[]> {
    const { data, error } = await supabase
      .from('comentarios')
      .select()
      .eq('publicacao_id', publicacaoId)
      .order('criado_em')
    if (error) throw error
    return data.map(paraComentario)
  },

  async comentar(publicacaoId, corpo): Promise<Comentario> {
    const { usuarioId } = await sessaoAtual()
    const { data, error } = await supabase
      .from('comentarios')
      .insert({ publicacao_id: publicacaoId, autor_id: usuarioId, corpo })
      .select()
      .single()
    if (error) throw error
    return paraComentario(data)
  },

  async reacoesDe(publicacaoIds): Promise<Reacao[]> {
    if (publicacaoIds.length === 0) return []
    const { data, error } = await supabase
      .from('reacoes')
      .select()
      .in('publicacao_id', publicacaoIds)
    if (error) throw error
    return data.map(paraReacao)
  },

  async contagemComentarios(publicacaoIds): Promise<Record<string, number>> {
    if (publicacaoIds.length === 0) return {}
    // Num app de 2 pessoas o volume é pequeno: buscar os ids e contar aqui
    // é mais simples que um agregado no banco.
    const { data, error } = await supabase
      .from('comentarios')
      .select('publicacao_id')
      .in('publicacao_id', publicacaoIds)
    if (error) throw error

    const contagens: Record<string, number> = {}
    for (const linha of data) {
      contagens[linha.publicacao_id] = (contagens[linha.publicacao_id] ?? 0) + 1
    }
    return contagens
  },

  async alternarReacao(publicacaoId, emoji) {
    const { usuarioId } = await sessaoAtual()
    const existente = await supabase
      .from('reacoes')
      .select('id')
      .eq('publicacao_id', publicacaoId)
      .eq('autor_id', usuarioId)
      .eq('emoji', emoji)
      .maybeSingle()
    if (existente.error) throw existente.error

    if (existente.data) {
      const { error } = await supabase.from('reacoes').delete().eq('id', existente.data.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('reacoes')
        .insert({ publicacao_id: publicacaoId, autor_id: usuarioId, emoji })
      if (error) throw error
    }
  },

  subscreverAoCasal(casalId, aoEvento) {
    // Um canal por casal. `publicacoes` e `listas` têm casal_id e ganham
    // filtro; as demais não têm a coluna — a RLS de SELECT escopa a entrega.
    const canal = supabase.channel(`casal-${casalId}`)

    const tabelasComFiltro = ['publicacoes', 'listas', 'momentos', 'favoritos']
    const tabelasSemFiltro = ['comentarios', 'reacoes', 'itens_lista']

    for (const tabela of tabelasComFiltro) {
      canal.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tabela, filter: `casal_id=eq.${casalId}` },
        () => aoEvento(tabela),
      )
    }
    for (const tabela of tabelasSemFiltro) {
      canal.on('postgres_changes', { event: '*', schema: 'public', table: tabela }, () =>
        aoEvento(tabela),
      )
    }

    canal.subscribe()
    return () => {
      void supabase.removeChannel(canal)
    }
  },
}
