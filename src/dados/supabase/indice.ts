import type { Repositorios } from '../repositorios'
import { repositorioArquivosSupabase } from './RepositorioArquivosSupabase'
import { repositorioAutenticacaoSupabase } from './RepositorioAutenticacaoSupabase'
import { repositorioCasalSupabase } from './RepositorioCasalSupabase'
import { repositorioFavoritosSupabase } from './RepositorioFavoritosSupabase'
import { repositorioListasSupabase } from './RepositorioListasSupabase'
import { repositorioMomentosSupabase } from './RepositorioMomentosSupabase'
import { repositorioMuralSupabase } from './RepositorioMuralSupabase'

/** Fábrica das implementações Supabase — o único ponto de troca de backend. */
export function criarRepositoriosSupabase(): Repositorios {
  return {
    autenticacao: repositorioAutenticacaoSupabase,
    casal: repositorioCasalSupabase,
    listas: repositorioListasSupabase,
    mural: repositorioMuralSupabase,
    arquivos: repositorioArquivosSupabase,
    momentos: repositorioMomentosSupabase,
    favoritos: repositorioFavoritosSupabase,
  }
}
