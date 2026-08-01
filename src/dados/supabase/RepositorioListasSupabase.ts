import type { RepositorioListas } from '../repositorios'
import type { ItemLista, Lista, RefFilme } from '../../dominio/tipos'
import { supabase } from './cliente'
import { paraFilme } from './mapeadores'

async function idDoUsuario(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  const id = data.session?.user.id
  if (!id) throw new Error('sem sessão ativa')
  return id
}

/**
 * Listas do casal. O escopo (só as listas do MEU casal) é garantido pela
 * RLS — as consultas aqui nem precisam filtrar por casal.
 */
export const repositorioListasSupabase: RepositorioListas = {
  async listas(): Promise<Lista[]> {
    // Uma consulta só: listas + itens aninhados (contagens e capa
    // calculadas aqui, não no banco — são poucas dezenas de itens).
    const { data, error } = await supabase
      .from('listas')
      .select('id, nome, criado_por, criado_em, itens_lista(assistido, filmes(caminho_poster))')
      .order('criado_em', { ascending: false })
    if (error) throw error

    return data.map((linha) => {
      const itens = linha.itens_lista as unknown as Array<{
        assistido: boolean
        filmes: { caminho_poster: string | null } | null
      }>
      return {
        id: linha.id,
        nome: linha.nome,
        criadoPor: linha.criado_por,
        criadoEm: linha.criado_em,
        qtdItens: itens.length,
        qtdAssistidos: itens.filter((item) => item.assistido).length,
        postersCapa: itens
          .map((item) => item.filmes?.caminho_poster)
          .filter((caminho): caminho is string => !!caminho)
          .slice(0, 3),
      }
    })
  },

  async itensDaLista(listaId: string): Promise<ItemLista[]> {
    const { data, error } = await supabase
      .from('itens_lista')
      .select('id, lista_id, assistido, adicionado_por, criado_em, filmes(*)')
      .eq('lista_id', listaId)
      .order('criado_em', { ascending: false })
    if (error) throw error

    return data.map((linha) => ({
      id: linha.id,
      listaId: linha.lista_id,
      assistido: linha.assistido,
      adicionadoPor: linha.adicionado_por,
      criadoEm: linha.criado_em,
      filme: paraFilme(linha.filmes as never),
    }))
  },

  async criarLista(nome: string): Promise<Lista> {
    const { data: perfil, error: erroPerfil } = await supabase
      .from('perfis')
      .select('casal_id')
      .eq('id', await idDoUsuario())
      .single()
    if (erroPerfil) throw erroPerfil

    const { data, error } = await supabase
      .from('listas')
      .insert({ nome, casal_id: perfil.casal_id, criado_por: await idDoUsuario() })
      .select()
      .single()
    if (error) throw error

    return {
      id: data.id,
      nome: data.nome,
      criadoPor: data.criado_por,
      criadoEm: data.criado_em,
      qtdItens: 0,
      qtdAssistidos: 0,
      postersCapa: [],
    }
  },

  async excluirLista(listaId: string) {
    const { error } = await supabase.from('listas').delete().eq('id', listaId)
    if (error) throw error
  },

  async adicionarFilme(listaId: string, filme: RefFilme) {
    const { error: erroCache } = await supabase.rpc('gravar_filme', {
      p_tmdb_id: filme.tmdbId,
      p_titulo: filme.titulo,
      p_caminho_poster: filme.caminhoPoster,
      p_ano_lancamento: filme.anoLancamento,
    })
    if (erroCache) throw erroCache

    const { error } = await supabase.from('itens_lista').insert({
      lista_id: listaId,
      tmdb_id: filme.tmdbId,
      adicionado_por: await idDoUsuario(),
    })
    if (error) throw error
  },

  async removerItem(itemId: string) {
    const { error } = await supabase.from('itens_lista').delete().eq('id', itemId)
    if (error) throw error
  },

  async marcarAssistido(itemId: string, assistido: boolean) {
    const { error } = await supabase.from('itens_lista').update({ assistido }).eq('id', itemId)
    if (error) throw error
  },

  async listasQueContem(tmdbId: number): Promise<string[]> {
    const { data, error } = await supabase
      .from('itens_lista')
      .select('lista_id')
      .eq('tmdb_id', tmdbId)
    if (error) throw error
    return data.map((linha) => linha.lista_id)
  },
}
