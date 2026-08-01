# Mozii 2.0 — regras do projeto

App pessoal de filmes para UM casal (exatamente 2 pessoas). Sem monetização: tudo liberado, sem trial, sem paywall. Projeto independente do `fable/` (repositório git, projeto Supabase e deploy próprios).

## Regras inegociáveis

1. **Português do Brasil em TUDO** — nomes de tabelas (`casais`, `perfis`), colunas, funções SQL (`criar_casal()`), hooks (`useCasal`), componentes (`CartaoSessao`), variáveis, comentários, docs e textos. Única exceção: prefixos técnicos obrigatórios (`use` em hooks React, palavras reservadas de SQL/JS).
2. **Nunca executar nada no Supabase** — nem CLI (`db push`, `secrets set`), nem dashboard. O fluxo é: escrever a migration em `supabase/migrations/` + roteiro em `docs/03-roteiros-sql.md` → o Diego aplica pessoalmente → o Diego confirma → só então a fase continua.
3. **Sem gambiarras** — se a solução limpa não couber, parar e redesenhar. Arquivos pequenos, uma responsabilidade, nomes autoexplicativos.
4. **Documentar é parte da entrega** — feature só está pronta com `docs/05-features.md` atualizado. Migration sem cabeçalho-comentário explicando o porquê não entra no repo.
5. **Casal = 2, sempre** — imposto no banco em três camadas (RPC, contagem, trigger). A UI fala em "seu par", nunca em "grupo".

## Comandos

```bash
npm run dev                # servidor de desenvolvimento (localhost:5173)
npm run build              # tsc -b && vite build
npm run lint               # oxlint
npm run formato            # prettier --write
npm run testes:unitarios   # vitest (só lógica pura)
npm run testes:e2e         # playwright --headed (preferência do Diego: ver rodando)
npm run gerar:tipos        # tipos do banco (Diego roda, exige supabase CLI local)
```

## Arquitetura em uma linha

SPA React que fala direto com o Postgres do Supabase (chave anon); **toda segurança mora no banco** (RLS + funções SECURITY DEFINER); a camada `src/dados/repositorios.ts` define interfaces e `src/dados/supabase/` é o único lugar que importa `@supabase/supabase-js`.

## Convenções

- Textos de interface só em `src/lib/textos.ts` — nunca no JSX.
- Testes unitários em `src/**/__testes__/*.teste.ts`; E2E em `testes/e2e/*.spec.ts`.
- Decisão de arquitetura → registro datado em `docs/01-arquitetura.md § Decisões`.
- Plano completo da recriação: `C:\Users\diego.oliveira\.claude\plans\quero-que-voc-revisite-quiet-koala.md`.
