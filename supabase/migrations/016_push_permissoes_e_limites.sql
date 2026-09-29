-- ============================================================================
-- 016_push_permissoes_e_limites.sql — Push com acesso declarado e com teto
-- ============================================================================
-- POR QUÊ:
--
-- 1. A 008 criou `inscricoes_push` e `preferencias_notificacao` com RLS e
--    policies, mas SEM GRANT: projeto novo do Supabase não expõe tabela
--    sozinho (ver 001). No staging da auditoria de 2026-09-28 o app não
--    conseguia nem salvar a inscrição. Aqui o acesso fica explícito, como
--    em todas as outras tabelas.
--
-- 2. As policies da 008 não diziam o papel (valiam para PUBLIC). Passam a
--    valer só para `authenticated`.
--
-- 3. Tetos contra abuso: no máximo 10 aparelhos por pessoa, endpoint só
--    `https://` e chaves com tamanho de chave. Sem isso, cada comentário
--    virava uma chamada da Edge Function com N envios para URLs escolhidas
--    por quem cadastrou as inscrições.
-- ============================================================================

grant select, insert, update, delete on public.inscricoes_push to authenticated;
grant select, insert, update on public.preferencias_notificacao to authenticated;
-- A Edge Function lê as inscrições do par e apaga as vencidas (404/410).
grant select, delete on public.inscricoes_push to service_role;

alter policy "dono ve suas inscricoes" on public.inscricoes_push to authenticated;
alter policy "dono cria suas inscricoes" on public.inscricoes_push to authenticated;
alter policy "dono renova suas inscricoes" on public.inscricoes_push to authenticated;
alter policy "dono remove suas inscricoes" on public.inscricoes_push to authenticated;
alter policy "dono le suas preferencias" on public.preferencias_notificacao to authenticated;
alter policy "dono cria suas preferencias" on public.preferencias_notificacao to authenticated;
alter policy "dono edita suas preferencias" on public.preferencias_notificacao to authenticated;

alter table public.inscricoes_push
  add constraint inscricoes_push_endpoint_valido
    check (endpoint ~ '^https://' and length(endpoint) <= 1000),
  add constraint inscricoes_push_chaves_tamanho
    check (length(p256dh) <= 200 and length(auth) <= 200);

-- Teto de aparelhos por pessoa. Trigger (e não CHECK) porque depende das
-- outras linhas da mesma pessoa.
create or replace function public.limitar_inscricoes_push()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if (select count(*) from public.inscricoes_push
      where perfil_id = new.perfil_id and endpoint <> new.endpoint) >= 10 then
    raise exception 'limite de aparelhos com notificação atingido';
  end if;
  return new;
end;
$$;

create trigger limitar_inscricoes_push
  before insert on public.inscricoes_push
  for each row execute function public.limitar_inscricoes_push();
