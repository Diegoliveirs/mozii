-- ============================================================================
-- 005_momentos.sql — Momentos (diário de fotos do casal) e filmes favoritos
-- ============================================================================
-- POR QUÊ deste jeito:
--
-- 1. Momento tem DUAS datas de propósito: `aconteceu_em` (quando a memória
--    aconteceu — pode ser retroativa) e `criado_em` (quando foi registrada).
--    A linha do tempo ordena pelo acontecimento, não pelo registro.
--
-- 2. As fotos são um array de caminhos do bucket `fotos` (criado na 004).
--    Um momento precisa de legenda OU de pelo menos uma foto.
--
-- 3. Cada momento também vira uma publicação tipo 'momento' no Mural —
--    criada PELO APP (mesmo padrão das atividades), ganhando reações e
--    comentários de graça. O app desfaz o momento se o espelho falhar.
--
-- 4. Favoritos: até 5 filmes por PESSOA (não por casal), impostos pela
--    posição 1–5 com UNIQUE — o limite vira estrutura, não contagem.
--    Membros do casal veem os favoritos um do outro.
-- ============================================================================

create table public.momentos (
  id uuid primary key default gen_random_uuid(),
  casal_id uuid not null references public.casais (id) on delete cascade,
  autor_id uuid not null references public.perfis (id) on delete cascade,
  legenda text check (legenda is null or length(legenda) between 1 and 2000),
  aconteceu_em date not null default current_date,
  caminhos_fotos text[] not null default '{}',
  criado_em timestamptz not null default now(),
  -- Sem conteúdo não há memória: legenda ou pelo menos 1 foto.
  check (legenda is not null or array_length(caminhos_fotos, 1) >= 1)
);

create index momentos_linha_do_tempo
  on public.momentos (casal_id, aconteceu_em desc, criado_em desc);

create table public.favoritos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  casal_id uuid not null references public.casais (id) on delete cascade,
  tmdb_id integer not null references public.filmes (tmdb_id),
  posicao smallint not null check (posicao between 1 and 5),
  criado_em timestamptz not null default now(),
  unique (perfil_id, tmdb_id),
  -- Máximo de 5 favoritos por pessoa, garantido pela estrutura.
  unique (perfil_id, posicao)
);

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------

alter table public.momentos enable row level security;
alter table public.favoritos enable row level security;

grant select, insert, delete on public.momentos to authenticated;
grant select, insert, delete on public.favoritos to authenticated;
-- Sem UPDATE: memória se apaga e refaz; favorito se troca de posição
-- removendo e recriando. Menos caminhos = menos brechas.

create policy momentos_ver_do_casal
  on public.momentos for select to authenticated
  using (casal_id = public.meu_casal_id());

create policy momentos_criar_no_casal
  on public.momentos for insert to authenticated
  with check (casal_id = public.meu_casal_id() and autor_id = auth.uid());

create policy momentos_excluir_meus
  on public.momentos for delete to authenticated
  using (autor_id = auth.uid());

-- Favoritos: o casal vê os dois; cada um só mexe nos seus.
create policy favoritos_ver_do_casal
  on public.favoritos for select to authenticated
  using (casal_id = public.meu_casal_id());

create policy favoritos_criar_meus
  on public.favoritos for insert to authenticated
  with check (perfil_id = auth.uid() and casal_id = public.meu_casal_id());

create policy favoritos_excluir_meus
  on public.favoritos for delete to authenticated
  using (perfil_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Tempo real
-- ----------------------------------------------------------------------------

alter table public.momentos replica identity full;
alter table public.favoritos replica identity full;

alter publication supabase_realtime add table public.momentos, public.favoritos;
