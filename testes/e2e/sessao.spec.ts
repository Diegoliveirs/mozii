import { expect, test, type Page } from '@playwright/test'
import { formarCasal, prepararUsuario, tabelaExiste, USUARIO_DOIS, USUARIO_UM } from './apoio'

/**
 * Fase 5 de ponta a ponta — a feature nova:
 * 1. agendar → cartão com contagem regressiva no Mural + atividade +
 *    download do .ics + cancelar;
 * 2. sessão com horário no passado vira "E aí, como foi?" e a avaliação
 *    publicada conclui a sessão (o cartão some).
 *
 * Pula com aviso enquanto a migration 006 não estiver aplicada.
 */

let migracaoAplicada = false

test.beforeAll(async () => {
  const tokenUm = await prepararUsuario(USUARIO_UM)
  const tokenDois = await prepararUsuario(USUARIO_DOIS)
  migracaoAplicada = await tabelaExiste(tokenUm, 'sessoes_cinema')
  if (migracaoAplicada) await formarCasal(tokenUm, tokenDois)
})

async function entrar(pagina: Page, usuario: typeof USUARIO_UM) {
  await pagina.goto('/entrar')
  await pagina.getByLabel('E-mail').fill(usuario.email)
  await pagina.getByLabel('Senha', { exact: true }).fill(usuario.senha)
  await pagina.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(pagina.getByRole('heading', { name: 'Mural' })).toBeVisible()
}

/** Data no formato do <input type="datetime-local"> (AAAA-MM-DDTHH:mm). */
function paraCampoDataHora(data: Date): string {
  const preencher = (n: number) => String(n).padStart(2, '0')
  return `${data.getFullYear()}-${preencher(data.getMonth() + 1)}-${preencher(data.getDate())}T${preencher(data.getHours())}:${preencher(data.getMinutes())}`
}

async function agendarPelaPaginaDoFilme(page: Page, quando: Date, observacao?: string) {
  // Cidade de Deus (tmdb 598): título estável para o teste.
  await page.goto('/filme/598')
  await page.getByRole('button', { name: '🍿 Agendar sessão' }).click()
  await page.locator('input[type=datetime-local]').fill(paraCampoDataHora(quando))
  if (observacao) {
    await page.getByPlaceholder('Combinados', { exact: false }).fill(observacao)
  }
  await page.getByRole('button', { name: 'Agendar', exact: true }).click()
}

test('agendar: cartão com contagem regressiva, atividade, .ics e cancelar', async ({ page }) => {
  test.skip(!migracaoAplicada, 'aplicar 006_sessoes.sql antes (docs/03)')

  await entrar(page, USUARIO_UM)

  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)
  amanha.setHours(20, 0, 0, 0)
  await agendarPelaPaginaDoFilme(page, amanha, 'leva pipoca doce')

  // Cartão no topo do Mural
  await page.getByRole('link', { name: 'Mural' }).click()
  await expect(page.getByText('Sessão marcada')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Cidade de Deus' })).toBeVisible()
  await expect(page.getByText(/em \d+ h/)).toBeVisible()
  await expect(page.getByText('leva pipoca doce')).toBeVisible()

  // Atividade no feed
  await expect(page.getByText(/agendou Cidade de Deus para/)).toBeVisible()

  // .ics baixa com o nome certo
  const esperandoDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: '📅 Adicionar ao calendário' }).click()
  expect((await esperandoDownload).suggestedFilename()).toBe('sessao-mozii.ics')

  // Cancelar limpa o cartão
  await page.getByRole('button', { name: 'Cancelar sessão' }).click()
  await page.getByRole('button', { name: 'Confirmar' }).click()
  await expect(page.getByText('Sessão marcada')).toHaveCount(0)
})

test('sessão passada vira "como foi?" e a avaliação conclui', async ({ page }) => {
  test.skip(!migracaoAplicada, 'aplicar 006_sessoes.sql antes (docs/03)')

  await entrar(page, USUARIO_UM)

  const ontem = new Date()
  ontem.setDate(ontem.getDate() - 1)
  ontem.setHours(20, 0, 0, 0)
  await agendarPelaPaginaDoFilme(page, ontem)

  // Horário passou: o cartão pergunta como foi
  await page.getByRole('link', { name: 'Mural' }).click()
  await expect(page.getByText('E aí, como foi? 🍿')).toBeVisible()

  // Avaliar: composer chega pré-preenchido com o filme
  await page.getByRole('button', { name: 'Avaliar filme' }).click()
  await expect(page.getByRole('heading', { name: 'Nova publicação' })).toBeVisible()
  await expect(page.getByText('Cidade de Deus')).toBeVisible()

  await page.getByRole('button', { name: '4.5 estrelas' }).click()
  await page.getByPlaceholder('Escreve algo para vocês…').fill('Sessão perfeita.')
  await page.getByRole('button', { name: 'Publicar' }).click()

  // De volta ao Mural: sessão concluída (cartão some) e avaliação no feed
  await expect(page.getByRole('heading', { name: 'Mural' })).toBeVisible()
  await expect(page.getByText('E aí, como foi? 🍿')).toHaveCount(0)
  await expect(page.getByText('Sessão perfeita.')).toBeVisible()
})
