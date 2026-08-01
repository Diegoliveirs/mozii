import type { Casal, CasalComMembros, Perfil, UsuarioAutenticado } from '../dominio/tipos'

/**
 * Contrato da camada de dados. As telas e hooks só conhecem estas interfaces;
 * a implementação Supabase vive isolada em `src/dados/supabase/`.
 * Trocar de backend um dia = reimplementar estas interfaces, e nada mais.
 */

export interface RepositorioAutenticacao {
  cadastrar(dados: { email: string; senha: string; nomeExibicao: string }): Promise<void>
  entrar(dados: { email: string; senha: string }): Promise<void>
  sair(): Promise<void>
  usuarioAtual(): Promise<UsuarioAutenticado | null>
  /** Retorna a função que cancela a inscrição. */
  aoMudarAutenticacao(escutar: (usuario: UsuarioAutenticado | null) => void): () => void
}

export interface RepositorioCasal {
  meuPerfil(): Promise<Perfil | null>
  casalComMembros(): Promise<CasalComMembros | null>
  criarCasal(): Promise<Casal>
  /**
   * Entra no casal pelo código de convite.
   * Retorna `null` quando o código não existe (o banco devolve NULL de
   * propósito — ver cabeçalho da migration 001). Casal cheio e excesso de
   * tentativas chegam como erro com mensagem em português, vinda do banco.
   */
  entrarNoCasal(codigo: string): Promise<Casal | null>
  sairDoCasal(): Promise<void>
  atualizarNomeExibicao(nome: string): Promise<void>
  atualizarDataAniversario(data: string | null): Promise<void>
  solicitarExclusaoConta(): Promise<void>
  cancelarExclusaoConta(): Promise<void>
}

export interface Repositorios {
  autenticacao: RepositorioAutenticacao
  casal: RepositorioCasal
}
