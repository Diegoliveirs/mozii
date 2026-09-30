# 02 — Banco e segurança

## Convenções de migration

- Arquivos numerados: `NNN_nome.sql` em `supabase/migrations/`. O schema **só cresce para frente** — nenhuma migration reescreve outra.
- Toda migration começa com um cabeçalho-comentário explicando **por que** ela é do jeito que é. Sem cabeçalho, não entra no repo.
- Todo `UPDATE` em policy tem `USING` **e** `WITH CHECK` — sem o `WITH CHECK`, um UPDATE poderia "mover" a linha para fora do alcance da policy (ex.: trocar o `casal_id` de uma publicação).
- Funções `SECURITY DEFINER` sempre declaram `set search_path = public, pg_temp` (evita sequestro de search_path).
- Projetos novos do Supabase não expõem tabelas automaticamente: **todo GRANT é explícito** na migration.
- **Funções também**: desde a 011, nenhuma função nasce com EXECUTE público. Toda RPC nova declara `grant execute ... to authenticated` e, se for `SECURITY DEFINER`, recusa `auth.uid()` nulo logo no começo.
- Contagem que protege uma regra (ex.: membros do casal) trava a linha-mãe com `select ... for update` antes de contar.
- Coluna que o cliente escreve tem teto de tamanho (CHECK), inclusive `jsonb` e arrays.

## Mapa planejado das migrations

| #   | Arquivo                               | Conteúdo                                                                                    | Status                   |
| --- | ------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| 001 | `001_casal.sql`                       | casais, perfis, tentativas_entrada, RPCs de pareamento, exclusão com carência, pg_cron      | ✅ aplicada (2026-08-01) |
| 002 | `002_filmes.sql`                      | cache do TMDB + RPC `gravar_filme()` + limpeza de casais vazios                             | ✅ aplicada (2026-08-01) |
| 003 | `003_listas.sql`                      | listas e itens                                                                              | ✅ aplicada (2026-08-01) |
| 004 | `004_mural.sql`                       | publicações, comentários, reações, **bucket fotos** e **realtime** (antecipados)            | ✅ aplicada (2026-08-01) |
| 005 | `005_momentos.sql`                    | momentos, favoritos                                                                         | ✅ aplicada (2026-08-01) |
| 006 | `006_sessoes.sql`                     | sessões de cinema + RPC `concluir_sessao`                                                   | ✅ aplicada (2026-08-01) |
| 007 | `007_favoritos_pessoais.sql`          | favoritos passam a ser da pessoa (defeito da 005 achado pelos E2E)                          | ✅ aplicada (2026-08-01) |
| 008 | `008_notificacoes.sql`                | Web Push: inscrições, preferências, `notificar_par()` e triggers                            | ✅ aplicada              |
| 009 | `009_autenticar_push_pg_net.sql`      | `apikey` no `pg_net` para o gateway aceitar a chamada                                       | ✅ aplicada              |
| 010 | `010_avaliacoes_por_filme.sql`        | uma avaliação por pessoa e filme (era a segunda "008")                                      | ✅ aplicada (2026-09-28) |
| 011 | `011_rpcs_so_autenticados.sql`        | nenhuma função atende a chave anon                                                          | ✅ aplicada (2026-09-28) |
| 012 | `012_entrada_no_casal_com_trava.sql`  | `for update` ao contar membros (fecha a corrida do 3º membro)                               | ✅ aplicada (2026-09-28) |
| 013 | `013_filmes_sem_sobrescrita.sql`      | cache de filmes não aceita reescrita nem caracteres de controle                             | ✅ aplicada (2026-09-28) |
| 014 | `014_sessoes_vinculos_do_casal.sql`   | sessão só referencia item/avaliação do próprio casal                                        | ✅ aplicada (2026-09-28) |
| 015 | `015_limites_de_tamanho.sql`          | tetos de tamanho + bucket `fotos` com 2 MB                                                  | ✅ aplicada (2026-09-28) |
| 016 | `016_push_permissoes_e_limites.sql`   | GRANTs do push + até 10 aparelhos por pessoa                                                | ✅ aplicada (2026-09-28) |
| 017 | `017_avaliacao_unica_por_casal.sql`   | uma avaliação por pessoa e filme **dentro do casal** (a 010 valia para o banco todo)        | ✅ aplicada (2026-09-30) |
| 018 | `018_publicacao_com_varias_fotos.sql` | `caminho_foto` vira `caminhos_fotos text[]` (várias fotos por publicação)                   | ⏳ aguardando o Diego    |
| 019 | `019_notificacao_de_novidades.sql`    | preferência `novidades` + leitura das preferências pela Edge Function (push de versão nova) | ⏳ aguardando o Diego    |

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
2. `entrar_no_casal()` trava a linha do casal (`for update`, desde a 012) e só então conta os membros e recusa o terceiro — duas entradas simultâneas não passam juntas.
3. Trigger `travar_maximo_dois` (BEFORE INSERT OR UPDATE OF casal_id): também trava o casal antes de contar e rejeita qualquer escrita que criasse uma terceira pessoa — vale até contra bug futuro em função DEFINER.

## RPCs disponíveis

| Função                       | O que faz                                                                      | Erros possíveis                                     |
| ---------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| `meu_casal_id()`             | casal do usuário logado (base de toda RLS)                                     | —                                                   |
| `criar_casal()`              | cria o casal e vincula quem chamou                                             | "você já está em um casal"                          |
| `entrar_no_casal(codigo)`    | entra com o código; **NULL = código inválido**                                 | "muitas tentativas…", "este casal já está completo" |
| `sair_do_casal()`            | desfaz o vínculo                                                               | —                                                   |
| `solicitar_exclusao_conta()` | agenda exclusão (carência 30 min)                                              | —                                                   |
| `cancelar_exclusao_conta()`  | desiste; o app chama a cada entrada                                            | —                                                   |
| `purgar_contas_excluidas()`  | job do pg_cron (a cada 5 min); não é RPC (sem EXECUTE para o app, desde a 011) | —                                                   |

## Jobs do pg_cron

| Job                         | Frequência   | Ação                                               |
| --------------------------- | ------------ | -------------------------------------------------- |
| `purgar-contas-excluidas`   | a cada 5 min | apaga `auth.users` com pedido de exclusão > 30 min |
| `limpar-tentativas-entrada` | diário às 3h | remove tentativas de convite com mais de 1 dia     |
