import { expect, test, type Page } from '@playwright/test'
import { formarCasal, prepararUsuario, tabelaExiste, USUARIO_DOIS, USUARIO_UM } from './apoio'

/**
 * Fase 3 de ponta a ponta: publicar, curtir (like de coração), comentar
 * na visão detalhada (com update otimista) e — o mais importante —
 * o TEMPO REAL: o comentário do par aparece sem recarregar a página.
 *
 * Pula com aviso enquanto a migration 004 não estiver aplicada.
 */

let migracaoAplicada = false

test.beforeAll(async () => {
  const tokenUm = await prepararUsuario(USUARIO_UM)
  const tokenDois = await prepararUsuario(USUARIO_DOIS)
  migracaoAplicada = await tabelaExiste(tokenUm, 'publicacoes')
  if (migracaoAplicada) await formarCasal(tokenUm, tokenDois)
})

async function entrar(pagina: Page, usuario: typeof USUARIO_UM) {
  await pagina.goto('/entrar')
  await pagina.getByLabel('E-mail').fill(usuario.email)
  await pagina.getByLabel('Senha', { exact: true }).fill(usuario.senha)
  await pagina.getByRole('button', { name: 'Entrar', exact: true }).click()
  // A barra de navegação só existe dentro do app: é o sinal de "entrou".
  await expect(pagina.getByRole('link', { name: 'Momentos' })).toBeVisible()
}

test('publicar, curtir, comentar — e o par vê em tempo real', async ({ browser }) => {
  test.skip(!migracaoAplicada, 'aplicar 004_mural.sql antes (docs/03)')

  const contextoUm = await browser.newContext()
  const paginaUm = await contextoUm.newPage()
  await entrar(paginaUm, USUARIO_UM)

  // Publicar texto
  await paginaUm.getByRole('link', { name: 'Nova publicação' }).click()
  await paginaUm.getByPlaceholder('Escreve algo para vocês…').fill('Hoje é dia de maratona 💜')
  await paginaUm.getByRole('button', { name: 'Publicar' }).click()
  await expect(paginaUm.getByText('Hoje é dia de maratona 💜')).toBeVisible()

  // Curtir: o coração se preenche e vira "Descurtir"
  await paginaUm.getByRole('button', { name: 'Curtir' }).first().click()
  await expect(paginaUm.getByRole('button', { name: 'Descurtir' }).first()).toBeVisible()

  // Comentar: o balão abre a visão detalhada (otimista: aparece na hora)
  await paginaUm.getByRole('button', { name: 'Comentar' }).first().click()
  await expect(paginaUm.getByRole('heading', { name: 'Publicação' })).toBeVisible()
  await paginaUm.getByPlaceholder('Comentar…').fill('primeiro! 🍿')
  await paginaUm.getByRole('button', { name: 'Enviar' }).click()
  await expect(paginaUm.getByText('primeiro! 🍿')).toBeVisible()

  // ── O par entra em outra janela e comenta ───────────────────────────
  const contextoDois = await browser.newContext()
  const paginaDois = await contextoDois.newPage()
  await entrar(paginaDois, USUARIO_DOIS)

  await expect(paginaDois.getByText('Hoje é dia de maratona 💜')).toBeVisible()
  await paginaDois.getByRole('button', { name: 'Comentar' }).first().click()
  await paginaDois.getByPlaceholder('Comentar…').fill('resposta em tempo real ⚡')
  await paginaDois.getByRole('button', { name: 'Enviar' }).click()

  // TEMPO REAL: a janela da Pessoa Um NÃO recarrega — o comentário chega via socket.
  await expect(paginaUm.getByText('resposta em tempo real ⚡')).toBeVisible({ timeout: 15_000 })

  // Excluir a publicação (só o autor): a lixeira no topo do detalhe
  await paginaUm.getByRole('button', { name: 'Excluir publicação' }).click()
  await paginaUm.getByRole('button', { name: 'Confirmar' }).click()
  await expect(paginaUm.getByText('Hoje é dia de maratona 💜')).toHaveCount(0)

  await contextoUm.close()
  await contextoDois.close()
})

test('avaliação com meia estrela aparece no Mural', async ({ browser }) => {
  test.skip(!migracaoAplicada, 'aplicar 004_mural.sql antes (docs/03)')

  const contexto = await browser.newContext()
  const pagina = await contexto.newPage()
  await entrar(pagina, USUARIO_UM)

  await pagina.getByRole('link', { name: 'Nova publicação' }).click()
  await pagina.getByRole('button', { name: 'Avaliar um filme' }).click()
  await pagina.getByPlaceholder('Busque um filme…').fill('Interestelar')
  await pagina
    .getByRole('button', { name: /Interestelar \(2014\)/ })
    .first()
    .click()

  await pagina.getByRole('button', { name: '4.5 estrelas' }).click()
  await pagina.getByPlaceholder('Escreve algo para vocês…').fill('Chorei de novo.')
  await pagina.getByRole('button', { name: 'Publicar' }).click()

  await expect(pagina.getByRole('link', { name: 'Momentos' })).toBeVisible()
  await expect(pagina.getByText('Interestelar', { exact: false }).first()).toBeVisible()
  await expect(pagina.getByLabel('Nota 4.5 de 5').first()).toBeVisible()
  await expect(pagina.getByText('Chorei de novo.')).toBeVisible()

  await contexto.close()
})
