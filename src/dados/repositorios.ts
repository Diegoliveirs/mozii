import type {
  Casal,
  CasalComMembros,
  Comentario,
  ItemLista,
  Lista,
  MetaAtividade,
  PaginaDeFeed,
  Perfil,
  Publicacao,
  Reacao,
  RefFilme,
  UsuarioAutenticado,
} from '../dominio/tipos'

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

export interface RepositorioListas {
  listas(): Promise<Lista[]>
  itensDaLista(listaId: string): Promise<ItemLista[]>
  criarLista(nome: string): Promise<Lista>
  excluirLista(listaId: string): Promise<void>
  /**
   * Adiciona um filme à lista. Antes do INSERT, grava o filme no cache
   * global via RPC `gravar_filme()` — único caminho de escrita permitido.
   */
  adicionarFilme(listaId: string, filme: RefFilme): Promise<void>
  removerItem(itemId: string): Promise<void>
  marcarAssistido(itemId: string, assistido: boolean): Promise<void>
  /** Ids das listas do casal que já contêm este filme. */
  listasQueContem(tmdbId: number): Promise<string[]>
}

export interface RepositorioMural {
  /** Uma página do feed; `cursor` é o `criadoEm` do último item da anterior. */
  feed(cursor: string | null): Promise<PaginaDeFeed>
  publicacao(id: string): Promise<Publicacao | null>
  criarTexto(dados: { corpo: string | null; caminhoFoto: string | null }): Promise<Publicacao>
  criarAvaliacao(dados: {
    filme: RefFilme
    nota: number
    corpo: string | null
  }): Promise<Publicacao>
  editarAvaliacao(id: string, dados: { nota: number; corpo: string | null }): Promise<void>
  excluirPublicacao(id: string): Promise<void>
  /**
   * Atividade gerada NO CLIENTE ("X adicionou Y à lista Z") — decisão de
   * projeto: o formato pertence ao app, o banco só valida a presença do meta.
   */
  registrarAtividade(meta: MetaAtividade): Promise<void>
  comentarios(publicacaoId: string): Promise<Comentario[]>
  comentar(publicacaoId: string, corpo: string): Promise<Comentario>
  /** Reações e contagens em LOTE — uma consulta para o feed inteiro. */
  reacoesDe(publicacaoIds: string[]): Promise<Reacao[]>
  contagemComentarios(publicacaoIds: string[]): Promise<Record<string, number>>
  /** Reagiu com o mesmo emoji de novo = desfaz (toggle). */
  alternarReacao(publicacaoId: string, emoji: string): Promise<void>
  /**
   * Tempo real: chama `aoEvento(tabela)` a cada mudança nas tabelas do
   * casal. Retorna a função que cancela a inscrição.
   */
  subscreverAoCasal(casalId: string, aoEvento: (tabela: string) => void): () => void
}

export interface RepositorioArquivos {
  /** Envia a foto (já redimensionada) e retorna o caminho `{casal}/{uuid}.webp`. */
  enviarFoto(foto: Blob): Promise<string>
  /** URL assinada temporária para exibir uma foto privada. */
  urlFoto(caminho: string): Promise<string>
  apagarFotos(caminhos: string[]): Promise<void>
}

export interface Repositorios {
  autenticacao: RepositorioAutenticacao
  casal: RepositorioCasal
  listas: RepositorioListas
  mural: RepositorioMural
  arquivos: RepositorioArquivos
}
