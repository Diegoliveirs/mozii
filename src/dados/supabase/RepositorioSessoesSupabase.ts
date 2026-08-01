import type { RepositorioSessoes } from '../repositorios'
import type { SessaoCinema } from '../../dominio/tipos'
import { supabase } from './cliente'
import { paraSessao, type LinhaSessao } from './mapeadores'

const COLUNAS =
  'id, criado_por, item_lista_id, agendada_para, observacao, status, criado_em, filmes(*)'

async function sessaoAtual(): Promise<{ usuarioId: string; casalId: string }> {
  const { data } = await supabase.auth.getSession()
  const usuarioId = data.session?.user.id
  if (!usuarioId) throw new Error('sem sessão ativa')

  const perfil = await supabase.from('perfis').select('casal_id').eq('id', usuarioId).single()
  if (perfil.error) throw perfil.error
  if (!perfil.data.casal_id) throw new Error('sem casal')

  return { usuarioId, casalId: perfil.data.casal_id }
}

/** As sessões de cinema do casal. */
export const repositorioSessoesSupabase: RepositorioSessoes = {
  async agendadas(): Promise<SessaoCinema[]> {
    const { data, error } = await supabase
      .from('sessoes_cinema')
      .select(COLUNAS)
      .eq('status', 'agendada')
      .order('agendada_para')
    if (error) throw error
    return (data as unknown as LinhaSessao[]).map(paraSessao)
  },

  async agendar({ filme, agendadaPara, observacao, itemListaId }): Promise<SessaoCinema> {
    const { error: erroCache } = await supabase.rpc('gravar_filme', {
      p_tmdb_id: filme.tmdbId,
      p_titulo: filme.titulo,
      p_caminho_poster: filme.caminhoPoster,
      p_ano_lancamento: filme.anoLancamento,
    })
    if (erroCache) throw erroCache

    const { usuarioId, casalId } = await sessaoAtual()
    const { data, error } = await supabase
      .from('sessoes_cinema')
      .insert({
        casal_id: casalId,
        criado_por: usuarioId,
        tmdb_id: filme.tmdbId,
        item_lista_id: itemListaId,
        agendada_para: agendadaPara,
        observacao,
      })
      .select(COLUNAS)
      .single()
    if (error) throw error
    return paraSessao(data as unknown as LinhaSessao)
  },

  async reagendar(sessaoId, agendadaPara) {
    const { error } = await supabase
      .from('sessoes_cinema')
      .update({ agendada_para: agendadaPara })
      .eq('id', sessaoId)
    if (error) throw error
  },

  async cancelar(sessaoId) {
    const { error } = await supabase
      .from('sessoes_cinema')
      .update({ status: 'cancelada' })
      .eq('id', sessaoId)
    if (error) throw error
  },

  async concluir(sessaoId, publicacaoAvaliacaoId) {
    const { error } = await supabase.rpc('concluir_sessao', {
      p_sessao_id: sessaoId,
      p_publicacao_id: publicacaoAvaliacaoId,
    })
    if (error) throw error
  },
}
