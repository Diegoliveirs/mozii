-- ============================================================================
-- 012_entrada_no_casal_com_trava.sql — "Casal = 2" resiste a entradas simultâneas
-- ============================================================================
-- POR QUÊ:
--
-- 1. `entrar_no_casal` e o trigger `travar_maximo_dois` CONTAVAM os membros
--    sem travar nada. Em READ COMMITTED, duas pessoas entrando ao mesmo tempo
--    atualizam linhas diferentes de `perfis`, não se bloqueiam, cada uma vê
--    só 1 membro e as duas passam: o casal fica com 3.
--
-- 2. A correção é serializar por casal: `select ... for update` na linha de
--    `casais` antes de contar. A segunda entrada espera a primeira terminar;
--    quando a contagem roda, já enxerga 2 membros e recusa.
--
-- 3. A trava vai nos DOIS lugares (RPC e trigger), fiel à regra das três
--    camadas da 001: o trigger continua valendo contra um bug futuro em
--    qualquer outra função DEFINER.
--
-- 4. De carona: a RPC recusa chamada sem usuário (auth.uid() nulo). A 011 já
--    tirou o acesso da chave anon; isto é a segunda camada, para que uma
--    regressão de GRANT nunca reabra o "rate-limit que não conta".
-- ============================================================================

create or replace function public.travar_maximo_dois()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.casal_id is not null then
    -- Serializa quem entra no mesmo casal (ver cabeçalho, item 2).
    perform 1 from public.casais where id = new.casal_id for update;
    if (select count(*) from public.perfis
        where casal_id = new.casal_id and id <> new.id) >= 2 then
      raise exception 'este casal já está completo';
    end if;
  end if;
  return new;
end;
$$;

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
  if auth.uid() is null then
    raise exception 'autenticação obrigatória' using errcode = '42501';
  end if;

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
  where codigo_convite = upper(trim(codigo))
  for update;

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
