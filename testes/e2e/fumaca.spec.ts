import { expect, test } from '@playwright/test'

/**
 * Teste de fumaça da Fase 0: o app sobe, renderiza a tela inicial
 * e não emite nenhum erro no console do navegador.
 */
test('a tela inicial carrega sem erros', async ({ page }) => {
  const errosDeConsole: string[] = []
  page.on('console', (mensagem) => {
    if (mensagem.type() === 'error') errosDeConsole.push(mensagem.text())
  })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Olá, Mozii 💜' })).toBeVisible()
  await expect(page.getByText('vocês, em um só lugar')).toBeVisible()

  expect(errosDeConsole).toEqual([])
})
