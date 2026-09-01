-- 009_autenticar_push_pg_net.sql — inclui a Publishable key no pg_net.
-- A Edge Function continua protegida pelo X-Segredo; o apikey permite que o
-- gateway do Supabase aceite e encaminhe a chamada assincrona do banco.

create or replace function public.notificar_par(p_autor uuid, p_tipo text, p_dados jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_casal uuid;
  v_nome_autor text;
  v_par uuid;
  v_quer boolean;
  v_url text;
  v_segredo text;
  v_chave_api text;
begin
  if p_tipo not in ('comentarios', 'publicacoes', 'curtidas', 'memorias', 'listas', 'casal') then
    return;
  end if;

  select casal_id, nome_exibicao into v_casal, v_nome_autor
  from public.perfis where id = p_autor;
  if v_casal is null then return; end if;

  select id into v_par
  from public.perfis
  where casal_id = v_casal and id <> p_autor
  limit 1;
  if v_par is null then return; end if;

  execute format(
    'select coalesce((select %I from public.preferencias_notificacao where perfil_id = $1), true)',
    p_tipo
  ) into v_quer using v_par;
  if not v_quer then return; end if;

  select decrypted_secret into v_url
  from vault.decrypted_secrets where name = 'push_url_funcao';
  select decrypted_secret into v_segredo
  from vault.decrypted_secrets where name = 'push_segredo_gatilho';
  select decrypted_secret into v_chave_api
  from vault.decrypted_secrets where name = 'push_chave_publicavel';
  if v_url is null or v_segredo is null or v_chave_api is null then return; end if;

  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_chave_api,
      'X-Segredo', v_segredo
    ),
    body := jsonb_build_object(
      'destinatario', v_par,
      'tipo', p_tipo,
      'nomeAutor', v_nome_autor,
      'dados', coalesce(p_dados, '{}'::jsonb)
    )
  );
exception when others then
  -- Push é cortesia: falhar aqui não pode desfazer a publicação/comentário.
  null;
end;
$$;

revoke execute on function public.notificar_par(uuid, text, jsonb) from public, anon, authenticated;
