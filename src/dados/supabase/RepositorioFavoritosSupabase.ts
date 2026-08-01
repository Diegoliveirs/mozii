import type { RepositorioFavoritos } from '../repositorios'
import type { Favorito, RefFilme } from '../../dominio/tipos'
import { supabase } from './cliente'
import { paraFavorito, type LinhaFavorito } from './mapeadores'

async function sessaoAtual(): Promise<{ usuarioId: string; casalId: string }> {
  const { data } = await supabase.auth.getSession()
  const usuarioId = data.session?.user.id
  if (!usuarioId) throw new Error('sem sessão ativa')

  const perfil = await supabase.from('perfis').select('casal_id').eq('id', usuarioId).single()
  if (perfil.error) throw perfil.error
  if (!perfil.data.casal_id) throw new Error('sem casal')

  return { usuarioId, casalId: perfil.data.casal_id }
}

/** Os até 5 filmes favoritos de cada pessoa (o casal vê os dois). */
export const repositorioFavoritosSupabase: RepositorioFavoritos = {
  async favoritosDe(perfilId: string): Promise<Favorito[]> {
    const { data, error } = await supabase
      .from('favoritos')
      .select('id, perfil_id, posicao, filmes(*)')
      .eq('perfil_id', perfilId)
      .order('posicao')
    if (error) throw error
    return (data as unknown as LinhaFavorito[]).map(paraFavorito)
  },

  async definir(posicao: number, filme: RefFilme): Promise<void> {
    const { error: erroCache } = await supabase.rpc('gravar_filme', {
      p_tmdb_id: filme.tmdbId,
      p_titulo: filme.titulo,
      p_caminho_poster: filme.caminhoPoster,
      p_ano_lancamento: filme.anoLancamento,
    })
    if (erroCache) throw erroCache

    const { usuarioId, casalId } = await sessaoAtual()
    const { error } = await supabase.from('favoritos').insert({
      perfil_id: usuarioId,
      casal_id: casalId,
      tmdb_id: filme.tmdbId,
      posicao,
    })
    if (error) throw error
  },

  async remover(favoritoId: string): Promise<void> {
    const { error } = await supabase.from('favoritos').delete().eq('id', favoritoId)
    if (error) throw error
  },
}
