-- ============================================================================
-- 004_mural.sql — O Mural do casal: publicações, comentários, reações,
--                 fotos (Storage) e tempo real
-- ============================================================================
-- POR QUÊ deste jeito:
--
-- 1. UMA tabela de publicações com 4 tipos (texto, avaliação, atividade,
--    momento), validados por CHECK por tipo. Um feed = uma consulta.
--    O tipo 'momento' já nasce aqui para a Fase 4 não alterar a tabela.
--
-- 2. Atividades ("Diego adicionou Duna à lista") são geradas PELO APP, não
--    por trigger — o formato fica visível no código do frontend e o banco
--    não precisa conhecer as regras de exibição.
--
-- 3. Publicação é do casal; edição e exclusão são SÓ do autor. O UPDATE é
--    limitado por GRANT às colunas `corpo` e `nota` (editar a própria
--    avaliação) — ninguém muda tipo, autor ou casal de uma publicação.
--
-- 4. O bucket `fotos` entra AQUI (e não na 005, como o plano previa)
--    porque publicação com foto depende dele. As policies isolam por
--    pasta: cada casal só toca em `{casal_id}/...`.
--
-- 5. O tempo real também entra aqui (idem): as tabelas do feed e das
--    listas vão para a publication com `replica identity full`. O socket
--    respeita RLS — o app precisa reenviar o JWT (já feito no cliente).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Publicações
-- ----------------------------------------------------------------------------

create table public.publicacoes (
  id uuid primary key default gen_random_uuid(),
  casal_id uuid not null references public.casais (id) on delete cascade,
  autor_id uuid not null references public.perfis (id) on delete cascade,
  tipo text not null check (tipo in ('texto', 'avaliacao', 'atividade', 'momento')),
  corpo text check (corpo is null or length(corpo) between 1 and 2000),
  caminho_foto text,
  tmdb_id integer references public.filmes (tmdb_id),
  -- Meia estrela permitida: 0.5, 1.0, ..., 5.0
  nota numeric(2, 1) check (nota is null or (nota between 0.5 and 5 and mod(nota * 10, 5) = 0)),
  meta_atividade jsonb,
  criado_em timestamptz not null default now(),

  -- O que cada tipo exige (e proíbe):
  constraint texto_valido check (
    tipo <> 'texto' or (
      (corpo is not null or caminho_foto is not null)
      and tmdb_id is null and nota is null and meta_atividade is null
    )
  ),
  constraint avaliacao_valida check (
    tipo <> 'avaliacao' or (tmdb_id is not null and nota is not null and meta_atividade is null)
  ),
  constraint atividade_valida check (
    tipo <> 'atividade' or (meta_atividade is not null and nota is null and caminho_foto is null)
  ),
  constraint momento_valido check (
    tipo <> 'momento' or meta_atividade is not null
  )
);

-- O índice do feed: paginação por cursor em (criado_em desc).
create index publicacoes_feed on public.publicacoes (casal_id, criado_em desc);

create table public.comentarios (
  id uuid primary key default gen_random_uuid(),
  publicacao_id uuid not null references public.publicacoes (id) on delete cascade,
  autor_id uuid not null references public.perfis (id) on delete cascade,
  corpo text not null check (length(corpo) between 1 and 1000),
  criado_em timestamptz not null default now()
);

create index comentarios_por_publicacao on public.comentarios (publicacao_id, criado_em);

create table public.reacoes (
  id uuid primary key default gen_random_uuid(),
  publicacao_id uuid not null references public.publicacoes (id) on delete cascade,
  autor_id uuid not null references public.perfis (id) on delete cascade,
  -- Emoji LIVRE (qualquer um do teclado); o unique impede repetir o mesmo.
  emoji text not null check (length(emoji) between 1 and 16),
  criado_em timestamptz not null default now(),
  unique (publicacao_id, autor_id, emoji)
);

create index reacoes_por_publicacao on public.reacoes (publicacao_id);

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------

alter table public.publicacoes enable row level security;
alter table public.comentarios enable row level security;
alter table public.reacoes enable row level security;

grant select, insert, delete on public.publicacoes to authenticated;
grant update (corpo, nota) on public.publicacoes to authenticated;
grant select, insert, delete on public.comentarios to authenticated;
grant select, insert, delete on public.reacoes to authenticated;

create policy publicacoes_ver_do_casal
  on public.publicacoes for select to authenticated
  using (casal_id = public.meu_casal_id());

create policy publicacoes_criar_no_casal
  on public.publicacoes for insert to authenticated
  with check (casal_id = public.meu_casal_id() and autor_id = auth.uid());

-- Editar (corpo/nota) e excluir: só o autor.
create policy publicacoes_editar_minhas
  on public.publicacoes for update to authenticated
  using (autor_id = auth.uid())
  with check (autor_id = auth.uid() and casal_id = public.meu_casal_id());

create policy publicacoes_excluir_minhas
  on public.publicacoes for delete to authenticated
  using (autor_id = auth.uid());

-- Comentários e reações: escopo herdado da publicação; escrita em meu nome.
create policy comentarios_ver_do_casal
  on public.comentarios for select to authenticated
  using (publicacao_id in (select id from public.publicacoes where casal_id = public.meu_casal_id()));

create policy comentarios_criar_no_casal
  on public.comentarios for insert to authenticated
  with check (
    autor_id = auth.uid()
    and publicacao_id in (select id from public.publicacoes where casal_id = public.meu_casal_id())
  );

create policy comentarios_excluir_meus
  on public.comentarios for delete to authenticated
  using (autor_id = auth.uid());

create policy reacoes_ver_do_casal
  on public.reacoes for select to authenticated
  using (publicacao_id in (select id from public.publicacoes where casal_id = public.meu_casal_id()));

create policy reacoes_criar_no_casal
  on public.reacoes for insert to authenticated
  with check (
    autor_id = auth.uid()
    and publicacao_id in (select id from public.publicacoes where casal_id = public.meu_casal_id())
  );

create policy reacoes_excluir_minhas
  on public.reacoes for delete to authenticated
  using (autor_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Storage: bucket privado `fotos`, uma pasta por casal
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', false, 52428800, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- O caminho é sempre `{casal_id}/{uuid}.webp`; a primeira pasta decide tudo.
create policy fotos_ver_do_casal
  on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = public.meu_casal_id()::text);

create policy fotos_enviar_do_casal
  on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = public.meu_casal_id()::text);

create policy fotos_apagar_do_casal
  on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = public.meu_casal_id()::text);

-- ----------------------------------------------------------------------------
-- Tempo real: feed e listas avisam o par sem recarregar
-- ----------------------------------------------------------------------------

-- `replica identity full`: o evento carrega a linha inteira (necessário
-- para o DELETE chegar com os dados que o cliente usa para invalidar).
alter table public.publicacoes replica identity full;
alter table public.comentarios replica identity full;
alter table public.reacoes replica identity full;
alter table public.listas replica identity full;
alter table public.itens_lista replica identity full;

alter publication supabase_realtime
  add table public.publicacoes, public.comentarios, public.reacoes,
            public.listas, public.itens_lista;
