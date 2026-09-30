-- ============================================================================
-- 017_avaliacao_unica_por_casal.sql — Uma avaliação por filme, POR CASAL
-- ============================================================================
-- POR QUÊ:
--
-- A 010 criou `publicacoes_uma_avaliacao_por_autor_filme` em (autor_id,
-- tmdb_id): a regra valia para o banco inteiro. Mas tudo no app enxerga
-- só o casal atual — a RLS, a página do filme e a checagem "você já
-- avaliou este filme" do compositor. Quem sai de um casal e entra em outro
-- (e os usuários do e2e, que refazem o casal a cada execução) não enxerga
-- a avaliação antiga, tenta avaliar de novo e o INSERT volta 23505 — na
-- tela, um "Algo deu errado" sem saída. Confirmado em 2026-09-30 no e2e
-- "sessão passada vira Como foi?".
--
-- A regra passa a ser a que o app de fato aplica: cada pessoa avalia cada
-- filme uma vez DENTRO do casal. As avaliações do casal antigo continuam
-- lá (ver "sair do espaço" nos Ajustes) e não travam o casal novo.
--
-- O índice novo é mais permissivo que o antigo: os dados de hoje sempre
-- cabem nele, então a criação não falha.
-- ============================================================================

create unique index publicacoes_uma_avaliacao_por_casal_autor_filme
  on public.publicacoes (casal_id, autor_id, tmdb_id)
  where tipo = 'avaliacao';

drop index public.publicacoes_uma_avaliacao_por_autor_filme;
