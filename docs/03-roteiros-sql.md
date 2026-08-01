# 03 — Roteiros de aplicação de SQL

**Como funciona:** o assistente escreve cada migration e o roteiro correspondente aqui; **o Diego aplica pessoalmente** e roda as queries de conferência. A fase só continua depois da confirmação. Nada é executado no Supabase pelo assistente — nunca.

**Onde aplicar:** no SQL Editor do dashboard (colar o arquivo inteiro e executar) ou, se preferir o CLI local para testes, `supabase db reset` recria o banco local com todas as migrations.

---

## Roteiro da 001_casal.sql

**Status:** ✅ aplicada pelo Diego em 2026-08-01 — conferências ok
**Arquivo:** `supabase/migrations/001_casal.sql`

### Pré-requisito (uma vez só): criar o projeto Supabase novo

1. No [dashboard do Supabase](https://supabase.com/dashboard), criar um **projeto novo** (sugestão de nome: `mozii-casal`). **Não** reutilizar o projeto do fable/Mozi.
2. Guardar a senha do banco em local seguro.
3. Em _Project Settings → API_, copiar `URL` e `anon key` para o `.env.local` do projeto (usar o `.env.example` como modelo).

### O que esta migration cria

- Tabelas `casais`, `perfis` e `tentativas_entrada` (força bruta do convite).
- Trigger que cria o perfil automaticamente no cadastro.
- Trigger `travar_maximo_dois` — nenhum casal passa de 2 pessoas, nunca.
- RPCs: `criar_casal()`, `entrar_no_casal(codigo)`, `sair_do_casal()`, `solicitar_exclusao_conta()`, `cancelar_exclusao_conta()`, `meu_casal_id()`.
- Exclusão de conta com carência de 30 min + 2 jobs do pg_cron.
- RLS completa: cada pessoa vê só o próprio casal; edição direta limitada a nome/avatar (perfil) e data de aniversário (casal).

### Como aplicar

1. Abrir o **SQL Editor** do projeto novo no dashboard.
2. Colar o conteúdo completo de `supabase/migrations/001_casal.sql`.
3. Executar. Deve terminar sem erros (as duas últimas linhas retornam os ids dos jobs do cron — números como `1` e `2`).

> Se aparecer erro na linha do `create extension pg_cron`: ativar a extensão antes em _Database → Extensions → pg_cron_ e executar de novo.

### Queries de conferência

Rodar cada bloco no SQL Editor e comparar com o esperado:

```sql
-- 1. As 3 tabelas existem e estão com RLS ligada (3 linhas, todas com rowsecurity = true)
select tablename, rowsecurity from pg_tables
where schemaname = 'public'
order by tablename;
```

```sql
-- 2. Policies criadas (esperado: 4 linhas — 2 em casais, 2 em perfis, NENHUMA em tentativas_entrada)
select tablename, policyname, cmd from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

```sql
-- 3. As RPCs existem (esperado: 9 funções listadas)
select proname from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by proname;
```

```sql
-- 4. Jobs do cron agendados (esperado: 2 linhas)
select jobname, schedule from cron.job order by jobname;
```

```sql
-- 5. A trava de 2 pessoas existe (esperado: 1 linha com o trigger travar_maximo_dois)
select tgname from pg_trigger
where tgrelid = 'public.perfis'::regclass and not tgisinternal;
```

### Teste funcional rápido (opcional, mas recomendado)

1. No app (ou via _Authentication → Users_ do dashboard), criar um usuário de teste.
2. Conferir que o perfil nasceu sozinho:
   ```sql
   select id, nome_exibicao, casal_id from public.perfis;
   ```
3. Depois de conferir, pode excluir o usuário de teste pelo dashboard.

### Depois de aplicar

- [ ] Avisar no chat que a 001 foi aplicada e as conferências bateram.
- [ ] (Opcional) rodar `npm run gerar:tipos` se estiver usando o CLI local.

---

_Roteiros das migrations 002–006 serão adicionados nas fases correspondentes._
