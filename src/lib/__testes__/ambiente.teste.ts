import { afterEach, describe, expect, it, vi } from 'vitest'
import { variaveisFaltando } from '../ambiente'

describe('variaveisFaltando', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('retorna vazio quando todas as variáveis estão preenchidas', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://exemplo.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'chave-anon')
    vi.stubEnv('VITE_TMDB_API_KEY', 'chave-tmdb')

    expect(variaveisFaltando()).toEqual([])
  })

  it('aponta exatamente as variáveis ausentes', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://exemplo.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    vi.stubEnv('VITE_TMDB_API_KEY', '')

    expect(variaveisFaltando()).toEqual(['VITE_SUPABASE_ANON_KEY', 'VITE_TMDB_API_KEY'])
  })
})
