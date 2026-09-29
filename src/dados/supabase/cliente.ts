import { createClient } from '@supabase/supabase-js'
import { ambiente } from '../../lib/ambiente'

/**
 * Cliente Supabase único do app. Este arquivo (e os vizinhos desta pasta)
 * são os ÚNICOS que importam `@supabase/supabase-js`.
 */
export const supabase = createClient(ambiente.supabaseUrl, ambiente.supabaseChaveAnon, {
  auth: {
    // Sessão do PWA fica no localStorage e sobrevive a fechar/reabrir ou atualizar o app.
    persistSession: true,
    autoRefreshToken: true,
    // PKCE: o retorno do link só vira sessão se o fluxo começou NESTE
    // navegador (verificador guardado no cadastro). No fluxo implícito
    // padrão, qualquer link com `#access_token=` de outra conta trocava a
    // sessão de quem abrisse — ver docs/01-arquitetura.md § Decisões.
    flowType: 'pkce',
    // Processa o retorno do link de confirmação em /confirmar-email.
    detectSessionInUrl: true,
  },
})

// Na Fase 3 (tempo real), o JWT precisa ser reenviado ao socket a cada
// mudança de sessão — sem isso a RLS silencia os eventos sem dar erro.
supabase.auth.onAuthStateChange((_evento, sessao) => {
  supabase.realtime.setAuth(sessao?.access_token ?? null)
})
