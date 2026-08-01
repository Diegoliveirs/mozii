-- ============================================================================
-- 006_sessoes.sql — Sessão de cinema agendada (a feature nova do Mozii 2.0)
-- ============================================================================
-- POR QUÊ deste jeito:
--
-- 1. Uma sessão é um COMPROMISSO do casal: filme + data/hora + observação
--    ("leva pipoca doce"). Nasce 'agendada' e termina 'assistida' ou
--    'cancelada'. Sessão com horário no passado NÃO muda de status sozinha —
--    vira o estado visual "como foi?" até alguém resolver.
--
-- 2. Diferente das publicações, o UPDATE é permitido a QUALQUER membro do
--    casal: reagendar, cancelar ou marcar como assistida é ação do casal,
--    não de quem criou.
--
-- 3. `item_lista_id` lembra de onde a sessão veio (SET NULL se o item sair):
--    concluir a sessão marca o filme como assistido na lista de origem.
--
-- 4. A RPC `concluir_sessao` amarra o final feliz numa transação só:
--    status 'assistida' + vínculo com a avaliação (opcional) + `assistido`
--    no item de origem. Ou tudo, ou nada.
-- ============================================================================

create table public.sessoes_cinema (
  id uuid primary key default gen_random_uuid(),
  casal_id uuid not null references public.casais (id) on delete cascade,
  criado_por uuid not null references public.perfis (id) on delete cascade,
  tmdb_id integer not null references public.filmes (tmdb_id),
  -- De onde veio (página do filme = null; lista/sorteio = o item).
  item_lista_id uuid references public.itens_lista (id) on delete set null,
  agendada_para timestamptz not null,
  observacao text check (observacao is null or length(observacao) between 1 and 280),
  status text not null default 'agendada'
    check (status in ('agendada', 'assistida', 'cancelada')),
  assistida_em timestamptz,
  publicacao_avaliacao_id uuid references public.publicacoes (id) on delete set null,
  criado_em timestamptz not null default now(),
  -- Assistida sem data de quando? Não existe.
  check (status <> 'assistida' or assistida_em is not null)
);

-- O índice do cartão do Mural: a próxima sessão agendada do casal.
create index sessoes_agendadas
  on public.sessoes_cinema (casal_id, agendada_para)
  where status = 'agendada';

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------

alter table public.sessoes_cinema enable row level security;

grant select, insert on public.sessoes_cinema to authenticated;
-- UPDATE só nas colunas do ciclo de vida — filme, casal e autor são imutáveis.
grant update (agendada_para, observacao, status, assistida_em, publicacao_avaliacao_id)
  on public.sessoes_cinema to authenticated;

create policy sessoes_ver_do_casal
  on public.sessoes_cinema for select to authenticated
  using (casal_id = public.meu_casal_id());

create policy sessoes_criar_no_casal
  on public.sessoes_cinema for insert to authenticated
  with check (casal_id = public.meu_casal_id() and criado_por = auth.uid());

-- Qualquer membro do casal reagenda/cancela/conclui (ver cabeçalho, item 2).
create policy sessoes_editar_do_casal
  on public.sessoes_cinema for update to authenticated
  using (casal_id = public.meu_casal_id())
  with check (casal_id = public.meu_casal_id());

-- ----------------------------------------------------------------------------
-- RPC: concluir a sessão (com ou sem avaliação)
-- ----------------------------------------------------------------------------

create or replace function public.concluir_sessao(
  p_sessao_id uuid,
  p_publicacao_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  sessao public.sessoes_cinema;
begin
  select * into sessao
  from public.sessoes_cinema
  where id = p_sessao_id and casal_id = public.meu_casal_id();

  if sessao.id is null then
    raise exception 'sessão não encontrada';
  end if;
  if sessao.status <> 'agendada' then
    raise exception 'esta sessão já foi resolvida';
  end if;

  update public.sessoes_cinema
  set status = 'assistida',
      assistida_em = now(),
      publicacao_avaliacao_id = p_publicacao_id
  where id = p_sessao_id;

  -- Fecha o ciclo com a lista de origem, se ela ainda existir.
  if sessao.item_lista_id is not null then
    update public.itens_lista set assistido = true where id = sessao.item_lista_id;
  end if;
end;
$$;

grant execute on function public.concluir_sessao(uuid, uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- Tempo real
-- ----------------------------------------------------------------------------

alter table public.sessoes_cinema replica identity full;
alter publication supabase_realtime add table public.sessoes_cinema;
