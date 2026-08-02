import type { RepositorioAutenticacao } from '../repositorios'
import type { UsuarioAutenticado } from '../../dominio/tipos'
import { supabase } from './cliente'

/**
 * Autenticação por e-mail e senha via Supabase Auth.
 * O `nome_exibicao` viaja nos metadados do cadastro — o trigger
 * `ao_criar_usuario` (migration 001) cria o perfil com ele.
 */
export const repositorioAutenticacaoSupabase: RepositorioAutenticacao = {
  async cadastrar({ email, senha, nomeExibicao }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome_exibicao: nomeExibicao } },
    })
    if (error) throw error
    // Com confirmação ativa, e-mail repetido volta como "sucesso" sem
    // identities (anti-enumeração do Supabase) — traduzimos para o erro
    // que a tela de cadastro já sabe explicar.
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      throw new Error('User already registered')
    }
    // Sem sessão = a confirmação de e-mail está ativa no projeto.
    return { precisaConfirmarEmail: !data.session }
  },

  async reenviarConfirmacao(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) throw error
  },

  async entrar({ email, senha }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw error
  },

  async sair() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async usuarioAtual(): Promise<UsuarioAutenticado | null> {
    const { data } = await supabase.auth.getSession()
    const usuario = data.session?.user
    return usuario ? { id: usuario.id, email: usuario.email ?? null } : null
  },

  aoMudarAutenticacao(escutar) {
    const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      const usuario = sessao?.user
      escutar(usuario ? { id: usuario.id, email: usuario.email ?? null } : null)
    })
    return () => data.subscription.unsubscribe()
  },
}
