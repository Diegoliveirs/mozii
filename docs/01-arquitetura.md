# 01 — Arquitetura

## Visão geral

O Mozii é uma SPA React mobile-first, em português do Brasil, que conversa **direto** com o Postgres do Supabase usando a chave pública `anon`. Não existe servidor próprio.

```
┌─────────────────────────────┐
│  Navegador (PWA)            │
│  React 19 + Vite + Tailwind │
│  TanStack Query (cache)     │
└──────┬───────────┬──────────┘
       │           │
       │           └──────────────► TMDB (catálogo de filmes, chave v3 pública)
       ▼
┌─────────────────────────────┐
│  Supabase (projeto próprio) │
│  Postgres + RLS  ◄── toda a segurança mora aqui
│  Auth (e-mail/senha)        │
│  Storage (fotos do casal)   │
│  Realtime (mudanças ao vivo)│
│  pg_cron (jobs agendados)   │
└─────────────────────────────┘
```

## Os 4 princípios

1. **Segurança mora no banco.** Como o navegador fala direto com o Postgres, toda regra (isolamento entre casais, máximo de 2 pessoas, quem edita o quê) é imposta por RLS e funções `SECURITY DEFINER`. O frontend decide o que **mostrar**, nunca o que alguém **pode**.
2. **Camada de repositórios desacoplada.** `src/dados/repositorios.ts` define interfaces; `src/dados/supabase/` implementa. **Nenhum arquivo fora dessa pasta importa `@supabase/supabase-js`** — trocar de backend um dia significa reimplementar as interfaces, e nada mais.
3. **Manutenção acima de modernidade.** Cada dependência é uma coisa a mais para manter. Só entra biblioteca que elimina código nosso (TanStack Query elimina gerência manual de cache; date-fns elimina matemática de datas).
4. **Português em tudo.** Tabelas, funções, hooks, componentes, comentários e docs. Quem lê o código é o Diego — o código fala a língua dele.

## Stack

| Camada             | Escolha                                         | Por quê                                                                 |
| ------------------ | ----------------------------------------------- | ----------------------------------------------------------------------- |
| UI                 | React 19 + Vite                                 | Base sólida, build rápido                                               |
| Estilo             | Tailwind v4 (tema inline no `index.css`)        | Um arquivo a menos; tokens viram classes                                |
| Rotas              | react-router-dom 7                              | ~12 rotas estáveis; roteador com codegen seria complexidade sem retorno |
| Estado de servidor | TanStack Query 5                                | Cache + updates otimistas; dispensa Redux/Zustand                       |
| Datas              | date-fns 4 (locale pt-BR)                       | Contagem regressiva, "há 2 dias", aniversário                           |
| Backend            | Supabase                                        | Ver decisão abaixo                                                      |
| Testes             | Vitest (lógica pura) + Playwright (E2E, headed) | Ver [08-testes.md](08-testes.md)                                        |
| Lint/formato       | oxlint + Prettier                               | Rápidos e sem discussão de estilo                                       |

## Decisões

Registro cronológico. Cada entrada tem 3–5 linhas: contexto → decisão → consequência.

**2026-08-01 — Supabase como backend.** Comparados Supabase, Firebase, PocketBase, Convex e InstantDB para 2 usuários e custo zero. Decidido Supabase: o domínio é relacional (publicações↔reações↔filmes), todo o comportamento fica declarado em migrations SQL versionadas (dá para ler o backend inteiro em poucos arquivos), pg_cron cobre os jobs e o lock-in é mínimo (Postgres puro). Consequência: segurança 100% em RLS; o Diego aplica cada migration pessoalmente.

**2026-08-01 — Casal = exatamente 2, imposto no banco.** Três camadas: RPCs `SECURITY DEFINER` são o único caminho para mudar `casal_id`; `entrar_no_casal()` conta membros; trigger `travar_maximo_dois` rejeita qualquer UPDATE que criasse uma terceira pessoa. Consequência: nem bug futuro em RPC fura a regra.

**2026-08-01 — Código de convite inválido retorna NULL, não exception.** Um `RAISE` desfaria a transação e apagaria o registro em `tentativas_entrada`, zerando o controle de força bruta. O app traduz NULL para "código inválido". (Lição herdada do Mozii original.)

**2026-08-01 — Textos de interface centralizados em `src/lib/textos.ts`.** Nenhum texto direto no JSX: revisão de tom e busca de frases acontecem num lugar só.

**2026-08-01 — Um canal realtime POR TABELA.** Num canal compartilhado, uma única tabela com problema (ex.: migration ainda não aplicada) derrubava todas as inscrições juntas — mordeu duas vezes durante o desenvolvimento. Canais isolados: a falha de um não silencia os outros.

**2026-08-01 — Favoritos são da pessoa, não do casal (migration 007).** Os E2E expuseram que favoritos amarrados ao casal ficavam invisíveis após um novo pareamento, mas ainda bloqueavam filme e posição (os UNIQUE são por pessoa). Agora acompanham a pessoa; o par os vê pela relação de perfis.

**2026-08-01 — Regras de iOS (pedido do Diego).** Nada importante sob o notch (`.area-segura-topo` + `env(safe-area-inset-top)`); zoom bloqueado de verdade (`travarZoom.ts` contra pinça e toque duplo, que ignoram o viewport); botão voltar em toda tela interna (`CabecalhoPagina`, com fallback para a rota-mãe quando não há histórico).

**2026-08-01 — Ícones da PWA rasterizados com o Chromium do Playwright.** O `@vite-pwa/assets-generator` depende do sharp (binário nativo bloqueado pelo npm); `scripts/gerar-icones.mjs` usa o Edge que os E2E já usam — zero dependência nova.
