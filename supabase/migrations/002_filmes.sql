-- ============================================================================
-- 002_filmes.sql — Cache local do catálogo TMDB
-- ============================================================================
-- POR QUÊ deste jeito:
--
-- 1. O catálogo vem do TMDB, mas cada filme tocado pelo casal (numa lista,
--    numa avaliação, num favorito) ganha uma linha AQUI. Assim o app nunca
--    depende do TMDB para mostrar o que já é do casal — pôster e título
--    ficam no nosso banco.
--
-- 2. O cache é GLOBAL (sem casal_id de propósito): "Duna" é o mesmo filme
--    para qualquer pessoa. Não há nada privado numa linha de filme.
--
-- 3. A escrita direta é revogada. O único caminho é a RPC `gravar_filme()`,
--    que valida os dados — sem ela, qualquer usuário autenticado poderia
--    corromper o título de um filme que o outro casal também usa.
--
-- 4. De carona: job de limpeza de casais vazios. Sair do casal não apaga a
--    linha em `casais` (não há RPC para isso), então casais sem nenhum
--    membro há mais de 1 dia são recolhidos pelo pg_cron.
-- ============================================================================

create table public.filmes (
  -- O id do TMDB é a chave: é estável, público e evita duplicatas.
  tmdb_id integer primary key check (tmdb_id > 0),
  titulo text not null check (length(titulo) between 1 and 300),
  caminho_poster text check (caminho_poster is null or caminho_poster like '/%'),
  ano_lancamento integer check (ano_lancamento between 1870 and 2100),
  atualizado_em timestamptz not null default now()
);

alter table public.filmes enable row level security;

-- Leitura livre para autenticados (cache compartilhado); escrita NENHUMA
-- direta — nem insert, nem update, nem delete. Só a RPC abaixo.
grant select on public.filmes to authenticated;

create policy filmes_ler
  on public.filmes for select to authenticated
  using (true);

-- Grava (ou atualiza) um filme no cache, com validação.
-- SECURITY DEFINER: contorna a ausência de policy de escrita, mas só
-- depois de validar cada campo.
create or replace function public.gravar_filme(
  p_tmdb_id integer,
  p_titulo text,
  p_caminho_poster text,
  p_ano_lancamento integer
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_tmdb_id is null or p_tmdb_id <= 0 then
    raise exception 'tmdb_id inválido';
  end if;
  if p_titulo is null or length(trim(p_titulo)) = 0 or length(p_titulo) > 300 then
    raise exception 'título inválido';
  end if;
  if p_caminho_poster is not null and p_caminho_poster not like '/%' then
    raise exception 'caminho de pôster inválido';
  end if;
  if p_ano_lancamento is not null and (p_ano_lancamento < 1870 or p_ano_lancamento > 2100) then
    raise exception 'ano inválido';
  end if;

  insert into public.filmes (tmdb_id, titulo, caminho_poster, ano_lancamento)
  values (p_tmdb_id, trim(p_titulo), p_caminho_poster, p_ano_lancamento)
  on conflict (tmdb_id) do update
    set titulo = excluded.titulo,
        caminho_poster = excluded.caminho_poster,
        ano_lancamento = excluded.ano_lancamento,
        atualizado_em = now();
end;
$$;

grant execute on function public.gravar_filme(integer, text, text, integer) to authenticated;

-- Limpeza de casais vazios (ninguém aponta para eles há mais de 1 dia).
-- Também recolhe os casais que os testes E2E deixam para trás.
select cron.schedule('limpar-casais-vazios', '30 3 * * *',
  $$delete from public.casais c
    where c.criado_em < now() - interval '1 day'
      and not exists (select 1 from public.perfis p where p.casal_id = c.id)$$);
