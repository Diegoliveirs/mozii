# 02 — Banco e segurança

## Convenções de migration

- Arquivos numerados: `NNN_nome.sql` em `supabase/migrations/`. O schema **só cresce para frente** — nenhuma migration reescreve outra.
- Toda migration começa com um cabeçalho-comentário explicando **por que** ela é do jeito que é. Sem cabeçalho, não entra no repo.
- Todo `UPDATE` em policy tem `USING` **e** `WITH CHECK` — sem o `WITH CHECK`, um UPDATE poderia "mover" a linha para fora do alcance da policy (ex.: trocar o `casal_id` de uma publicação).
- Funções `SECURITY DEFINER` sempre declaram `set search_path = public, pg_temp` (evita sequestro de search_path).
- Projetos novos do Supabase não expõem tabelas automaticamente: **todo GRANT é explícito** na migration.

## Mapa planejado das migrations

| #   | Arquivo            | Conteúdo                                                                               | Status                   |
| --- | ------------------ | -------------------------------------------------------------------------------------- | ------------------------ |
| 001 | `001_casal.sql`    | casais, perfis, tentativas_entrada, RPCs de pareamento, exclusão com carência, pg_cron | ✅ aplicada (2026-08-01) |
| 002 | `002_filmes.sql`   | cache do TMDB + RPC `gravar_filme()` + limpeza de casais vazios                        | ✅ aplicada (2026-08-01) |
| 003 | `003_listas.sql`   | listas e itens                                                                         | ✅ aplicada (2026-08-01) |
| 004 | `004_mural.sql`    | publicações, comentários, reações, **bucket fotos** e **realtime** (antecipados)       | ✅ aplicada (2026-08-01) |
| 005 | `005_momentos.sql` | momentos, favoritos                                                                    | ✅ aplicada (2026-08-01) |
| 006 | `006_sessoes.sql`  | sessões de cinema                                                                      | Fase 5                   |

## Schema atual (após a 001)

### `casais`

| Coluna             | Tipo              | Nota                                                |
| ------------------ | ----------------- | --------------------------------------------------- |
| `id`               | uuid PK           |                                                     |
| `codigo_convite`   | text unique       | 6 caracteres, sem ambíguos (0/O, 1/I)               |
| `criado_por`       | uuid → auth.users | `SET NULL`: o casal sobrevive à exclusão do criador |
| `data_aniversario` | date              | única coluna editável direto pelo app               |
| `criado_em`        | timestamptz       |                                                     |

### `perfis`

| Coluna                   | Tipo                 | Nota                                                    |
| ------------------------ | -------------------- | ------------------------------------------------------- |
| `id`                     | uuid PK → auth.users | `CASCADE`: excluir conta leva o perfil                  |
| `nome_exibicao`          | text (1–40)          | vem do metadata do cadastro; fallback: começo do e-mail |
| `url_avatar`             | text                 |                                                         |
| `casal_id`               | uuid → casais        | **só muda via RPC**                                     |
| `exclusao_solicitada_em` | timestamptz          | carência de 30 min; relogar limpa                       |

### `tentativas_entrada`

Controle de força bruta do código de convite (5 falhas / 15 min). RLS ligada **sem policies** — só funções DEFINER tocam. Limpeza diária via pg_cron.

## As três camadas do "máximo 2 pessoas"

1. `casal_id` só muda pelas RPCs `criar_casal()` / `entrar_no_casal()` / `sair_do_casal()` (UPDATE direto na coluna é negado por GRANT).
2. `entrar_no_casal()` conta os membros e recusa o terceiro.
3. Trigger `travar_maximo_dois` (BEFORE INSERT OR UPDATE OF casal_id): rejeita qualquer escrita que criasse uma terceira pessoa — vale até contra bug futuro em função DEFINER.

## RPCs disponíveis

| Função                       | O que faz                                      | Erros possíveis                                     |
| ---------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| `meu_casal_id()`             | casal do usuário logado (base de toda RLS)     | —                                                   |
| `criar_casal()`              | cria o casal e vincula quem chamou             | "você já está em um casal"                          |
| `entrar_no_casal(codigo)`    | entra com o código; **NULL = código inválido** | "muitas tentativas…", "este casal já está completo" |
| `sair_do_casal()`            | desfaz o vínculo                               | —                                                   |
| `solicitar_exclusao_conta()` | agenda exclusão (carência 30 min)              | —                                                   |
| `cancelar_exclusao_conta()`  | desiste; o app chama a cada entrada            | —                                                   |
| `purgar_contas_excluidas()`  | job do pg_cron (a cada 5 min)                  | —                                                   |

## Jobs do pg_cron

| Job                         | Frequência   | Ação                                               |
| --------------------------- | ------------ | -------------------------------------------------- |
| `purgar-contas-excluidas`   | a cada 5 min | apaga `auth.users` com pedido de exclusão > 30 min |
| `limpar-tentativas-entrada` | diário às 3h | remove tentativas de convite com mais de 1 dia     |
