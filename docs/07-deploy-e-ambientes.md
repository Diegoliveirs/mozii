# 07 — Deploy e ambientes

## Ambientes

| Ambiente        | Frontend                       | Backend                                                      | Quem administra |
| --------------- | ------------------------------ | ------------------------------------------------------------ | --------------- |
| Desenvolvimento | `npm run dev` (localhost:5173) | Supabase CLI local (`supabase start`) ou o projeto hospedado | Diego           |
| Produção        | Vercel (build estático)        | Projeto Supabase próprio do Mozii 2.0                        | Diego           |

**Importante:** o projeto Supabase e o deploy do Mozii 2.0 são **novos e exclusivos** — nada é compartilhado com o fable/Mozi comercial.

## Variáveis de ambiente (frontend)

Todas com prefixo `VITE_` (vão para o bundle — nenhuma é secreta):

| Variável                 | O que é                                       |
| ------------------------ | --------------------------------------------- |
| `VITE_SUPABASE_URL`      | URL do projeto Supabase                       |
| `VITE_SUPABASE_ANON_KEY` | chave pública `anon` (a RLS protege os dados) |
| `VITE_TMDB_API_KEY`      | chave v3 do TMDB (pública por design)         |

Local: copiar `.env.example` → `.env.local`. Vercel: _Settings → Environment Variables_.

## CI (GitHub Actions)

- `ci.yml` — a cada push/PR: oxlint → Prettier (conferência) → `tsc -b` → Vitest → build.
- `manter-ativo.yml` — cron diário que faz uma consulta mínima via REST no Supabase: o plano gratuito **pausa projetos após ~7 dias sem atividade**, e este ping evita a pausa. Requer os segredos `SUPABASE_URL` e `SUPABASE_ANON_KEY` no repositório GitHub (_Settings → Secrets and variables → Actions_) — o Diego cadastra.

## PWA

- `vite-plugin-pwa` com `registerType: 'prompt'`: quando sai versão nova, o app mostra um aviso em vez de trocar sozinho (evita o clássico bug de service worker servindo bundle velho).
- Ícones 192/512 + maskable em `public/` (a partir do `icone.svg`).
- Cache de pôsteres do TMDB: `CacheFirst`, 30 dias, máx. 200 entradas.
- Dados do Supabase ficam **fora** do service worker — cache de dados é papel do TanStack Query.

## Checklist de deploy (quando chegar a hora, Fase 6)

1. Diego cria o projeto na Vercel apontando para o repositório `mozii`.
2. Variáveis de ambiente na Vercel.
3. `vercel.json` com rewrite de SPA + headers de segurança (CSP incluindo `image.tmdb.org` no `connect-src` — ver [04-integracoes.md](04-integracoes.md)).
4. Conferir os headers publicados: `curl -sI https://<dominio>`.
5. Ligar "Confirm email" no dashboard do Supabase de produção.
6. Instalar o PWA no Android e no iOS do casal e testar.
