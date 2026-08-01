import { expect, test } from '@playwright/test'
import { criarCasalPara, prepararUsuario, tabelaExiste, USUARIO_UM } from './apoio'

/**
 * Fase 2 de ponta a ponta: busca real no TMDB, lista do casal, marcar
 * assistido e o sorteio caça-níquel. Usa "Cidade de Deus" (tmdb 598) —
 * título estável, sempre com provedores no Brasil.
 *
 * Pula com aviso enquanto as migrations 002/003 não estiverem aplicadas.
 */

let migracoesAplicadas = false

test.beforeAll(async () => {
  const token = await prepararUsuario(USUARIO_UM)
  migracoesAplicadas = await tabelaExiste(token, 'listas')
  if (migracoesAplicadas) await criarCasalPara(token)
})

test('buscar filme, montar lista, marcar assistido e sortear', async ({ page }) => {
  test.skip(!migracoesAplicadas, 'aplicar 002_filmes.sql e 003_listas.sql antes (docs/03)')

  // Entrar
  await page.goto('/entrar')
  await page.getByLabel('E-mail').fill(USUARIO_UM.email)
  await page.getByLabel('Senha', { exact: true }).fill(USUARIO_UM.senha)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Mural' })).toBeVisible()

  // Buscar no TMDB
  await page.getByRole('link', { name: 'Cinema' }).click()
  await page.getByPlaceholder('Busque um filme…').fill('Cidade de Deus')
  const resultado = page.getByRole('link', { name: /Cidade de Deus \(2002\)/ })
  await expect(resultado).toBeVisible({ timeout: 15_000 })
  await resultado.click()

  // Página do filme
  await expect(page.getByRole('heading', { name: 'Cidade de Deus' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Onde assistir' })).toBeVisible()

  // Adicionar à lista nova (criada na própria folha)
  await page.getByRole('button', { name: 'Adicionar à lista' }).click()
  await page.getByPlaceholder('Nome da nova lista').fill('Para ver juntos')
  await page.getByRole('button', { name: 'Criar lista' }).click()
  await expect(page.getByText('✓ já está')).toBeVisible()
  await page.locator('[role=dialog]').click({ position: { x: 10, y: 10 } })

  // A lista mostra o item
  await page.getByRole('link', { name: 'Cinema' }).click()
  await page.getByRole('tab', { name: 'Listas' }).click()
  await page.getByRole('link', { name: /Para ver juntos/ }).click()
  // Pôster e título são dois links para o mesmo filme — basta o primeiro.
  await expect(page.getByRole('link', { name: 'Cidade de Deus' }).first()).toBeVisible()
  await expect(page.getByText('0 de 1 assistidos')).toBeVisible()

  // Marcar assistido: sorteio desabilita e aparece a celebração
  await page.getByRole('button', { name: 'Marcar como assistido' }).click()
  await expect(page.getByText('Vocês já viram tudo desta lista! 🎉')).toBeVisible()
  await expect(page.getByRole('button', { name: '🎲 O que ver hoje' })).toBeDisabled()

  // Desmarcar e sortear: o caça-níquel revela o único não-assistido
  await page.getByRole('button', { name: 'Desmarcar assistido' }).click()
  await page.getByRole('button', { name: '🎲 O que ver hoje' }).click()
  const modal = page.getByRole('dialog', { name: 'O que ver hoje' })
  await expect(modal).toBeVisible()
  await expect(modal.getByText('Cidade de Deus', { exact: false })).toBeVisible({ timeout: 5_000 })
  await expect(modal.getByRole('link', { name: 'Ver o filme' })).toBeVisible()

  // Limpeza: excluir a lista para a próxima execução começar do zero
  await modal.click({ position: { x: 5, y: 5 } })
  await page.getByRole('button', { name: 'Excluir lista' }).click()
  await page.getByRole('button', { name: 'Confirmar' }).click()
  await expect(page.getByRole('tab', { name: 'Listas' })).toBeVisible()
})
