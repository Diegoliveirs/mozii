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

## Roteiro da 002_filmes.sql + 003_listas.sql (aplicar as duas em sequência)

**Status:** ✅ aplicadas pelo Diego em 2026-08-01 — conferências ok
**Arquivos:** `supabase/migrations/002_filmes.sql` e `003_listas.sql`

### O que criam

- **002:** tabela `filmes` (cache global do TMDB — leitura livre, escrita **só** pela RPC `gravar_filme()` com validação) e o job `limpar-casais-vazios` (recolhe casais sem membros há mais de 1 dia, inclusive os que os testes E2E deixam).
- **003:** tabelas `listas` e `itens_lista`, ambas no escopo do casal via RLS. Os dois membros veem, adicionam, marcam como assistido e excluem; `unique (lista_id, tmdb_id)` impede filme repetido na lista; UPDATE limitado por coluna (`nome` na lista, `assistido` no item).

### Como aplicar

1. SQL Editor do projeto → colar o conteúdo de `002_filmes.sql` → executar (a última linha retorna o id do job do cron).
2. Depois, colar o conteúdo de `003_listas.sql` → executar.

### Queries de conferência

```sql
-- 1. Tabelas novas com RLS ligada (esperado: filmes, itens_lista, listas — todas true)
select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename in ('filmes','listas','itens_lista')
order by tablename;
```

```sql
-- 2. Policies (esperado: 1 em filmes, 4 em listas, 4 em itens_lista)
select tablename, count(*) from pg_policies
where schemaname = 'public' and tablename in ('filmes','listas','itens_lista')
group by tablename order by tablename;
```

```sql
-- 3. Escrita direta em filmes está BLOQUEADA (esperado: 0 linhas — nenhum
--    privilégio de insert/update/delete para authenticated)
select privilege_type from information_schema.role_table_grants
where table_name = 'filmes' and grantee = 'authenticated'
  and privilege_type in ('INSERT','UPDATE','DELETE');
```

```sql
-- 4. A RPC existe e o cron novo está agendado (esperado: gravar_filme + 3 jobs no total)
select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and proname = 'gravar_filme';
select jobname, schedule from cron.job order by jobname;
```

### Depois de aplicar

- [ ] Avisar no chat que a 002 e a 003 foram aplicadas e as conferências bateram.

---

## Roteiro da 004_mural.sql

**Status:** ✅ aplicada pelo Diego em 2026-08-01 — conferências ok
**Arquivo:** `supabase/migrations/004_mural.sql`

### Mudanças de sequência (registradas)

Duas coisas previstas para depois entraram nesta migration, por dependência real:

- **Bucket `fotos`** (estava na 005): publicação com foto precisa dele agora.
- **Publicação realtime** (estava na 006): o tempo real é o coração da Fase 3.

### O que esta migration cria

- `publicacoes` — os 4 tipos do Mural (`texto`, `avaliacao`, `atividade`, `momento`), cada um com CHECK do que exige e proíbe; nota com meia estrela (0.5 a 5); edição limitada a `corpo`/`nota` e só pelo autor.
- `comentarios` e `reacoes` (emoji livre, `unique` por pessoa+emoji+publicação).
- Bucket privado `fotos` (50 MB, webp/jpeg/png) com RLS por pasta `{casal_id}/`.
- Tempo real: `publicacoes`, `comentarios`, `reacoes`, `listas` e `itens_lista` na publication `supabase_realtime` com `replica identity full`.

### Como aplicar

1. SQL Editor → colar `004_mural.sql` inteiro → executar.

### Queries de conferência

```sql
-- 1. Tabelas novas com RLS (esperado: comentarios, publicacoes, reacoes — todas true)
select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename in ('publicacoes','comentarios','reacoes')
order by tablename;
```

```sql
-- 2. Policies (esperado: 4 em publicacoes, 3 em comentarios, 3 em reacoes)
select tablename, count(*) from pg_policies
where schemaname = 'public' and tablename in ('publicacoes','comentarios','reacoes')
group by tablename order by tablename;
```

```sql
-- 3. Bucket e as 3 policies de storage (esperado: 1 bucket 'fotos' privado + 3 policies fotos_*)
select id, public from storage.buckets where id = 'fotos';
select policyname from pg_policies
where schemaname = 'storage' and policyname like 'fotos_%' order by policyname;
```

```sql
-- 4. Tempo real ligado (esperado: 5 tabelas na publication)
select tablename from pg_publication_tables
where pubname = 'supabase_realtime' order by tablename;
```

### Depois de aplicar

- [ ] Avisar no chat que a 004 foi aplicada e as conferências bateram.

---

## Roteiro da 005_momentos.sql

**Status:** ✅ aplicada pelo Diego em 2026-08-01 — conferências ok
**Arquivo:** `supabase/migrations/005_momentos.sql`

### O que esta migration cria

- `momentos` — diário do casal: fotos (array de caminhos do bucket `fotos`) + legenda + `aconteceu_em` retroativa; precisa de legenda OU ao menos 1 foto; exclusão só pelo autor.
- `favoritos` — até **5 filmes por pessoa**, garantidos pela estrutura (`unique (perfil_id, posicao)` com posição 1–5); o casal vê os favoritos um do outro.
- Tempo real para as duas tabelas.
- Sem UPDATE em nenhuma das duas (menos caminhos = menos brechas): memória se apaga e refaz; favorito troca de posição removendo e recriando.

### Como aplicar

1. SQL Editor → colar `005_momentos.sql` inteiro → executar.

### Queries de conferência

```sql
-- 1. Tabelas com RLS (esperado: favoritos e momentos, ambas true)
select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename in ('momentos','favoritos')
order by tablename;
```

```sql
-- 2. Policies (esperado: 3 em cada)
select tablename, count(*) from pg_policies
where schemaname = 'public' and tablename in ('momentos','favoritos')
group by tablename order by tablename;
```

```sql
-- 3. Sem UPDATE concedido (esperado: 0 linhas)
select table_name, privilege_type from information_schema.role_table_grants
where table_name in ('momentos','favoritos') and grantee = 'authenticated'
  and privilege_type = 'UPDATE';
```

```sql
-- 4. Tempo real (esperado: 7 tabelas na publication, incluindo momentos e favoritos)
select tablename from pg_publication_tables
where pubname = 'supabase_realtime' order by tablename;
```

### Depois de aplicar

- [ ] Avisar no chat que a 005 foi aplicada e as conferências bateram.

---

## Roteiro da 006_sessoes.sql + 007_favoritos_pessoais.sql (aplicar as duas em sequência)

**Status:** ⏳ aguardando aplicação pelo Diego
**Arquivos:** `supabase/migrations/006_sessoes.sql` e `007_favoritos_pessoais.sql`

> **Por que a 007 existe:** os E2E expuseram um defeito da 005 — favoritos amarrados ao casal ficavam invisíveis após um novo pareamento, mas ainda bloqueavam filme e posição (os UNIQUE são por pessoa). A 007 remove o `casal_id` e torna os favoritos da pessoa, visíveis ao par pela relação de perfis.

### O que esta migration cria

- `sessoes_cinema` — o compromisso do casal: filme + `agendada_para` + observação; ciclo `agendada` → `assistida`/`cancelada`; **qualquer membro** reagenda/cancela/conclui (UPDATE limitado às colunas do ciclo de vida); `item_lista_id` lembra a lista de origem.
- RPC `concluir_sessao(sessao, avaliacao?)` — numa transação só: marca `assistida`, vincula a avaliação (se houver) e seta `assistido = true` no item de origem.
- Tempo real para a tabela.

### Como aplicar

1. SQL Editor → colar `006_sessoes.sql` inteiro → executar.
2. SQL Editor → colar `007_favoritos_pessoais.sql` inteiro → executar.

### Queries de conferência

```sql
-- 1. Tabela com RLS (esperado: sessoes_cinema, true)
select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename = 'sessoes_cinema';
```

```sql
-- 2. Policies (esperado: 3) e colunas de UPDATE limitadas (esperado: 5 colunas)
select policyname from pg_policies
where schemaname = 'public' and tablename = 'sessoes_cinema' order by policyname;
select column_name from information_schema.column_privileges
where table_name = 'sessoes_cinema' and grantee = 'authenticated'
  and privilege_type = 'UPDATE' order by column_name;
```

```sql
-- 3. A RPC existe (esperado: concluir_sessao)
select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and proname = 'concluir_sessao';
```

```sql
-- 4. Tempo real (esperado: 8 tabelas na publication, incluindo sessoes_cinema)
select tablename from pg_publication_tables
where pubname = 'supabase_realtime' order by tablename;
```

```sql
-- 5. (007) favoritos sem casal_id e com 3 policies novas
select column_name from information_schema.columns
where table_name = 'favoritos' order by column_name; -- casal_id NÃO deve aparecer
select policyname from pg_policies
where tablename = 'favoritos' order by policyname;   -- esperado: 3
```

### Depois de aplicar

- [ ] Avisar no chat que a 006 e a 007 foram aplicadas e as conferências bateram.
