import { expect, test, type Page } from '@playwright/test'
import {
  colunaExiste,
  formarCasal,
  prepararUsuario,
  tabelaExiste,
  USUARIO_DOIS,
  USUARIO_UM,
} from './apoio'

/**
 * Fase 4 de ponta a ponta: memória com fotos (linha do tempo + espelho no
 * Mural + lightbox + exclusão), perfil com estatísticas/favoritos/histograma
 * e o cartão de compartilhar gerado em canvas (preview validado — o blob
 * em branco falharia na geração).
 *
 * Pula com aviso enquanto a migration 005 não estiver aplicada.
 */

let migracaoAplicada = false

// PNG de 1×1 pixel para os uploads de teste.
const PNG_MINUSCULO = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
const foto = (nome: string) => ({ name: nome, mimeType: 'image/png', buffer: PNG_MINUSCULO })

test.beforeAll(async () => {
  const tokenUm = await prepararUsuario(USUARIO_UM)
  const tokenDois = await prepararUsuario(USUARIO_DOIS)
  // Exige a 005 (momentos) E a 007 (favoritos sem casal_id — pessoais).
  migracaoAplicada =
    (await tabelaExiste(tokenUm, 'momentos')) &&
    !(await colunaExiste(tokenUm, 'favoritos', 'casal_id'))
  if (migracaoAplicada) await formarCasal(tokenUm, tokenDois)
})

async function entrar(pagina: Page, usuario: typeof USUARIO_UM) {
  await pagina.goto('/entrar')
  await pagina.getByLabel('E-mail').fill(usuario.email)
  await pagina.getByLabel('Senha', { exact: true }).fill(usuario.senha)
  await pagina.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(pagina.getByRole('link', { name: 'Momentos' })).toBeVisible()
}

test('memória com fotos: linha do tempo, espelho no Mural, lightbox e exclusão', async ({
  page,
}) => {
  test.skip(!migracaoAplicada, 'aplicar 005_momentos.sql antes (docs/03)')

  await entrar(page, USUARIO_UM)

  // Criar a memória com 2 fotos
  await page.getByRole('link', { name: 'Momentos' }).click()
  await page.getByRole('button', { name: 'Nova memória' }).click()
  await page.getByPlaceholder('O que aconteceu?').fill('Nosso primeiro cinema juntos 🍿')
  await page.locator('input[type=file]').setInputFiles([foto('uma.png'), foto('duas.png')])
  await page.getByRole('button', { name: 'Guardar memória' }).click()

  // Linha do tempo: memória sob o rótulo "Hoje"
  await expect(page.getByRole('heading', { name: 'Hoje' })).toBeVisible()
  await expect(page.getByText('Nosso primeiro cinema juntos 🍿')).toBeVisible()

  // Lightbox
  await page.locator('article img').first().click()
  const lightbox = page.getByRole('dialog', { name: 'Foto ampliada' })
  await expect(lightbox).toBeVisible()
  await expect(lightbox.getByText('1 / 2')).toBeVisible()
  await lightbox.getByRole('button', { name: 'Fechar' }).click()

  // Espelho no Mural
  await page.getByRole('link', { name: 'Mural' }).click()
  await expect(page.getByText('Nosso primeiro cinema juntos 🍿')).toBeVisible()

  // Excluir: some das duas telas
  await page.getByRole('link', { name: 'Momentos' }).click()
  await page.getByRole('button', { name: 'Excluir memória' }).click()
  await page.getByRole('button', { name: 'Confirmar' }).click()
  await expect(page.getByText('Nosso primeiro cinema juntos 🍿')).toHaveCount(0)

  await page.getByRole('link', { name: 'Mural' }).click()
  await expect(page.getByText('Nosso primeiro cinema juntos 🍿')).toHaveCount(0)
})

test('perfil: estatísticas, favorito, cartão de compartilhar e avatar', async ({ page }) => {
  test.skip(!migracaoAplicada, 'aplicar 005_momentos.sql antes (docs/03)')

  await entrar(page, USUARIO_UM)

  // Uma avaliação para alimentar as estatísticas
  await page.getByRole('link', { name: 'Nova publicação' }).click()
  await page.getByRole('button', { name: 'Avaliar um filme' }).click()
  await page.getByPlaceholder('Busque um filme…').fill('Interestelar')
  await page
    .getByRole('button', { name: /Interestelar \(2014\)/ })
    .first()
    .click()
  await page.getByRole('button', { name: '5 estrelas', exact: true }).click()
  await page.getByPlaceholder('Escreve algo para vocês…').fill('Épico do começo ao fim.')
  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(page.getByText('vocês, em um só lugar')).toBeVisible()

  // Perfil: estatísticas e histograma (só aparece com avaliações)
  await page.getByRole('link', { name: 'Perfil' }).click()
  await expect(page.getByText('filmes avaliados')).toBeVisible()
  await expect(page.getByText('Distribuição das notas')).toBeVisible()

  // Favorito no primeiro espaço vazio
  await page.getByRole('button', { name: 'Favoritos 1' }).click()
  await page.getByPlaceholder('Busque um filme…').fill('Divertida Mente')
  await page
    .getByRole('button', { name: /Divertida Mente \(2015\)/ })
    .first()
    .click()
  await expect(page.getByRole('img', { name: 'Divertida Mente' }).first()).toBeVisible()

  // Cartão de compartilhar: o preview gerado prova o pipeline do canvas
  await page.getByRole('link', { name: 'Interestelar' }).first().click()
  await page.getByRole('button', { name: 'Compartilhar', exact: true }).click()
  const modal = page.getByRole('dialog', { name: 'Compartilhar nos Stories' })
  await expect(modal.locator('img')).toBeVisible({ timeout: 20_000 })
  // Trocar o tema regenera o cartão
  await modal.getByRole('button', { name: 'Vinho' }).click()
  await expect(modal.locator('img')).toBeVisible({ timeout: 20_000 })
  await page.keyboard.press('Escape')
  await modal.click({ position: { x: 5, y: 5 } }).catch(() => {})

  // Avatar nos Ajustes
  await page.getByRole('link', { name: 'Perfil' }).click()
  await page.getByRole('link', { name: 'Ajustes' }).click()
  await page.locator('input[type=file]').first().setInputFiles(foto('avatar.png'))
  await expect(page.getByText('Foto atualizada!')).toBeVisible({ timeout: 15_000 })
})
