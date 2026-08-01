/**
 * Leitura centralizada das variáveis de ambiente do frontend.
 * Se algo essencial faltar, o app mostra instruções em vez de uma tela em branco
 * (ver componente FaltaConfiguracao).
 */
const obrigatorias = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_TMDB_API_KEY'] as const

export type VariavelObrigatoria = (typeof obrigatorias)[number]

/** Retorna a lista de variáveis obrigatórias que não foram preenchidas. */
export function variaveisFaltando(): VariavelObrigatoria[] {
  return obrigatorias.filter((nome) => !import.meta.env[nome])
}

export const ambiente = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseChaveAnon: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  tmdbChave: import.meta.env.VITE_TMDB_API_KEY as string,
}
