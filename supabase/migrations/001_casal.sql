-- ============================================================================
-- 001_casal.sql — A fundação do Mozii: o casal e as duas pessoas dele
-- ============================================================================
-- POR QUÊ deste jeito:
--
-- 1. O app não tem servidor próprio: o navegador fala direto com o Postgres
--    usando a chave "anon". Toda a segurança mora AQUI, em RLS e funções
--    SECURITY DEFINER. O frontend decide apenas o que MOSTRAR, nunca o que
--    alguém PODE fazer.
--
-- 2. Um "casal" é um espaço com no máximo DUAS pessoas — isso é regra de
--    produto e está imposta em três camadas (RPC, contagem e trigger),
--    para que nem um bug futuro consiga furar.
--
-- 3. `casal_id` no perfil só muda por RPC. O UPDATE direto em `perfis` é
--    permitido somente nas colunas de aparência (nome e avatar), via GRANT
--    coluna a coluna.
--
-- 4. Código de convite inválido retorna NULL em vez de erro. Motivo sutil:
--    um RAISE EXCEPTION desfaz a transação inteira e apagaria o registro da
--    tentativa em `tentativas_entrada`, zerando o controle de força bruta.
--
-- 5. Excluir conta tem carência de 30 minutos (um job do pg_cron purga
--    depois). Entrar de novo no app dentro da carência cancela a exclusão.
-- ============================================================================

-- pg_cron executa os jobs agendados (purga de contas, limpeza de tentativas).
create extension if not exists pg_cron;

-- ----------------------------------------------------------------------------
-- Tabelas
-- ----------------------------------------------------------------------------

create table public.casais (
  id uuid primary key default gen_random_uuid(),
  -- Código que uma pessoa mostra para a outra entrar no casal.
  codigo_convite text not null unique,
  -- Quem criou o casal. SET NULL: o casal sobrevive se essa conta for excluída.
  criado_por uuid references auth.users (id) on delete set null,
  -- Data de aniversário do relacionamento — vira marco na linha do tempo.
  data_aniversario date,
  criado_em timestamptz not null default now()
);

create table public.perfis (
  -- Mesmo id do usuário no Auth; excluir a conta leva o perfil junto.
  id uuid primary key references auth.users (id) on delete cascade,
  nome_exibicao text not null check (length(nome_exibicao) between 1 and 40),
  url_avatar text,
  -- Vínculo com o casal. Só muda via RPC (ver GRANTs no fim do arquivo).
  casal_id uuid references public.casais (id) on delete set null,
  -- Preenchido quando a pessoa pede exclusão da conta; o pg_cron purga
  -- após 30 minutos. Entrar no app de novo limpa este campo.
  exclusao_solicitada_em timestamptz,
  criado_em timestamptz not null default now()
);

-- Registro de tentativas de entrar com código de convite (controle de força
-- bruta). RLS fica LIGADA e SEM policies: nenhum cliente lê ou escreve aqui;
-- só as funções SECURITY DEFINER tocam nesta tabela.
create table public.tentativas_entrada (
  usuario_id uuid not null references auth.users (id) on delete cascade,
  tentado_em timestamptz not null default now()
);

create index tentativas_entrada_por_usuario
  on public.tentativas_entrada (usuario_id, tentado_em desc);

-- ----------------------------------------------------------------------------
-- Funções auxiliares
-- ----------------------------------------------------------------------------

-- Base de quase toda RLS do banco: "de qual casal eu sou?".
-- SECURITY DEFINER de propósito: se fosse comum, a policy de `perfis` que a
-- usa entraria em recursão infinita (policy consulta perfis, que dispara a
-- policy, que consulta perfis...).
create or replace function public.meu_casal_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select casal_id from public.perfis where id = auth.uid();
$$;

-- Gera um código de convite de 6 caracteres sem os ambíguos (0/O, 1/I).
create or replace function public.gerar_codigo_convite()
returns text
language sql
volatile
set search_path = public, pg_temp
as $$
  select string_agg(letra, '')
  from (
    select substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1) as letra
    from generate_series(1, 6)
  ) sorteio;
$$;

-- ----------------------------------------------------------------------------
-- Trigger: cadastro cria o perfil automaticamente
-- ----------------------------------------------------------------------------

-- O frontend manda `nome_exibicao` nos metadados do signup; se vier vazio,
-- usa o começo do e-mail para o perfil nunca nascer sem nome.
create or replace function public.ao_criar_usuario()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.perfis (id, nome_exibicao)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nome_exibicao'), ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.ao_criar_usuario();

-- ----------------------------------------------------------------------------
-- Trigger: um casal nunca passa de 2 pessoas (última linha de defesa)
-- ----------------------------------------------------------------------------

-- As RPCs já impedem, mas esta trava vale até contra um bug futuro em
-- qualquer função DEFINER: nenhum UPDATE consegue colocar uma terceira
-- pessoa em um casal.
create or replace function public.travar_maximo_dois()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.casal_id is not null
     and (select count(*) from public.perfis
          where casal_id = new.casal_id and id <> new.id) >= 2 then
    raise exception 'este casal já está completo';
  end if;
  return new;
end;
$$;

create trigger travar_maximo_dois
  before insert or update of casal_id on public.perfis
  for each row execute function public.travar_maximo_dois();

-- ----------------------------------------------------------------------------
-- RPCs de pareamento
-- ----------------------------------------------------------------------------

-- Cria o casal e já vincula quem chamou. Erro se a pessoa já tem casal.
create or replace function public.criar_casal()
returns public.casais
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  casal public.casais;
  codigo text;
begin
  if public.meu_casal_id() is not null then
    raise exception 'você já está em um casal';
  end if;

  -- Repete o sorteio no caso raríssimo de o código já existir.
  loop
    codigo := public.gerar_codigo_convite();
    begin
      insert into public.casais (codigo_convite, criado_por)
      values (codigo, auth.uid())
      returning * into casal;
      exit;
    exception when unique_violation then
      -- código repetido: sorteia outro
    end;
  end loop;

  update public.perfis set casal_id = casal.id where id = auth.uid();
  return casal;
end;
$$;

-- Entra em um casal usando o código de convite.
-- Retorna o casal, ou NULL se o código não existir (NUNCA exception — ver
-- cabeçalho, item 4). Erros só para rate-limit e casal cheio.
create or replace function public.entrar_no_casal(codigo text)
returns public.casais
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  casal public.casais;
  membros int;
begin
  if public.meu_casal_id() is not null then
    raise exception 'você já está em um casal';
  end if;

  -- Força bruta: no máximo 5 tentativas falhas a cada 15 minutos.
  if (select count(*) from public.tentativas_entrada
      where usuario_id = auth.uid()
        and tentado_em > now() - interval '15 minutes') >= 5 then
    raise exception 'muitas tentativas — aguarde alguns minutos e tente de novo';
  end if;

  select * into casal
  from public.casais
  where codigo_convite = upper(trim(codigo));

  if casal.id is null then
    -- Registra a falha e devolve NULL (o app traduz para "código inválido").
    insert into public.tentativas_entrada (usuario_id) values (auth.uid());
    return null;
  end if;

  select count(*) into membros from public.perfis where casal_id = casal.id;
  if membros >= 2 then
    raise exception 'este casal já está completo';
  end if;

  update public.perfis set casal_id = casal.id where id = auth.uid();
  return casal;
end;
$$;

-- Sai do casal (o vínculo some; publicações antigas continuam no casal).
create or replace function public.sair_do_casal()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.perfis set casal_id = null where id = auth.uid();
end;
$$;

-- ----------------------------------------------------------------------------
-- Exclusão de conta com carência
-- ----------------------------------------------------------------------------

create or replace function public.solicitar_exclusao_conta()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.perfis set exclusao_solicitada_em = now() where id = auth.uid();
end;
$$;

-- Chamada pelo app toda vez que a pessoa entra: desistir é automático.
create or replace function public.cancelar_exclusao_conta()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.perfis set exclusao_solicitada_em = null where id = auth.uid();
end;
$$;

-- Apaga de verdade as contas cujo pedido passou da carência de 30 minutos.
-- O DELETE em auth.users cascateia para `perfis` (e, nas próximas fases,
-- para publicações, listas etc.).
create or replace function public.purgar_contas_excluidas()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from auth.users
  where id in (
    select id from public.perfis
    where exclusao_solicitada_em is not null
      and exclusao_solicitada_em < now() - interval '30 minutes'
  );
end;
$$;

-- Jobs agendados: purga de contas a cada 5 minutos; limpeza diária das
-- tentativas de convite com mais de 1 dia (a tabela não cresce para sempre).
select cron.schedule('purgar-contas-excluidas', '*/5 * * * *',
  $$select public.purgar_contas_excluidas()$$);

select cron.schedule('limpar-tentativas-entrada', '0 3 * * *',
  $$delete from public.tentativas_entrada where tentado_em < now() - interval '1 day'$$);

-- ----------------------------------------------------------------------------
-- RLS e permissões
-- ----------------------------------------------------------------------------

alter table public.casais enable row level security;
alter table public.perfis enable row level security;
alter table public.tentativas_entrada enable row level security;
-- (tentativas_entrada fica sem NENHUMA policy: cliente não lê nem escreve)

-- Projetos novos do Supabase não expõem tabelas automaticamente:
-- todo acesso do app é declarado aqui, explícito.
grant select on public.casais to authenticated;
grant select on public.perfis to authenticated;
-- A única coluna de `casais` que o app edita direto é a data de aniversário.
grant update (data_aniversario) on public.casais to authenticated;
-- Em `perfis`, só aparência. `casal_id` e `exclusao_solicitada_em` são das RPCs.
grant update (nome_exibicao, url_avatar) on public.perfis to authenticated;

-- Vejo o meu casal, e nada além dele.
create policy casais_ver_o_meu
  on public.casais for select to authenticated
  using (id = public.meu_casal_id());

-- Membros podem ajustar a data de aniversário do próprio casal.
-- WITH CHECK repete a condição: sem ela, um UPDATE poderia "mover" a linha
-- para fora do alcance da policy.
create policy casais_editar_o_meu
  on public.casais for update to authenticated
  using (id = public.meu_casal_id())
  with check (id = public.meu_casal_id());

-- Vejo o meu perfil e o do meu par.
create policy perfis_ver_do_casal
  on public.perfis for select to authenticated
  using (id = auth.uid() or (casal_id is not null and casal_id = public.meu_casal_id()));

-- Edito somente o meu perfil (e, pelos GRANTs acima, só nome e avatar).
create policy perfis_editar_o_meu
  on public.perfis for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- As RPCs são o único caminho para criar/entrar/sair de um casal.
grant execute on function public.criar_casal() to authenticated;
grant execute on function public.entrar_no_casal(text) to authenticated;
grant execute on function public.sair_do_casal() to authenticated;
grant execute on function public.solicitar_exclusao_conta() to authenticated;
grant execute on function public.cancelar_exclusao_conta() to authenticated;
grant execute on function public.meu_casal_id() to authenticated;
