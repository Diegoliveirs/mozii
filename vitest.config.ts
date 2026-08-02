import { defineConfig } from 'vitest/config'

// O Mozii é um app brasileiro: os testes de data rodam SEMPRE no fuso de
// Brasília, não no fuso da máquina (o runner do GitHub é UTC — foi ele que
// pegou essa diferença). Definido aqui, os workers do Vitest herdam.
process.env.TZ = 'America/Sao_Paulo'

// Vitest cobre APENAS lógica pura (datas, imagem, layout do cartão, sorteio...).
// Interface é testada de ponta a ponta com Playwright — nada de jsdom aqui.
export default defineConfig({
  test: {
    include: ['src/**/__testes__/**/*.teste.{ts,tsx}'],
    environment: 'node',
  },
})
