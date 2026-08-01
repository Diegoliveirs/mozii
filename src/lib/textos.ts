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

  comuns: {
    salvar: 'Salvar',
    cancelar: 'Cancelar',
    confirmar: 'Confirmar',
    carregando: 'Carregando…',
    erroInesperado: 'Algo deu errado. Tenta de novo?',
  },

  entrar: {
    titulo: 'Que bom te ver',
    email: 'E-mail',
    senha: 'Senha',
    botao: 'Entrar',
    entrando: 'Entrando…',
    semConta: 'Ainda não tem conta?',
    linkCadastro: 'Criar conta',
    credenciaisInvalidas: 'E-mail ou senha incorretos.',
  },

  cadastro: {
    titulo: 'Criar sua conta',
    nome: 'Seu nome',
    nomeDica: 'Como seu par te chama?',
    email: 'E-mail',
    senha: 'Senha (mínimo 8 caracteres)',
    botao: 'Criar conta',
    criando: 'Criando…',
    jaTemConta: 'Já tem conta?',
    linkEntrar: 'Entrar',
    emailJaExiste: 'Este e-mail já tem conta. Tenta entrar?',
  },

  parear: {
    titulo: 'Falta uma pessoa 💜',
    subtitulo: 'O Mozii é feito para vocês dois. Crie o espaço ou entre no do seu par.',
    criarTitulo: 'Começar o nosso espaço',
    criarBotao: 'Criar espaço do casal',
    criando: 'Criando…',
    codigoCriadoTitulo: 'Espaço criado!',
    codigoCriadoDica: 'Mostre este código para seu par entrar:',
    irParaApp: 'Ir para o Mozii',
    entrarTitulo: 'Meu par já criou',
    entrarRotulo: 'Código de convite',
    entrarBotao: 'Entrar no espaço',
    entrando: 'Entrando…',
    codigoInvalido: 'Código inválido. Confere com seu par?',
    ou: 'ou',
  },

  mural: {
    titulo: 'Mural',
    juntos: (nomes: string[]) => nomes.join(' ♥ '),
    esperandoPar: 'Seu par ainda não entrou — o código de convite está nos Ajustes.',
    emBreve: 'O Mural chega na Fase 3. Por enquanto, o espaço de vocês já existe!',
  },

  navegacao: {
    mural: 'Mural',
    ajustes: 'Ajustes',
  },

  ajustes: {
    titulo: 'Ajustes',
    nomeRotulo: 'Seu nome',
    nomeSalvo: 'Nome salvo!',
    casalTitulo: 'Nosso espaço',
    codigoConvite: 'Código de convite',
    codigoDica: 'Seu par usa este código para entrar.',
    membros: 'Quem está aqui',
    aniversarioRotulo: 'Data do nosso aniversário',
    aniversarioDica: 'Aparece como marco na linha do tempo dos Momentos.',
    sairConta: 'Sair da conta',
    zonaPerigo: 'Zona de perigo',
    sairCasal: 'Sair do espaço',
    sairCasalExplicacao:
      'Você sai do espaço do casal; suas publicações continuam lá. Dá para voltar com o código.',
    sairCasalConfirmar: 'Sair do espaço do casal?',
    excluirConta: 'Excluir minha conta',
    excluirContaExplicacao:
      'Sua conta e tudo que você criou somem de verdade após 30 minutos. Entrar de novo dentro desse prazo cancela a exclusão.',
    excluirContaConfirmar: 'Excluir sua conta de verdade?',
  },

  configuracao: {
    titulo: 'Falta configurar o ambiente',
    explicacao:
      'Copie o arquivo .env.example para .env.local e preencha as chaves do Supabase e do TMDB. Depois reinicie o servidor de desenvolvimento.',
    variaveisFaltando: 'Variáveis ausentes:',
  },
} as const
