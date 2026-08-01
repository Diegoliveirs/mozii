import { expect, test, type Page } from '@playwright/test'
import { prepararUsuario, USUARIO_DOIS, USUARIO_UM } from './apoio'

/**
 * O teste mais importante da Fase 1: a jornada completa do casal.
 * Duas janelas independentes (uma por pessoa), contra o Supabase real.
 */

test.beforeAll(async () => {
  await prepararUsuario(USUARIO_UM)
  await prepararUsuario(USUARIO_DOIS)
})

async function entrarPelaTela(pagina: Page, usuario: typeof USUARIO_UM) {
  await pagina.goto('/entrar')
  await pagina.getByLabel('E-mail').fill(usuario.email)
  await pagina.getByLabel('Senha', { exact: true }).fill(usuario.senha)
  await pagina.getByRole('button', { name: 'Entrar', exact: true }).click()
}

test('o casal se forma: um cria o espaço, o outro entra com o código', async ({ browser }) => {
  // ── Pessoa Um: entra e cria o espaço ────────────────────────────────
  const contextoUm = await browser.newContext()
  const paginaUm = await contextoUm.newPage()

  await entrarPelaTela(paginaUm, USUARIO_UM)
  // Sem casal, a guarda leva para o pareamento.
  await expect(paginaUm.getByRole('heading', { name: 'Falta uma pessoa 💜' })).toBeVisible()

  await paginaUm.getByRole('button', { name: 'Criar espaço do casal' }).click()
  const codigo = (await paginaUm.getByTestId('codigo-convite').textContent())?.trim() ?? ''
  expect(codigo).toHaveLength(6)

  await paginaUm.getByRole('button', { name: 'Ir para o Mozii' }).click()
  await expect(paginaUm.getByRole('heading', { name: 'Mural' })).toBeVisible()
  // Sozinho no espaço: a dica do código aparece.
  await expect(paginaUm.getByText('Seu par ainda não entrou', { exact: false })).toBeVisible()

  // ── Pessoa Dois: código errado primeiro, depois o certo ─────────────
  const contextoDois = await browser.newContext()
  const paginaDois = await contextoDois.newPage()

  await entrarPelaTela(paginaDois, USUARIO_DOIS)
  await expect(paginaDois.getByRole('heading', { name: 'Falta uma pessoa 💜' })).toBeVisible()

  const campoCodigo = paginaDois.getByLabel('Código de convite')
  await campoCodigo.fill('ZZZZZ9')
  await paginaDois.getByRole('button', { name: 'Entrar no espaço' }).click()
  await expect(paginaDois.getByText('Código inválido', { exact: false })).toBeVisible()

  await campoCodigo.fill(codigo)
  await paginaDois.getByRole('button', { name: 'Entrar no espaço' }).click()

  // Entrou: Mural com os dois nomes unidos pelo coração.
  await expect(paginaDois.getByRole('heading', { name: 'Mural' })).toBeVisible()
  await expect(paginaDois.getByText('Pessoa Um ♥ Pessoa Dois')).toBeVisible()

  // ── Ajustes (via engrenagem do Perfil): sem código com o casal completo ──
  await paginaDois.getByRole('link', { name: 'Perfil', exact: true }).click()
  await paginaDois.getByRole('link', { name: 'Ajustes' }).click()
  await expect(paginaDois.getByText('Pessoa Um', { exact: false })).toBeVisible()
  await expect(paginaDois.getByText('Código de convite')).toHaveCount(0)

  await contextoUm.close()
  await contextoDois.close()
})

test('cadastro pela tela leva ao pareamento', async ({ browser }) => {
  // Usuário Um já existe e está sem casal (preparo). O cadastro pela tela
  // com e-mail existente deve mostrar a mensagem amigável.
  const contexto = await browser.newContext()
  const pagina = await contexto.newPage()

  await pagina.goto('/cadastro')
  await pagina.getByLabel('Seu nome').fill(USUARIO_UM.nome)
  await pagina.getByLabel('E-mail').fill(USUARIO_UM.email)
  await pagina.getByLabel('Senha', { exact: false }).fill('senha-diferente-123')
  await pagina.getByRole('button', { name: 'Criar conta' }).click()

  await expect(pagina.getByText('Este e-mail já tem conta', { exact: false })).toBeVisible()

  await contexto.close()
})
