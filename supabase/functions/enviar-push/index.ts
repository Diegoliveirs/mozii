/*
 * Edge Function enviar-push — o carteiro do Mozii.
 *
 * Chamada pelo banco (notificar_par → pg_net) com o segredo compartilhado
 * no header X-Segredo. Monta o texto em português do tipo recebido, busca
 * as inscrições do destinatário e envia via Web Push (VAPID). Endpoints
 * mortos (404/410) são apagados na hora.
 *
 * Deploy e secrets: ver docs/03-roteiros-sql.md § 008 (o Diego executa).
 */
import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2'

interface CorpoDoGatilho {
  destinatario: string
  tipo: 'comentarios' | 'publicacoes' | 'curtidas' | 'memorias' | 'listas' | 'casal'
  nomeAutor: string
  dados: {
    publicacaoId?: string
    tipoPublicacao?: string
    trecho?: string
    nota?: number
    tituloFilme?: string
    nomeLista?: string
  }
}

interface Mensagem {
  titulo: string
  corpo: string
  url: string
}

/** O texto de cada tipo, no tom do app. A `url` é relativa ao escopo do SW. */
function montarMensagem({ tipo, nomeAutor, dados }: CorpoDoGatilho): Mensagem {
  const urlPublicacao = dados.publicacaoId ? `/publicacao/${dados.publicacaoId}` : '/'
  switch (tipo) {
    case 'comentarios':
      return {
        titulo: `${nomeAutor} comentou 💬`,
        corpo: dados.trecho ? `"${dados.trecho}"` : 'Toca para ver a conversa.',
        url: urlPublicacao,
      }
    case 'publicacoes':
      if (dados.tipoPublicacao === 'avaliacao' && dados.tituloFilme) {
        return {
          titulo: `${nomeAutor} avaliou ${dados.tituloFilme} ⭐`,
          corpo: dados.nota
            ? `Nota ${dados.nota} de 5${dados.trecho ? ` — "${dados.trecho}"` : ''}`
            : (dados.trecho ?? ''),
          url: urlPublicacao,
        }
      }
      return {
        titulo: `${nomeAutor} publicou no Mural`,
        corpo: dados.trecho ? `"${dados.trecho}"` : 'Toca para ver.',
        url: urlPublicacao,
      }
    case 'curtidas':
      return {
        titulo: `${nomeAutor} curtiu sua publicação ❤️`,
        corpo: 'Toca para ver.',
        url: urlPublicacao,
      }
    case 'memorias':
      return {
        titulo: `${nomeAutor} guardou uma memória 📔`,
        corpo: dados.trecho ? `"${dados.trecho}"` : 'Toca para ver o diário de vocês.',
        url: '/momentos',
      }
    case 'listas':
      return {
        titulo: `${nomeAutor} adicionou ${dados.tituloFilme ?? 'um filme'} 🎬`,
        corpo: dados.nomeLista ? `Na lista ${dados.nomeLista}.` : 'Toca para ver as listas.',
        url: '/cinema?aba=listas',
      }
    case 'casal':
      return {
        titulo: `${nomeAutor} entrou no espaço de vocês 💜`,
        corpo: 'Agora são vocês dois. Publiquem algo!',
        url: '/',
      }
  }
}

Deno.serve(async (requisicao) => {
  if (requisicao.headers.get('x-segredo') !== Deno.env.get('SEGREDO_GATILHO')) {
    return new Response('não autorizado', { status: 401 })
  }

  const corpo = (await requisicao.json()) as CorpoDoGatilho
  const mensagem = montarMensagem(corpo)

  webpush.setVapidDetails(
    'mailto:diego.oliveira@tbmtextil.com.br',
    Deno.env.get('VAPID_CHAVE_PUBLICA')!,
    Deno.env.get('VAPID_CHAVE_PRIVADA')!,
  )

  // Service role: a função lê as inscrições de qualquer pessoa (RLS não vale aqui).
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: inscricoes, error } = await supabase
    .from('inscricoes_push')
    .select('endpoint, p256dh, auth')
    .eq('perfil_id', corpo.destinatario)
  if (error) return new Response(error.message, { status: 500 })

  let enviadas = 0
  let removidas = 0
  for (const inscricao of inscricoes ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: inscricao.endpoint, keys: { p256dh: inscricao.p256dh, auth: inscricao.auth } },
        JSON.stringify(mensagem),
      )
      enviadas++
    } catch (excecao) {
      const status = (excecao as { statusCode?: number }).statusCode
      // 404/410: o aparelho cancelou a inscrição — limpar do banco.
      if (status === 404 || status === 410) {
        await supabase.from('inscricoes_push').delete().eq('endpoint', inscricao.endpoint)
        removidas++
      }
    }
  }

  return new Response(JSON.stringify({ enviadas, removidas }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
