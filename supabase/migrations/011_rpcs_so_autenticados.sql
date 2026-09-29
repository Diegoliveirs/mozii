-- ============================================================================
-- 011_rpcs_so_autenticados.sql — Nenhuma função do banco atende a chave anon
-- ============================================================================
-- POR QUÊ:
--
-- 1. O Postgres dá EXECUTE a PUBLIC em toda função nova. As migrations 001,
--    002 e 006 fizeram `grant ... to authenticated`, mas isso SOMA, não
--    substitui: a chave anon (que vai no bundle do app) continuava chamando
--    as RPCs sem conta. Na auditoria de 2026-09-28 isso virou um oráculo de
--    código de convite sem limite (com auth.uid() nulo o rate-limit nunca
--    conta) e escrita anônima no cache global de filmes.
--
-- 2. Aqui revogamos PUBLIC/anon de TODAS as funções do schema. As RPCs do app
--    continuam liberadas porque o grant explícito para `authenticated` (nas
--    migrations de origem) não depende de PUBLIC.
--
-- 3. Funções internas (purga, sorteio do código e as de trigger) saem também
--    de `authenticated`: só o pg_cron, os triggers e outras funções DEFINER
--    as chamam — todos rodam como dono, sem precisar de EXECUTE.
--
-- 4. Default privileges: funções criadas DEPOIS desta migration nascem sem
--    EXECUTE público. Toda migration futura precisa declarar o próprio grant
--    (que já é a regra do projeto). A forma sem `in schema` é a única que
--    remove PUBLIC — a forma por schema só consegue acrescentar.
-- ============================================================================

revoke execute on all functions in schema public from public, anon;

revoke execute on function public.purgar_contas_excluidas() from authenticated;
revoke execute on function public.gerar_codigo_convite() from authenticated;
revoke execute on function public.ao_criar_usuario() from authenticated;
revoke execute on function public.travar_maximo_dois() from authenticated;
revoke execute on function public.ao_publicar_notificar() from authenticated;
revoke execute on function public.ao_comentar_notificar() from authenticated;
revoke execute on function public.ao_curtir_notificar() from authenticated;
revoke execute on function public.ao_parear_notificar() from authenticated;

alter default privileges for role postgres revoke execute on functions from public;
alter default privileges for role postgres in schema public revoke execute on functions from anon;
