-- ============================================================================
-- 015_limites_de_tamanho.sql — Teto de tamanho no que o cliente grava
-- ============================================================================
-- POR QUÊ:
--
-- 1. Os textos já tinham CHECK de tamanho (corpo, legenda, nome, observação),
--    mas caminhos de foto, `meta_atividade` e `url_avatar` não: um cliente
--    que fale direto com a API gravava centenas de KB por linha no banco
--    compartilhado (confirmado no staging da auditoria de 2026-09-28).
--
-- 2. Os tetos ficam muito acima do uso real (caminho ≈ 80 caracteres;
--    atividade de momento = id + lista de caminhos), só para cortar abuso.
--
-- 3. O bucket `fotos` cai de 50 MB para 2 MB por arquivo: o app sempre envia
--    WebP redimensionado (~200–400 KB). O redimensionamento é do navegador;
--    o limite de verdade precisa morar no servidor.
-- ============================================================================

alter table public.publicacoes
  add constraint publicacoes_caminho_foto_tamanho
    check (caminho_foto is null or length(caminho_foto) <= 300),
  add constraint publicacoes_meta_atividade_tamanho
    check (meta_atividade is null or pg_column_size(meta_atividade) <= 8192);

alter table public.momentos
  add constraint momentos_caminhos_fotos_tamanho
    check (cardinality(caminhos_fotos) <= 50
           and length(array_to_string(caminhos_fotos, '')) <= 50 * 300);

alter table public.perfis
  add constraint perfis_url_avatar_tamanho
    check (url_avatar is null or length(url_avatar) <= 300);

update storage.buckets set file_size_limit = 2097152 where id = 'fotos';
