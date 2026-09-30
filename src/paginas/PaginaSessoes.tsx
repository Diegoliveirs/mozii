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
          <div className="mb-8">
            <p className="rotulo-secao">{textos.sessao.programacao}</p>
            <p className="mt-2 titulo text-4xl leading-none tracking-tight text-texto">
              {textos.sessao.gestaoAtalho}
            </p>
            <p className="mt-2.5 font-titulo font-light text-texto-secundario italic">
              {textos.sessao.gestaoResumo(total)}
            </p>
          </div>
        )}

        {organizadas.futuras.length > 0 && (
          <section>
            <h2 className="rotulo-secao">{textos.sessao.proximasTitulo}</h2>
            <div className="mt-3 space-y-3">
              {organizadas.futuras.map((sessao) => (
                <BilheteSessao key={sessao.id} sessao={sessao} />
              ))}
            </div>
          </section>
        )}

        {organizadas.passadas.length > 0 && (
          <section className={organizadas.futuras.length > 0 ? 'mt-8' : ''}>
            <h2 className="rotulo-secao">
              <span className="text-metal">{textos.sessao.aguardandoTitulo}</span>
            </h2>
            <p className="mt-1.5 text-sm text-texto-secundario">
              {textos.sessao.aguardandoDescricao}
            </p>
            <div className="mt-3 divide-y divide-borda rounded-cartao border border-metal/25 bg-metal/5 px-4">
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
      <div className="flex w-[100px] shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-borda-forte px-2 py-4 text-center">
        <p className="text-[11px] tracking-[0.18em] text-texto-secundario uppercase">
          {format(quando, 'EEEEEE', { locale: ptBR })}
        </p>
        <p className="titulo text-5xl leading-none tracking-tight text-texto">
          {format(quando, 'dd')}
        </p>
        <p className="mt-1 text-[11px] tracking-[0.12em] text-texto-secundario uppercase">
          {format(quando, 'MMM', { locale: ptBR })} · {format(quando, 'HH:mm')}
        </p>
      </div>

      <span
        aria-hidden
        className="absolute -top-2 left-[92px] h-4 w-4 rounded-full border border-borda bg-fundo"
      />
      <span
        aria-hidden
        className="absolute -bottom-2 left-[92px] h-4 w-4 rounded-full border border-borda bg-fundo"
      />

      <div className="min-w-0 flex-1 px-4 py-4">
        <span className="inline-block rounded-full bg-afeto/20 px-2.5 py-0.5 text-[11px] font-medium text-afeto-claro">
          {contagemRegressiva(sessao.agendadaPara)}
        </span>
        <Link
          to={`/filme/${sessao.filme.tmdbId}`}
          className="mt-2 block truncate titulo text-xl text-texto"
        >
          {sessao.filme.titulo}
        </Link>
        {sessao.observacao && (
          <p className="mt-0.5 line-clamp-2 font-titulo text-sm text-texto-secundario italic">
            {sessao.observacao}
          </p>
        )}
        <div className="mt-3">
          <AcoesSessaoAgendada sessao={sessao} />
        </div>
      </div>
    </article>
  )
}
