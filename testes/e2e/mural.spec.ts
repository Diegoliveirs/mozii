import { expect, test, type Page } from '@playwright/test'
import {
  colunaExiste,
  formarCasal,
  prepararUsuario,
  tabelaExiste,
  USUARIO_DOIS,
  USUARIO_UM,
  irPara,
} from './apoio'

/**
 * Fase 3 de ponta a ponta: publicar, curtir (like de coração), comentar
 * na visão detalhada (com update otimista) e — o mais importante —
 * o TEMPO REAL: o comentário do par aparece sem recarregar a página.
 *
 * Pula com aviso enquanto a migration 004 não estiver aplicada.
 */

let migracaoAplicada = false
let variasFotos = false

// PNG de 1×1 pixel para os uploads de teste.
const PNG_MINUSCULO = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
const foto = (nome: string) => ({ name: nome, mimeType: 'image/png', buffer: PNG_MINUSCULO })

test.beforeAll(async () => {
  const tokenUm = await prepararUsuario(USUARIO_UM)
  const tokenDois = await prepararUsuario(USUARIO_DOIS)
  migracaoAplicada = await tabelaExiste(tokenUm, 'publicacoes')
  variasFotos = await colunaExiste(tokenUm, 'publicacoes', 'caminhos_fotos')
  if (migracaoAplicada) await formarCasal(tokenUm, tokenDois)
})

async function entrar(pagina: Page, usuario: typeof USUARIO_UM) {
  await irPara(pagina, '/entrar')
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

test('avaliar na página do filme mostra as duas avaliações e bloqueia repetição', async ({
  browser,
}) => {
  test.skip(!migracaoAplicada, 'aplicar 004_mural.sql e 010_avaliacoes_por_filme antes (docs/03)')

  const contextoUm = await browser.newContext()
  const paginaUm = await contextoUm.newPage()
  await entrar(paginaUm, USUARIO_UM)

  // Pessoa Um avalia a partir do detalhe de Matrix (TMDB 603).
  await irPara(paginaUm, '/filme/603')
  await expect(paginaUm.getByRole('heading', { name: 'Matrix' })).toBeVisible({ timeout: 15_000 })
  await paginaUm.getByRole('button', { name: 'Avaliar filme' }).click()
  await paginaUm.getByRole('button', { name: '4 estrelas' }).click()
  await paginaUm.getByPlaceholder('Escreve algo para vocês…').fill('Clássico da ficção científica.')
  await paginaUm.getByRole('button', { name: 'Publicar' }).click()
  await expect(paginaUm).toHaveURL(/\/filme\/603$/)
  await expect(paginaUm.getByText('Clássico da ficção científica.')).toBeVisible()
  await expect(paginaUm.getByRole('button', { name: 'Editar avaliação' })).toBeVisible()

  // Pelo composer genérico, o mesmo filme não pode ganhar uma segunda avaliação.
  await paginaUm.getByRole('link', { name: 'Nova publicação' }).click()
  await paginaUm.getByRole('button', { name: 'Avaliar um filme' }).click()
  await paginaUm.getByPlaceholder('Busque um filme…').fill('Matrix')
  await paginaUm
    .getByRole('button', { name: /Matrix \(1999\)/ })
    .first()
    .click()
  await expect(paginaUm.getByText('Você já avaliou este filme. Edite sua avaliação.')).toBeVisible()
  await expect(paginaUm.getByRole('button', { name: 'Publicar' })).toBeDisabled()

  // A pessoa dois avalia o mesmo filme e as duas publicações aparecem no detalhe.
  const contextoDois = await browser.newContext()
  const paginaDois = await contextoDois.newPage()
  await entrar(paginaDois, USUARIO_DOIS)
  await irPara(paginaDois, '/filme/603')
  await expect(paginaDois.getByRole('heading', { name: 'Matrix' })).toBeVisible({ timeout: 15_000 })
  await paginaDois.getByRole('button', { name: 'Avaliar filme' }).click()
  await paginaDois.getByRole('button', { name: '3.5 estrelas' }).click()
  await paginaDois
    .getByPlaceholder('Escreve algo para vocês…')
    .fill('Gostei muito da trilha sonora.')
  await paginaDois.getByRole('button', { name: 'Publicar' }).click()
  await expect(paginaDois).toHaveURL(/\/filme\/603$/)
  await expect(paginaDois.getByText('Clássico da ficção científica.')).toBeVisible()
  await expect(paginaDois.getByText('Gostei muito da trilha sonora.')).toBeVisible()

  await contextoUm.close()
  await contextoDois.close()
})

test('publicação com várias fotos, escolhidas em duas vezes', async ({ page }) => {
  test.skip(!variasFotos, 'aplicar 018_publicacao_com_varias_fotos.sql antes (docs/03)')

  await entrar(page, USUARIO_UM)
  await page.getByRole('link', { name: 'Nova publicação' }).click()
  await page.getByPlaceholder('Escreve algo para vocês…').fill('Três fotos da maratona')
  // Cada escolha soma às anteriores
  const campo = page.locator('input[type=file]')
  await campo.setInputFiles([foto('uma.png'), foto('duas.png')])
  await campo.setInputFiles(foto('tres.png'))
  await expect(page.getByRole('button', { name: 'Remover foto' })).toHaveCount(3)
  await page.getByRole('button', { name: 'Publicar' }).click()

  const publicacao = page.locator('article', { hasText: 'Três fotos da maratona' })
  await expect(publicacao.locator('img')).toHaveCount(3)
  await publicacao.locator('img').first().click()
  await expect(page.getByRole('dialog', { name: 'Foto ampliada' }).getByText('1 / 3')).toBeVisible()
})
