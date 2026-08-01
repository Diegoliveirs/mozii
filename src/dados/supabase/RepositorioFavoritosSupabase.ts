import type { RepositorioFavoritos } from '../repositorios'
import type { Favorito, RefFilme } from '../../dominio/tipos'
import { supabase } from './cliente'
import { paraFavorito, type LinhaFavorito } from './mapeadores'

async function idDoUsuario(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  const id = data.session?.user.id
  if (!id) throw new Error('sem sessão ativa')
  return id
}

/**
 * Os até 5 filmes favoritos de cada PESSOA (acompanham a pessoa entre
 * pareamentos — ver migration 007); o casal vê os dois.
 */
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

    const { error } = await supabase.from('favoritos').insert({
      perfil_id: await idDoUsuario(),
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
