import { expect, test } from '@playwright/test'

/**
 * Teste de fumaça: o app sobe, a raiz redireciona quem não tem sessão
 * para a tela de entrar, e nada explode no console do navegador.
 */
test('sem sessão, a raiz leva para a tela de entrar, sem erros', async ({ page }) => {
  const errosDeConsole: string[] = []
  page.on('console', (mensagem) => {
    if (mensagem.type() === 'error') errosDeConsole.push(mensagem.text())
  })

  await page.goto('/')

  await expect(page).toHaveURL(/\/entrar$/)
  await expect(page.getByRole('heading', { name: 'Que bom te ver' })).toBeVisible()
  await expect(page.getByText('vocês, em um só lugar')).toBeVisible()

  expect(errosDeConsole).toEqual([])
})
