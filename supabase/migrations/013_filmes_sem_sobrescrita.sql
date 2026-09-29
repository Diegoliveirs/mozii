-- ============================================================================
-- 013_filmes_sem_sobrescrita.sql — O cache global de filmes não aceita reescrita
-- ============================================================================
-- POR QUÊ:
--
-- 1. A 002 prometia que ninguém corromperia o título de um filme que outro
--    casal usa, mas `gravar_filme` fazia `on conflict do update` com o que o
--    chamador mandasse: qualquer conta (e, antes da 011, até a chave anon)
--    trocava título e pôster de uma linha compartilhada.
--
-- 2. Agora a linha nasce uma vez e fica: um conflito só preenche pôster/ano
--    que estavam nulos, nunca troca o que já existe. Quem grava
--    primeiro define o título — com o cadastro público desligado, só o casal
--    grava. ponytail: primeiro-a-gravar vence; se um dia for preciso
--    atualizar títulos, buscar do TMDB no servidor (nunca confiar no cliente).
--
-- 3. Caracteres de controle (CR, LF, TAB...) são recusados no título: ele vai
--    parar no push, no cartão de compartilhar e no .ics da sessão, e um CR
--    solto ali injetava linhas no arquivo de calendário.
--
-- 4. O caminho do pôster passa a ser só `/<nome>.<ext>` (o formato do TMDB).
-- ============================================================================

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
  if auth.uid() is null then
    raise exception 'autenticação obrigatória' using errcode = '42501';
  end if;
  if p_tmdb_id is null or p_tmdb_id <= 0 then
    raise exception 'tmdb_id inválido';
  end if;
  if p_titulo is null or length(trim(p_titulo)) = 0 or length(p_titulo) > 300
     or p_titulo ~ '[[:cntrl:]]' then
    raise exception 'título inválido';
  end if;
  if p_caminho_poster is not null and p_caminho_poster !~ '^/[A-Za-z0-9._-]+$' then
    raise exception 'caminho de pôster inválido';
  end if;
  if p_ano_lancamento is not null and (p_ano_lancamento < 1870 or p_ano_lancamento > 2100) then
    raise exception 'ano inválido';
  end if;

  insert into public.filmes (tmdb_id, titulo, caminho_poster, ano_lancamento)
  values (p_tmdb_id, trim(p_titulo), p_caminho_poster, p_ano_lancamento)
  -- Só completa o que faltava (pôster/ano nulos); nunca reescreve o que existe.
  on conflict (tmdb_id) do update
    set caminho_poster = coalesce(filmes.caminho_poster, excluded.caminho_poster),
        ano_lancamento = coalesce(filmes.ano_lancamento, excluded.ano_lancamento)
    where filmes.caminho_poster is null or filmes.ano_lancamento is null;
end;
$$;
