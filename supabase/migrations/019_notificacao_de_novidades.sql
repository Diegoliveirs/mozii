-- ============================================================================
-- 019_notificacao_de_novidades.sql — Push quando o app ganha uma versão nova
-- ============================================================================
-- POR QUÊ:
--
-- 1. O Diego quer avisar quem ativou as notificações quando sai uma versão
--    com nota de atualização (2026-09-30). Quem manda é o GitHub, depois do
--    deploy de produção na Vercel (.github/workflows/avisar-novidades.yml),
--    chamando a mesma Edge Function `enviar-push` com o `X-Segredo` — o
--    banco não dispara nada, então não há trigger nem função nova aqui.
--
-- 2. É um tipo novo de preferência, como os da 008: cada pessoa desliga nos
--    Ajustes. Ligado por padrão (sem linha = tudo ligado, igual aos outros).
--
-- 3. Diferente dos outros tipos, o destinatário não é "o par": são todos os
--    inscritos. A Edge Function (service role) precisa LER as preferências
--    para pular quem desligou — a 016 só deu a ela as inscrições.
--
-- APLICAR JUNTO COM O DEPLOY: o app novo lê a coluna `novidades` nos Ajustes.
-- ============================================================================

alter table public.preferencias_notificacao
  add column novidades boolean not null default true;

grant select on public.preferencias_notificacao to service_role;
