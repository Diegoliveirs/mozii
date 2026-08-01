import type { RepositorioCasal } from '../repositorios'
import type { Casal, CasalComMembros, Perfil } from '../../dominio/tipos'
import { supabase } from './cliente'
import { paraCasal, paraPerfil } from './mapeadores'

async function idDoUsuario(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  const id = data.session?.user.id
  if (!id) throw new Error('sem sessão ativa')
  return id
}

/**
 * Perfil e casal. Criar/entrar/sair passam SEMPRE pelas RPCs da migration 001
 * — o UPDATE direto em `casal_id` é negado pelo banco.
 */
export const repositorioCasalSupabase: RepositorioCasal = {
  async meuPerfil(): Promise<Perfil | null> {
    const { data: sessao } = await supabase.auth.getSession()
    const id = sessao.session?.user.id
    if (!id) return null

    const { data, error } = await supabase.from('perfis').select().eq('id', id).maybeSingle()
    if (error) throw error
    return data ? paraPerfil(data) : null
  },

  async casalComMembros(): Promise<CasalComMembros | null> {
    const perfil = await this.meuPerfil()
    if (!perfil?.casalId) return null

    const [casal, membros] = await Promise.all([
      supabase.from('casais').select().eq('id', perfil.casalId).single(),
      supabase.from('perfis').select().eq('casal_id', perfil.casalId).order('criado_em'),
    ])
    if (casal.error) throw casal.error
    if (membros.error) throw membros.error

    return { casal: paraCasal(casal.data), membros: membros.data.map(paraPerfil) }
  },

  async criarCasal(): Promise<Casal> {
    const { data, error } = await supabase.rpc('criar_casal')
    if (error) throw error
    return paraCasal(Array.isArray(data) ? data[0] : data)
  },

  async entrarNoCasal(codigo: string): Promise<Casal | null> {
    const { data, error } = await supabase.rpc('entrar_no_casal', { codigo })
    if (error) throw error
    // Código inválido volta como NULL — que, dependendo da versão do
    // PostgREST, chega como null ou como registro de campos todos nulos.
    const linha = Array.isArray(data) ? data[0] : data
    return linha?.id ? paraCasal(linha) : null
  },

  async sairDoCasal() {
    const { error } = await supabase.rpc('sair_do_casal')
    if (error) throw error
  },

  async atualizarNomeExibicao(nome: string) {
    const { error } = await supabase
      .from('perfis')
      .update({ nome_exibicao: nome })
      .eq('id', await idDoUsuario())
    if (error) throw error
  },

  async atualizarDataAniversario(data: string | null) {
    const perfil = await this.meuPerfil()
    if (!perfil?.casalId) throw new Error('sem casal para atualizar')

    const { error } = await supabase
      .from('casais')
      .update({ data_aniversario: data })
      .eq('id', perfil.casalId)
    if (error) throw error
  },

  async solicitarExclusaoConta() {
    const { error } = await supabase.rpc('solicitar_exclusao_conta')
    if (error) throw error
  },

  async cancelarExclusaoConta() {
    const { error } = await supabase.rpc('cancelar_exclusao_conta')
    if (error) throw error
  },
}
