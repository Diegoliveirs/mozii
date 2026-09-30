import { expect, test } from '@playwright/test'
import { irPara } from './apoio'

/**
 * Nota de atualização: o toque em "Atualizar" grava a marca no aparelho e o
 * app novo abre a folha uma vez. Aqui a marca é gravada à mão (o service
 * worker não atualiza no dev) — o resto do caminho é o de verdade.
 */
test('depois de atualizar, a nota abre uma vez e o "Bora ver" fecha', async ({ page }) => {
  await irPara(page, '/entrar')
  await page.evaluate(() => {
    localStorage.setItem('mozii:mostrar-novidades', 'sim')
    localStorage.removeItem('mozii:ultima-nota-vista')
  })
  await page.reload()

  const folha = page.getByRole('dialog', { name: 'Nota de atualização' })
  await expect(folha).toBeVisible()
  await expect(folha.getByRole('heading', { name: 'O Mozii ficou Noir' })).toBeVisible()

  await folha.getByRole('button', { name: 'Bora ver' }).click()
  await expect(folha).toBeHidden()

  // A marca foi consumida: recarregar não abre de novo.
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Que bom te ver' })).toBeVisible()
  await expect(folha).toHaveCount(0)
})
