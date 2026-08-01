# 08 — Testes

## Estratégia em duas camadas

| Camada        | Ferramenta                                                  | O que cobre                                                              | O que NÃO cobre                   |
| ------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------- |
| Unitária      | Vitest                                                      | Lógica pura: datas, redimensionamento, layout do cartão, sorteio, `.ics` | Componentes React (nada de jsdom) |
| Ponta a ponta | Playwright (**headed** — preferência do Diego: ver rodando) | Fluxos reais no navegador, incluindo as regras de segurança do banco     | —                                 |

## Comandos

```bash
npm run testes:unitarios              # Vitest, roda em segundos
npm run testes:e2e                    # Playwright headed contra localhost:5173
npx playwright test testes/e2e/fumaca.spec.ts --headed   # um spec só
BASE_URL=https://<dominio> npx playwright test            # contra outro ambiente
```

## Regras do Playwright

- `workers: 1` — os specs compartilham os mesmos usuários de teste; paralelizar corromperia o estado. Nunca mudar.
- Viewport 390×844 (o app é mobile-first).
- E2E roda contra o Supabase **local** (`supabase start`, rodado pelo Diego) — produção nunca é bancada de teste.

## Testes de segurança (a partir da Fase 1)

Os specs mais importantes do projeto. Antes de o Diego aplicar qualquer migration em produção, precisam estar verdes:

- Isolamento entre casais (um casal não lê nem escreve nada do outro).
- Código de convite inválido → `NULL` + rate-limit após 5 falhas.
- Terceira pessoa não entra no casal por nenhum caminho.
- Colunas protegidas (`casal_id`, `exclusao_solicitada_em`) não mudam via UPDATE direto.

## Estado atual (Fase 1)

Unitários (`src/lib/__testes__/`):

- `ambiente.teste.ts` — detecção de variáveis de ambiente ausentes.
- `codigo.teste.ts` — normalização do código de convite.

E2E (`testes/e2e/`):

- `fumaca.spec.ts` — sem sessão, a raiz redireciona para `/entrar` sem erros de console.
- `fluxo-casal.spec.ts` — a jornada completa: duas janelas, um cria o espaço, o outro erra o código (vê "código inválido"), entra com o certo e o Mural mostra os dois nomes; cadastro com e-mail existente mostra mensagem amigável.
- `apoio.ts` — prepara os 2 usuários fixos de teste **usando só a chave anon** (nada de service role): entra-ou-cadastra, cancela exclusão pendente e sai do casal. Exige "Confirm email" desligado no projeto.

> Observação: cada execução deixa um casal vazio para trás (não há RPC para apagar casais). A migration 002 incluirá um job de limpeza de casais sem membros.
