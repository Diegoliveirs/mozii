-- ============================================================================
-- 014_sessoes_vinculos_do_casal.sql — A sessão só aponta para coisas do casal
-- ============================================================================
-- POR QUÊ:
--
-- 1. `item_lista_id` e `publicacao_avaliacao_id` aceitavam ids de OUTRO casal:
--    a FK confere só que a linha existe (e FK ignora RLS). Com isso,
--    `concluir_sessao` (SECURITY DEFINER) marcava como assistido um item da
--    lista de outro casal — confirmado no staging da auditoria de 2026-09-28.
--
-- 2. Três amarras, todas contra o casal da sessão:
--    - INSERT: o item de origem e a avaliação precisam ser do meu casal.
--    - UPDATE: a avaliação vinculada precisa ser do meu casal.
--    - RPC: valida a avaliação (do casal e do tipo 'avaliacao') e o UPDATE do
--      item só atinge listas do casal da sessão.
--
-- 3. A RPC recusa chamada sem usuário (segunda camada da 011).
-- ============================================================================

drop policy sessoes_criar_no_casal on public.sessoes_cinema;
create policy sessoes_criar_no_casal
  on public.sessoes_cinema for insert to authenticated
  with check (
    casal_id = public.meu_casal_id()
    and criado_por = auth.uid()
    and (item_lista_id is null or exists (
      select 1 from public.itens_lista i
      join public.listas l on l.id = i.lista_id
      where i.id = item_lista_id and l.casal_id = public.meu_casal_id()))
    and (publicacao_avaliacao_id is null or exists (
      select 1 from public.publicacoes p
      where p.id = publicacao_avaliacao_id and p.casal_id = public.meu_casal_id()))
  );

drop policy sessoes_editar_do_casal on public.sessoes_cinema;
create policy sessoes_editar_do_casal
  on public.sessoes_cinema for update to authenticated
  using (casal_id = public.meu_casal_id())
  with check (
    casal_id = public.meu_casal_id()
    and (publicacao_avaliacao_id is null or exists (
      select 1 from public.publicacoes p
      where p.id = publicacao_avaliacao_id and p.casal_id = public.meu_casal_id()))
  );

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
  if auth.uid() is null then
    raise exception 'autenticação obrigatória' using errcode = '42501';
  end if;

  select * into sessao
  from public.sessoes_cinema
  where id = p_sessao_id and casal_id = public.meu_casal_id();

  if sessao.id is null then
    raise exception 'sessão não encontrada';
  end if;
  if sessao.status <> 'agendada' then
    raise exception 'esta sessão já foi resolvida';
  end if;
  if p_publicacao_id is not null and not exists (
    select 1 from public.publicacoes
    where id = p_publicacao_id and casal_id = sessao.casal_id and tipo = 'avaliacao'
  ) then
    raise exception 'avaliação não encontrada';
  end if;

  update public.sessoes_cinema
  set status = 'assistida',
      assistida_em = now(),
      publicacao_avaliacao_id = p_publicacao_id
  where id = p_sessao_id;

  -- Fecha o ciclo com a lista de origem — e só se ela for do casal da sessão.
  if sessao.item_lista_id is not null then
    update public.itens_lista i
    set assistido = true
    from public.listas l
    where i.id = sessao.item_lista_id
      and l.id = i.lista_id
      and l.casal_id = sessao.casal_id;
  end if;
end;
$$;
