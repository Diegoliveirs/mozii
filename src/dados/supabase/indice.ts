import type { Repositorios } from '../repositorios'
import { repositorioAutenticacaoSupabase } from './RepositorioAutenticacaoSupabase'
import { repositorioCasalSupabase } from './RepositorioCasalSupabase'
import { repositorioListasSupabase } from './RepositorioListasSupabase'

/** Fábrica das implementações Supabase — o único ponto de troca de backend. */
export function criarRepositoriosSupabase(): Repositorios {
  return {
    autenticacao: repositorioAutenticacaoSupabase,
    casal: repositorioCasalSupabase,
    listas: repositorioListasSupabase,
  }
}
