-- ============================================================================
-- 018_publicacao_com_varias_fotos.sql — Publicação com quantas fotos quiser
-- ============================================================================
-- POR QUÊ:
--
-- 1. A 004 nasceu com UMA foto por publicação (`caminho_foto text`). O Diego
--    pediu para anexar várias, sem limite no app (2026-09-30). A coluna vira
--    um array, igual a `momentos.caminhos_fotos` (005) — mesmo formato, mesma
--    grade de fotos no app.
--
-- 2. As publicações antigas não perdem nada: a foto única vira um array de
--    um item antes de a coluna velha sair.
--
-- 3. Os CHECKs que citavam `caminho_foto` (texto_valido, atividade_valida e o
--    teto da 015) são recriados sobre o array. O teto contra abuso segue o
--    dos momentos (50 fotos × 300 caracteres): o app não impõe limite, só o
--    banco corta um cliente que fale direto com a API.
--
-- 4. O GRANT de UPDATE continua só em (corpo, nota): as fotos não se editam
--    depois de publicadas, como antes.
--
-- APLICAR JUNTO COM O DEPLOY: o app de antes lê `caminho_foto` e para de
-- carregar o Mural enquanto o app novo não estiver no ar.
-- ============================================================================

alter table public.publicacoes
  add column caminhos_fotos text[] not null default '{}';

update public.publicacoes
  set caminhos_fotos = array[caminho_foto]
  where caminho_foto is not null;

alter table public.publicacoes
  drop constraint texto_valido,
  drop constraint atividade_valida,
  drop constraint publicacoes_caminho_foto_tamanho,
  drop column caminho_foto;

alter table public.publicacoes
  add constraint texto_valido check (
    tipo <> 'texto' or (
      (corpo is not null or cardinality(caminhos_fotos) >= 1)
      and tmdb_id is null and nota is null and meta_atividade is null
    )
  ),
  add constraint atividade_valida check (
    tipo <> 'atividade' or (
      meta_atividade is not null and nota is null and cardinality(caminhos_fotos) = 0
    )
  ),
  add constraint publicacoes_caminhos_fotos_tamanho check (
    cardinality(caminhos_fotos) <= 50
    and length(array_to_string(caminhos_fotos, '')) <= 50 * 300
  );
