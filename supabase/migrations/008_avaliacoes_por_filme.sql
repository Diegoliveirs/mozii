-- ==========================================================================
-- 008_avaliacoes_por_filme.sql — Uma avaliação de cada pessoa por filme
-- ==========================================================================

-- Não apaga histórico automaticamente: se houver duplicatas antigas, a
-- migration para e elas precisam ser resolvidas conscientemente antes de
-- ativar a regra única.
do $$
begin
  if exists (
    select 1
    from public.publicacoes
    where tipo = 'avaliacao'
    group by autor_id, tmdb_id
    having count(*) > 1
  ) then
    raise exception
      'Há avaliações repetidas para a mesma pessoa e filme. Resolva-as antes de aplicar a 008.';
  end if;
end $$;

-- A pessoa avalia cada filme uma única vez; depois, edita a própria publicação.
create unique index publicacoes_uma_avaliacao_por_autor_filme
  on public.publicacoes (autor_id, tmdb_id)
  where tipo = 'avaliacao';

-- A página do filme busca as avaliações do casal por tmdb_id, da mais nova
-- para a mais antiga.
create index publicacoes_avaliacoes_por_filme
  on public.publicacoes (casal_id, tmdb_id, criado_em desc)
  where tipo = 'avaliacao';
