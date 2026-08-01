# Mozii 💜

O cantinho de filmes do casal: listas do que ver, avaliações com meia estrela, sorteio "O que ver hoje", diário de momentos, sessões de cinema agendadas e um mural em tempo real — para **exatamente duas pessoas**, sem nada pago.

## Stack em cinco linhas

- **Frontend:** React 19 + Vite + TypeScript estrito + Tailwind v4, PWA instalável, tudo em pt-BR (inclusive o código).
- **Backend:** Supabase (Postgres + Auth + Storage + Realtime) — sem servidor próprio; toda a segurança mora em RLS.
- **Catálogo:** TMDB (busca, pôsteres, "onde assistir" na região BR).
- **Testes:** Vitest (lógica pura) + Playwright E2E headed contra o banco real.
- **Deploy:** Vercel (estático) + GitHub Actions (CI + manter o Supabase acordado).

## Como rodar

```bash
cp .env.example .env.local   # preencher com as chaves do Supabase e do TMDB
npm install
npm run dev                  # localhost:5173
```

```bash
npm run testes:unitarios     # Vitest
npm run testes:e2e           # Playwright headed
```

## Documentação

A pasta [`docs/`](docs/README.md) é a fonte da verdade — arquitetura, banco e segurança, roteiros de SQL, features, frontend, deploy e testes. As regras do projeto (para humanos e IA) estão no [`CLAUDE.md`](CLAUDE.md).

**Regra de ouro:** nada é executado no Supabase sem o dono aplicar pessoalmente — as migrations em `supabase/migrations/` vêm sempre com roteiro e queries de conferência em [`docs/03-roteiros-sql.md`](docs/03-roteiros-sql.md).
