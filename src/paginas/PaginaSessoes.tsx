import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import type { SessaoCinema } from '../dominio/tipos'
import { useSessoesAgendadas } from '../hooks/useSessoes'
import { contagemRegressiva } from '../lib/datas'
import { organizarSessoesAgendadas } from '../lib/sessoes'
import { textos } from '../lib/textos'
import { CabecalhoPagina } from '../componentes/layout/CabecalhoPagina'
import { AcoesSessaoAgendada } from '../componentes/sessoes/AcoesSessaoAgendada'
import { SessaoPendente } from '../componentes/sessoes/SessoesPassadas'
import { classesBotao } from '../componentes/ui/estiloBotao'
import { EstadoVazio } from '../componentes/ui/EstadoVazio'
import { IconeAlerta, IconeSessao } from '../componentes/ui/icones'

/** Programação completa: todo agendamento ainda aberto, com ações no próprio ingresso. */
export function PaginaSessoes() {
  const sessoes = useSessoesAgendadas()
  const organizadas = organizarSessoesAgendadas(sessoes.data ?? [])
  const total = organizadas.futuras.length + organizadas.passadas.length

  return (
    <main className="pb-4">
      <CabecalhoPagina titulo={textos.sessao.gestaoTitulo} fallback="/cinema" />

      <div className="px-5 pt-4">
        {sessoes.isPending && (
          <p className="py-10 text-center text-sm text-texto-discreto">
            {textos.comuns.carregando}
          </p>
        )}

        {sessoes.isError && (
          <EstadoVazio
            icone={<IconeAlerta size={28} />}
            titulo={textos.sessao.erroCarregar}
            descricao={textos.sessao.erroCarregarDica}
          />
        )}

        {sessoes.isSuccess && total === 0 && (
          <EstadoVazio
            icone={<IconeSessao size={30} />}
            titulo={textos.sessao.vazioTitulo}
            descricao={textos.sessao.vazioDescricao}
            acao={
              <Link to="/cinema?aba=buscar" className={classesBotao()}>
                {textos.sessao.buscarFilme}
              </Link>
            }
          />
        )}

        {total > 0 && (
          <div className="mb-5 flex items-end justify-between border-b border-borda pb-3">
            <div>
              <p className="rotulo-secao">{textos.sessao.programacao}</p>
              <p className="mt-1 text-sm text-texto-secundario">
                {textos.sessao.gestaoResumo(total)}
              </p>
            </div>
            <IconeSessao size={24} weight="fill" className="text-afeto" aria-hidden />
          </div>
        )}

        {organizadas.futuras.length > 0 && (
          <section>
            <h2 className="text-xs font-medium tracking-wide text-texto-discreto uppercase">
              {textos.sessao.proximasTitulo}
            </h2>
            <div className="mt-2 space-y-3">
              {organizadas.futuras.map((sessao) => (
                <BilheteSessao key={sessao.id} sessao={sessao} />
              ))}
            </div>
          </section>
        )}

        {organizadas.passadas.length > 0 && (
          <section className={organizadas.futuras.length > 0 ? 'mt-8' : ''}>
            <h2 className="text-xs font-medium tracking-wide text-texto-discreto uppercase">
              {textos.sessao.aguardandoTitulo}
            </h2>
            <p className="mt-1 text-xs text-texto-discreto">{textos.sessao.aguardandoDescricao}</p>
            <div className="mt-2 space-y-2">
              {organizadas.passadas.map((sessao) => (
                <SessaoPendente key={sessao.id} sessao={sessao} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function BilheteSessao({ sessao }: { sessao: SessaoCinema }) {
  const quando = new Date(sessao.agendadaPara)

  return (
    <article className="relative flex overflow-hidden ingresso">
      <div className="w-[76px] shrink-0 border-r-2 border-dashed border-borda-forte px-2 py-3 text-center">
        <p className="text-[10px] tracking-widest text-texto-discreto uppercase">
          {format(quando, 'EEEEEE', { locale: ptBR })}
        </p>
        <p className="titulo text-2xl leading-tight text-texto">{format(quando, 'dd')}</p>
        <p className="text-[10px] text-texto-discreto">
          {format(quando, 'MMM', { locale: ptBR })} · {format(quando, 'HH:mm')}
        </p>
      </div>

      <span
        aria-hidden
        className="absolute -top-2 left-[68px] h-4 w-4 rounded-full border border-borda bg-fundo"
      />
      <span
        aria-hidden
        className="absolute -bottom-2 left-[68px] h-4 w-4 rounded-full border border-borda bg-fundo"
      />

      <div className="min-w-0 flex-1 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/filme/${sessao.filme.tmdbId}`}
              className="block truncate titulo text-base text-texto"
            >
              {sessao.filme.titulo}
            </Link>
            {sessao.observacao && (
              <p className="mt-0.5 line-clamp-2 text-xs text-texto-discreto">{sessao.observacao}</p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-afeto/20 px-2 py-0.5 text-[10px] text-afeto-claro">
            {contagemRegressiva(sessao.agendadaPara)}
          </span>
        </div>
        <div className="mt-3">
          <AcoesSessaoAgendada sessao={sessao} />
        </div>
      </div>
    </article>
  )
}
