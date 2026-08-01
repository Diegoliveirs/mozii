-- ============================================================================
-- 003_listas.sql — Listas de filmes do casal
-- ============================================================================
-- POR QUÊ deste jeito:
--
-- 1. Lista é do CASAL, não da pessoa: os dois veem, adicionam, marcam como
--    assistido e podem excluir. `criado_por`/`adicionado_por` registram a
--    autoria só para exibição ("adicionado por Diego").
--
-- 2. Autoria com ON DELETE CASCADE: excluir a conta leva junto as listas e
--    os itens que a pessoa criou — é a promessa da exclusão de conta
--    ("tudo que você criou some").
--
-- 3. `unique (lista_id, tmdb_id)`: o mesmo filme não entra duas vezes na
--    mesma lista.
--
-- 4. GRANT coluna a coluna nos UPDATEs: em `listas` só o nome muda; em
--    `itens_lista` só o `assistido`. Ninguém "move" item de lista ou lista
--    de casal por UPDATE — o WITH CHECK das policies reforça.
-- ============================================================================

create table public.listas (
  id uuid primary key default gen_random_uuid(),
  casal_id uuid not null references public.casais (id) on delete cascade,
  nome text not null check (length(nome) between 1 and 60),
  criado_por uuid not null references public.perfis (id) on delete cascade,
  criado_em timestamptz not null default now()
);

create index listas_por_casal on public.listas (casal_id, criado_em desc);

create table public.itens_lista (
  id uuid primary key default gen_random_uuid(),
  lista_id uuid not null references public.listas (id) on delete cascade,
  tmdb_id integer not null references public.filmes (tmdb_id),
  assistido boolean not null default false,
  adicionado_por uuid not null references public.perfis (id) on delete cascade,
  criado_em timestamptz not null default now(),
  unique (lista_id, tmdb_id)
);

create index itens_por_lista on public.itens_lista (lista_id, criado_em desc);

-- ----------------------------------------------------------------------------
-- RLS: tudo no escopo do casal
-- ----------------------------------------------------------------------------

alter table public.listas enable row level security;
alter table public.itens_lista enable row level security;

grant select, insert, delete on public.listas to authenticated;
grant update (nome) on public.listas to authenticated;

grant select, insert, delete on public.itens_lista to authenticated;
grant update (assistido) on public.itens_lista to authenticated;

create policy listas_ver_do_casal
  on public.listas for select to authenticated
  using (casal_id = public.meu_casal_id());

create policy listas_criar_no_casal
  on public.listas for insert to authenticated
  with check (casal_id = public.meu_casal_id() and criado_por = auth.uid());

create policy listas_editar_do_casal
  on public.listas for update to authenticated
  using (casal_id = public.meu_casal_id())
  with check (casal_id = public.meu_casal_id());

create policy listas_excluir_do_casal
  on public.listas for delete to authenticated
  using (casal_id = public.meu_casal_id());

-- Itens não têm casal_id; o escopo vem da lista a que pertencem.
create policy itens_ver_do_casal
  on public.itens_lista for select to authenticated
  using (lista_id in (select id from public.listas where casal_id = public.meu_casal_id()));

create policy itens_criar_no_casal
  on public.itens_lista for insert to authenticated
  with check (
    adicionado_por = auth.uid()
    and lista_id in (select id from public.listas where casal_id = public.meu_casal_id())
  );

create policy itens_editar_do_casal
  on public.itens_lista for update to authenticated
  using (lista_id in (select id from public.listas where casal_id = public.meu_casal_id()))
  with check (lista_id in (select id from public.listas where casal_id = public.meu_casal_id()));

create policy itens_excluir_do_casal
  on public.itens_lista for delete to authenticated
  using (lista_id in (select id from public.listas where casal_id = public.meu_casal_id()));
