import type { PreferenciasNotificacao, RepositorioNotificacoes } from '../repositorios'
import { supabase } from './cliente'

const TUDO_LIGADO: PreferenciasNotificacao = {
  comentarios: true,
  publicacoes: true,
  curtidas: true,
  memorias: true,
  listas: true,
  casal: true,
}

async function usuarioAtualId(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  const id = data.session?.user.id
  if (!id) throw new Error('sem sessão ativa')
  return id
}

/** Inscrições de push e preferências de notificação (migration 008). */
export const repositorioNotificacoesSupabase: RepositorioNotificacoes = {
  async salvarInscricao({ endpoint, p256dh, auth }) {
    const perfilId = await usuarioAtualId()
    // upsert pelo endpoint: reinstalar o app renova a mesma inscrição.
    const { error } = await supabase
      .from('inscricoes_push')
      .upsert({ perfil_id: perfilId, endpoint, p256dh, auth }, { onConflict: 'endpoint' })
    if (error) throw error
  },

  async removerInscricao(endpoint) {
    const { error } = await supabase.from('inscricoes_push').delete().eq('endpoint', endpoint)
    if (error) throw error
  },

  async preferencias() {
    const perfilId = await usuarioAtualId()
    const { data, error } = await supabase
      .from('preferencias_notificacao')
      .select('comentarios, publicacoes, curtidas, memorias, listas, casal')
      .eq('perfil_id', perfilId)
      .maybeSingle()
    if (error) throw error
    return (data as PreferenciasNotificacao | null) ?? TUDO_LIGADO
  },

  async salvarPreferencias(parcial) {
    const perfilId = await usuarioAtualId()
    const atuais = await this.preferencias()
    const { error } = await supabase
      .from('preferencias_notificacao')
      .upsert({ perfil_id: perfilId, ...atuais, ...parcial })
    if (error) throw error
  },
}
