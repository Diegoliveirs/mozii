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
- `sorteio.teste.ts` — a lógica pura do caça-níquel: sequência circular que termina no vencedor e atrasos crescentes.
- `datas.teste.ts` — tempo relativo do Mural ("agora", "há 5 min", "ontem", data por extenso).

E2E (`testes/e2e/`):

- `fumaca.spec.ts` — sem sessão, a raiz redireciona para `/entrar` sem erros de console.
- `fluxo-casal.spec.ts` — a jornada completa: duas janelas, um cria o espaço, o outro erra o código (vê "código inválido"), entra com o certo e o Mural mostra os dois nomes; cadastro com e-mail existente mostra mensagem amigável.
- `cinema.spec.ts` — Fase 2 inteira: busca real no TMDB ("Cidade de Deus"), página do filme com "Onde assistir", lista criada na folha, marcar/desmarcar assistido, sorteio revelando o filme e limpeza da lista no fim. **Pula com aviso** enquanto as migrations 002/003 não estiverem aplicadas.
- `mural.spec.ts` — Fase 3: publicar texto, reagir com emoji da fileira rápida, comentar com update otimista, e o **tempo real de verdade**: o par comenta em outra janela e o comentário aparece na primeira sem recarregar. Segundo teste: avaliação com meia estrela (4.5) no Mural. **Pula com aviso** até a 004 ser aplicada.
- `sessao.spec.ts` — Fase 5: agendar pela página do filme → cartão no Mural com contagem regressiva + atividade no feed + download do `.ics` + cancelar; sessão com horário no passado vira "E aí, como foi?" e a avaliação publicada conclui a sessão. **Pula com aviso** até 006/007 serem aplicadas.
- `momentos-perfil.spec.ts` — Fase 4: memória com 2 fotos (linha do tempo, lightbox, espelho no Mural e exclusão limpando as duas telas), perfil com estatísticas/histograma, favorito escolhido pela busca, geração do cartão de compartilhar (preview no modal prova o pipeline do canvas — blob em branco falharia) e troca de avatar. **Pula com aviso** até a 005 ser aplicada.
- `apoio.ts` — prepara os usuários fixos de teste **usando só a chave anon** (nada de service role): entra-ou-cadastra, cancela exclusão pendente, sai do casal e limpa os favoritos (pessoais, sobrevivem entre casais). Exige "Confirm email" desligado no projeto. O **usuário Três** existe só para errar código de convite — o rate-limit é por usuário, e isolar as falhas nele garante que Um e Dois nunca sejam bloqueados pelas rodadas anteriores da suíte.

> Observação: cada execução deixa um casal vazio para trás (não há RPC para apagar casais). A migration 002 incluirá um job de limpeza de casais sem membros.
