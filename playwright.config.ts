import { defineConfig } from '@playwright/test'

// BASE_URL definida no ambiente = testar outro endereço (ex.: produção)
// sem subir o servidor local.
const urlBase = process.env.BASE_URL ?? 'http://localhost:5173'

export default defineConfig({
  testDir: './testes',
  // Chamadas de rede reais (Supabase local + TMDB) pedem folga.
  timeout: 60_000,
  // Os specs compartilham os mesmos usuários de teste — nunca paralelizar.
  workers: 1,
  use: {
    baseURL: urlBase,
    channel: 'msedge',
    // Mobile-first: o app é desenhado para esta janela.
    viewport: { width: 390, height: 844 },
    screenshot: 'only-on-failure',
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: urlBase,
        reuseExistingServer: true,
      },
})
