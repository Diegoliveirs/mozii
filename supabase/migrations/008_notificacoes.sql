-- ============================================================================
-- 008_notificacoes.sql — Web Push do casal: inscrições, preferências e
--                        os gatilhos que avisam o par
-- ============================================================================
-- POR QUÊ deste jeito:
--
-- 1. Push próprio (VAPID + Edge Function), sem FCM/OneSignal: dois usuários
--    não justificam serviço externo, e o backend continua legível em SQL.
--
-- 2. `inscricoes_push` é POR PESSOA e por aparelho (endpoint UNIQUE): o
--    celular e o desktop do mesmo usuário são duas linhas. RLS: cada um
--    gerencia só as suas; a Edge Function lê com a service role.
--
-- 3. `preferencias_notificacao` é opcional: sem linha = tudo ligado. Os
--    nomes das colunas SÃO os tipos de notificação — `notificar_par()`
--    consulta a coluna pelo nome do tipo.
--
-- 4. `notificar_par()` roda como SECURITY DEFINER, valida o tipo contra uma
--    lista fechada e engole qualquer erro: push NUNCA derruba a ação que o
--    disparou. A URL, a chave publicável e o segredo do gatilho vivem no
--    Vault (nada de segredo em código versionado).
--
-- 5. Os triggers só empacotam dados crus e chamam `net.http_post`
--    (assíncrono). O TEXTO da notificação mora na Edge Function, perto do
--    formato de exibição — mesma filosofia das atividades geradas pelo app.
--
-- 6. EXECUTE de `notificar_par` é revogado de `authenticated`: só os
--    triggers (donos das tabelas) disparam push; ninguém spamma o par
--    chamando a função direto.
-- ============================================================================

create extension if not exists pg_net;

-- ----------------------------------------------------------------------------
-- Inscrições de push (um aparelho = uma linha)
-- ----------------------------------------------------------------------------

create table public.inscricoes_push (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  criado_em timestamptz not null default now()
);

create index inscricoes_push_por_perfil on public.inscricoes_push (perfil_id);

alter table public.inscricoes_push enable row level security;

create policy "dono ve suas inscricoes"
  on public.inscricoes_push for select
  using (perfil_id = auth.uid());

create policy "dono cria suas inscricoes"
  on public.inscricoes_push for insert
  with check (perfil_id = auth.uid());

create policy "dono renova suas inscricoes"
  on public.inscricoes_push for update
  using (perfil_id = auth.uid())
  with check (perfil_id = auth.uid());

create policy "dono remove suas inscricoes"
  on public.inscricoes_push for delete
  using (perfil_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Preferências por tipo (ausência de linha = tudo ligado)
-- ----------------------------------------------------------------------------

create table public.preferencias_notificacao (
  perfil_id uuid primary key references public.perfis (id) on delete cascade,
  comentarios boolean not null default true,
  publicacoes boolean not null default true,
  curtidas boolean not null default true,
  memorias boolean not null default true,
  listas boolean not null default true,
  casal boolean not null default true
);

alter table public.preferencias_notificacao enable row level security;

create policy "dono le suas preferencias"
  on public.preferencias_notificacao for select
  using (perfil_id = auth.uid());

create policy "dono cria suas preferencias"
  on public.preferencias_notificacao for insert
  with check (perfil_id = auth.uid());

create policy "dono edita suas preferencias"
  on public.preferencias_notificacao for update
  using (perfil_id = auth.uid())
  with check (perfil_id = auth.uid());

-- ----------------------------------------------------------------------------
-- notificar_par(): resolve o par, checa a preferência e chama a Edge Function
-- ----------------------------------------------------------------------------

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
  -- Lista fechada: o tipo É o nome da coluna de preferência.
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

-- ----------------------------------------------------------------------------
-- Gatilhos: publicações (post, avaliação, memória-espelho, filme na lista)
-- ----------------------------------------------------------------------------

create or replace function public.ao_publicar_notificar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tipo text;
  v_dados jsonb;
begin
  if new.tipo in ('texto', 'avaliacao') then
    v_tipo := 'publicacoes';
    v_dados := jsonb_build_object(
      'publicacaoId', new.id,
      'tipoPublicacao', new.tipo,
      'trecho', left(coalesce(new.corpo, ''), 80),
      'nota', new.nota,
      'tituloFilme', (select titulo from public.filmes where tmdb_id = new.tmdb_id)
    );
  elsif new.tipo = 'momento' then
    v_tipo := 'memorias';
    v_dados := jsonb_build_object('trecho', left(coalesce(new.corpo, ''), 80));
  elsif new.tipo = 'atividade' and new.meta_atividade ->> 'acao' = 'adicionou_na_lista' then
    -- Só "adicionou à lista" vira push; as outras atividades ficam mudas.
    v_tipo := 'listas';
    v_dados := jsonb_build_object(
      'tituloFilme', new.meta_atividade ->> 'tituloFilme',
      'nomeLista', new.meta_atividade ->> 'nomeLista'
    );
  else
    return new;
  end if;

  perform public.notificar_par(new.autor_id, v_tipo, v_dados);
  return new;
end;
$$;

create trigger notificar_publicacao
  after insert on public.publicacoes
  for each row execute function public.ao_publicar_notificar();

-- ----------------------------------------------------------------------------
-- Gatilhos: comentários e curtidas
-- ----------------------------------------------------------------------------

create or replace function public.ao_comentar_notificar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.notificar_par(
    new.autor_id,
    'comentarios',
    jsonb_build_object('publicacaoId', new.publicacao_id, 'trecho', left(new.corpo, 80))
  );
  return new;
end;
$$;

create trigger notificar_comentario
  after insert on public.comentarios
  for each row execute function public.ao_comentar_notificar();

create or replace function public.ao_curtir_notificar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- O app grava sempre ❤️ (like); emojis antigos não notificam.
  if new.emoji = '❤️' then
    perform public.notificar_par(
      new.autor_id,
      'curtidas',
      jsonb_build_object('publicacaoId', new.publicacao_id)
    );
  end if;
  return new;
end;
$$;

create trigger notificar_curtida
  after insert on public.reacoes
  for each row execute function public.ao_curtir_notificar();

-- ----------------------------------------------------------------------------
-- Gatilho: o par entrou no espaço
-- ----------------------------------------------------------------------------

create or replace function public.ao_parear_notificar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Só o momento de ENTRAR num casal (null -> valor) interessa.
  if old.casal_id is null and new.casal_id is not null then
    perform public.notificar_par(new.id, 'casal', '{}'::jsonb);
  end if;
  return new;
end;
$$;

create trigger notificar_pareamento
  after update of casal_id on public.perfis
  for each row execute function public.ao_parear_notificar();
