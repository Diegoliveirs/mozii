import { defineConfig } from 'vitest/config'

// Vitest cobre APENAS lógica pura (datas, imagem, layout do cartão, sorteio...).
// Interface é testada de ponta a ponta com Playwright — nada de jsdom aqui.
export default defineConfig({
  test: {
    include: ['src/**/__testes__/**/*.teste.{ts,tsx}'],
    environment: 'node',
  },
})
