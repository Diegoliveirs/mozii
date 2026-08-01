/**
 * Todos os textos do app vivem aqui, em português do Brasil.
 * Regra: nenhum componente escreve texto de interface direto no JSX —
 * assim a revisão de tom e a busca por qualquer frase acontecem num lugar só.
 */
export const textos = {
  app: {
    nome: 'Mozii',
    slogan: 'vocês, em um só lugar',
  },

  inicial: {
    boasVindas: 'Olá, Mozii 💜',
    descricao: 'O cantinho de filmes do casal está nascendo.',
    faseAtual: 'Fase 0 — fundação pronta. Autenticação chega na Fase 1.',
  },

  configuracao: {
    titulo: 'Falta configurar o ambiente',
    explicacao:
      'Copie o arquivo .env.example para .env.local e preencha as chaves do Supabase e do TMDB. Depois reinicie o servidor de desenvolvimento.',
    variaveisFaltando: 'Variáveis ausentes:',
  },
} as const
