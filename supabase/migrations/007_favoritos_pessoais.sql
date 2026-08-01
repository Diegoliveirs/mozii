-- ============================================================================
-- 007_favoritos_pessoais.sql — Favoritos pertencem à PESSOA, não ao casal
-- ============================================================================
-- POR QUÊ:
--
-- A 005 amarrou os favoritos ao casal (coluna casal_id). Os testes E2E
-- expuseram o defeito: ao sair de um casal e formar outro, os favoritos
-- antigos ficavam INVISÍVEIS (a RLS filtrava pelo casal atual) mas ainda
-- BLOQUEAVAM o filme e a posição — os UNIQUE são por pessoa.
--
-- Correção de modelo: favorito é da pessoa e a acompanha entre pareamentos.
-- O par enxerga os favoritos um do outro pela relação de perfis, não por
-- uma coluna duplicada.
-- ============================================================================

drop policy favoritos_ver_do_casal on public.favoritos;
drop policy favoritos_criar_meus on public.favoritos;
drop policy favoritos_excluir_meus on public.favoritos;

alter table public.favoritos drop column casal_id;

-- Vejo os meus e os de quem está no meu casal.
create policy favoritos_ver_do_casal
  on public.favoritos for select to authenticated
  using (
    perfil_id = auth.uid()
    or perfil_id in (select id from public.perfis where casal_id = public.meu_casal_id())
  );

create policy favoritos_criar_meus
  on public.favoritos for insert to authenticated
  with check (perfil_id = auth.uid());

create policy favoritos_excluir_meus
  on public.favoritos for delete to authenticated
  using (perfil_id = auth.uid());
