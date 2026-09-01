# 04 — Integrações

## TMDB (catálogo de filmes) — Fase 2

- Cliente único em `src/api/tmdb.ts`, **fora** da camada de repositórios (o catálogo seria idêntico com qualquer backend).
- Chave **v3** via query string, idioma `pt-BR`, região `BR` para os provedores de streaming.
- A chave vai para o bundle do navegador — é o desenho oficial da chave v3 (pública por natureza, limitada por taxa). Documentado aqui para ninguém "corrigir" isso depois.
- Endpoints usados: `/search/movie`, `/movie/{id}`, `/movie/{id}/watch/providers`.
- Cache local: os filmes tocados pelo casal são gravados na tabela `filmes` **somente** via RPC `gravar_filme()` (escrita direta revogada).
- ⚠️ Lição herdada: o cartão de compartilhar busca o pôster via `fetch`, então `https://image.tmdb.org` precisa estar no **`connect-src`** da CSP (não só no `img-src`) — senão o cartão sai em branco em produção.

## Supabase Storage (fotos) — Fase 4

- Bucket privado `fotos`; caminho `{casal_id}/{uuid}.webp`.
- RLS por pasta: `(storage.foldername(name))[1] = meu_casal_id()::text`.
- Fotos são redimensionadas **no navegador** antes do upload (WebP, qualidade 0,85, máx. 1600px; avatar 400px) — 1 GB do plano gratuito rende milhares de fotos.
- Limitação conhecida: ao excluir uma conta, o Supabase bloqueia `DELETE` em `storage.objects` — as fotos ficam órfãs (inacessíveis pela RLS). Limpeza manual pelo painel quando incomodar.

## Supabase Realtime — Fase 3

- Um canal por casal; mudanças do par invalidam as queries do TanStack Query (sem estado duplicado).
- ⚠️ Lição herdada: o socket só entrega eventos sob RLS se receber o JWT — reenviar `realtime.setAuth(token)` a cada `onAuthStateChange`, senão o realtime silencia sem erro.
- Tabelas entram na publication `supabase_realtime` com `replica identity full` (migration 006).

## Web Push (notificações) — Fase 7

- **Chaves VAPID próprias** (`npx web-push generate-vapid-keys`): a pública vai no bundle (`VITE_CHAVE_PUBLICA_VAPID`); a privada só nos secrets da Edge Function.
- **Fluxo**: triggers SQL (migration 008) → `notificar_par()` → `pg_net` → Edge Function `enviar-push` (`supabase/functions/enviar-push/`) → aparelhos inscritos (`inscricoes_push`). Textos pt-BR na função; rotas de destino relativas (o SW resolve).
- **Front**: `src/lib/notificacoes.ts` (suporte/permissão/inscrição), `src/hooks/useNotificacoes.ts`, seções nos Ajustes e convite no Mural. SW: `src/sw.ts` (injectManifest).
- **iOS**: push só com a PWA instalada (16.4+); a permissão precisa nascer de um gesto — o toggle dos Ajustes e o convite do Mural são os gestos.
- Roteiro completo de deploy/secrets/Vault: [03-roteiros-sql.md](03-roteiros-sql.md) § 008.
