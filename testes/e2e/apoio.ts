import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Apoio dos testes E2E: fala com o Supabase via REST usando a MESMA chave
 * anon do app (nenhum privilégio extra — o que o teste consegue fazer,
 * qualquer navegador consegue).
 *
 * Os dois usuários de teste são fixos e reaproveitados entre execuções;
 * o preparo (`prepararUsuario`) os deixa sempre no mesmo estado inicial:
 * conta existente, sem casal, sem exclusão pendente.
 */

function lerEnvLocal(): Record<string, string> {
  const conteudo = readFileSync(join(import.meta.dirname, '..', '..', '.env.local'), 'utf8')
  const valores: Record<string, string> = {}
  for (const linha of conteudo.split('\n')) {
    const combinacao = linha.match(/^([A-Z_]+)=(.*)$/)
    if (combinacao) valores[combinacao[1]] = combinacao[2].trim()
  }
  return valores
}

const env = lerEnvLocal()
export const URL_SUPABASE = env.VITE_SUPABASE_URL
export const CHAVE_ANON = env.VITE_SUPABASE_ANON_KEY

export const USUARIO_UM = {
  email: 'e2e.um@mozii.test',
  senha: 'senha-e2e-mozii-1',
  nome: 'Pessoa Um',
}
export const USUARIO_DOIS = {
  email: 'e2e.dois@mozii.test',
  senha: 'senha-e2e-mozii-2',
  nome: 'Pessoa Dois',
}

async function chamarAuth(caminho: string, corpo: unknown): Promise<Response> {
  return fetch(`${URL_SUPABASE}/auth/v1/${caminho}`, {
    method: 'POST',
    headers: { apikey: CHAVE_ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  })
}

/** Entra com o usuário; se ainda não existir, cadastra antes. Retorna o JWT. */
export async function entrarOuCadastrar(usuario: typeof USUARIO_UM): Promise<string> {
  const entrada = await chamarAuth('token?grant_type=password', {
    email: usuario.email,
    password: usuario.senha,
  })
  if (entrada.ok) {
    const dados = await entrada.json()
    return dados.access_token
  }

  const cadastro = await chamarAuth('signup', {
    email: usuario.email,
    password: usuario.senha,
    data: { nome_exibicao: usuario.nome },
  })
  if (!cadastro.ok) {
    throw new Error(`não consegui preparar ${usuario.email}: ${await cadastro.text()}`)
  }
  const dados = await cadastro.json()
  if (!dados.access_token) {
    throw new Error(
      'cadastro sem sessão — o "Confirm email" do projeto Supabase precisa estar DESLIGADO para os testes',
    )
  }
  return dados.access_token
}

async function rpc(token: string, funcao: string, argumentos: unknown = {}): Promise<unknown> {
  const resposta = await fetch(`${URL_SUPABASE}/rest/v1/rpc/${funcao}`, {
    method: 'POST',
    headers: {
      apikey: CHAVE_ANON,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(argumentos),
  })
  if (!resposta.ok) {
    throw new Error(`rpc ${funcao} falhou: ${await resposta.text()}`)
  }
  const texto = await resposta.text()
  return texto ? JSON.parse(texto) : null
}

/** Deixa o usuário no estado inicial: logável, sem casal, sem exclusão pendente. */
export async function prepararUsuario(usuario: typeof USUARIO_UM): Promise<string> {
  const token = await entrarOuCadastrar(usuario)
  await rpc(token, 'cancelar_exclusao_conta')
  await rpc(token, 'sair_do_casal')
  return token
}

/** Cria um casal para o usuário (fixture de testes que não são sobre parear). */
export async function criarCasalPara(token: string): Promise<void> {
  await rpc(token, 'criar_casal')
}

/**
 * Forma o casal completo: o primeiro cria, o segundo entra com o código.
 * Os casais das execuções anteriores ficam vazios e o job diário
 * `limpar-casais-vazios` os recolhe (com as publicações, em cascata).
 */
export async function formarCasal(tokenUm: string, tokenDois: string): Promise<void> {
  const casal = (await rpc(tokenUm, 'criar_casal')) as { codigo_convite: string }
  await rpc(tokenDois, 'entrar_no_casal', { codigo: casal.codigo_convite })
}

/**
 * As tabelas de uma fase já existem no banco? Usado para pular specs com
 * uma mensagem clara enquanto o Diego ainda não aplicou as migrations.
 */
export async function tabelaExiste(token: string, tabela: string): Promise<boolean> {
  const resposta = await fetch(`${URL_SUPABASE}/rest/v1/${tabela}?select=*&limit=1`, {
    headers: { apikey: CHAVE_ANON, Authorization: `Bearer ${token}` },
  })
  return resposta.ok
}
