import type { RepositorioArquivos } from '../repositorios'
import { supabase } from './cliente'

const BUCKET = 'fotos'

async function casalDaSessao(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  const usuarioId = data.session?.user.id
  if (!usuarioId) throw new Error('sem sessão ativa')

  const perfil = await supabase.from('perfis').select('casal_id').eq('id', usuarioId).single()
  if (perfil.error) throw perfil.error
  if (!perfil.data.casal_id) throw new Error('sem casal')
  return perfil.data.casal_id
}

/**
 * Fotos privadas do casal no bucket `fotos`.
 * O caminho é sempre `{casal_id}/{uuid}.webp` — a RLS do Storage garante
 * que cada casal só enxerga a própria pasta.
 */
export const repositorioArquivosSupabase: RepositorioArquivos = {
  async enviarFoto(foto: Blob): Promise<string> {
    const casalId = await casalDaSessao()
    const caminho = `${casalId}/${crypto.randomUUID()}.webp`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(caminho, foto, { contentType: 'image/webp' })
    if (error) throw error
    return caminho
  },

  async urlFoto(caminho: string): Promise<string> {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(caminho, 3600)
    if (error) throw error
    return data.signedUrl
  },

  async apagarFotos(caminhos: string[]): Promise<void> {
    if (caminhos.length === 0) return
    const { error } = await supabase.storage.from(BUCKET).remove(caminhos)
    if (error) throw error
  },
}
