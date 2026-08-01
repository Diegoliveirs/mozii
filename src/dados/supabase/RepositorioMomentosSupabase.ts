import type { RepositorioMomentos } from '../repositorios'
import type { Momento } from '../../dominio/tipos'
import { supabase } from './cliente'
import { paraMomento } from './mapeadores'
import { repositorioArquivosSupabase } from './RepositorioArquivosSupabase'

async function sessaoAtual(): Promise<{ usuarioId: string; casalId: string }> {
  const { data } = await supabase.auth.getSession()
  const usuarioId = data.session?.user.id
  if (!usuarioId) throw new Error('sem sessão ativa')

  const perfil = await supabase.from('perfis').select('casal_id').eq('id', usuarioId).single()
  if (perfil.error) throw perfil.error
  if (!perfil.data.casal_id) throw new Error('sem casal')

  return { usuarioId, casalId: perfil.data.casal_id }
}

/** O diário do casal. Cada memória tem um espelho no Mural (tipo 'momento'). */
export const repositorioMomentosSupabase: RepositorioMomentos = {
  async linhaDoTempo(): Promise<Momento[]> {
    // Sem paginação de propósito: é o diário de DUAS pessoas — anos de
    // memórias cabem numa consulta. Revisitar só se um dia pesar.
    const { data, error } = await supabase
      .from('momentos')
      .select()
      .order('aconteceu_em', { ascending: false })
      .order('criado_em', { ascending: false })
    if (error) throw error
    return data.map(paraMomento)
  },

  async criar(dados): Promise<Momento> {
    const { usuarioId, casalId } = await sessaoAtual()

    const { data, error } = await supabase
      .from('momentos')
      .insert({
        casal_id: casalId,
        autor_id: usuarioId,
        legenda: dados.legenda,
        aconteceu_em: dados.aconteceuEm,
        caminhos_fotos: dados.caminhosFotos,
      })
      .select()
      .single()
    if (error) throw error
    const momento = paraMomento(data)

    // Espelho no Mural. Se falhar, desfaz a memória: ou existe nas duas
    // telas, ou não existe em nenhuma.
    const espelho = await supabase.from('publicacoes').insert({
      casal_id: casalId,
      autor_id: usuarioId,
      tipo: 'momento',
      corpo: dados.legenda,
      meta_atividade: { momento_id: momento.id, caminhos_fotos: dados.caminhosFotos },
    })
    if (espelho.error) {
      await supabase.from('momentos').delete().eq('id', momento.id)
      throw espelho.error
    }

    return momento
  },

  async excluir(momento): Promise<void> {
    // Espelho primeiro, depois a memória; fotos por último (melhor esforço —
    // se a remoção do arquivo falhar, a RLS já o deixa inacessível).
    const espelho = await supabase
      .from('publicacoes')
      .delete()
      .eq('tipo', 'momento')
      .eq('meta_atividade->>momento_id', momento.id)
    if (espelho.error) throw espelho.error

    const { error } = await supabase.from('momentos').delete().eq('id', momento.id)
    if (error) throw error

    await repositorioArquivosSupabase.apagarFotos(momento.caminhosFotos).catch(() => {})
  },
}
