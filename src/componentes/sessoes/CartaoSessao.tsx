import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { SessaoCinema } from '../../dominio/tipos'
import { useSessoesAgendadas } from '../../hooks/useSessoes'
import { contagemRegressiva } from '../../lib/datas'
import { textos } from '../../lib/textos'
import { EncaixeAdereco } from '../../temas/EncaixeAdereco'
import { IconeSessao } from '../ui/icones'
import { AcoesSessaoAgendada } from './AcoesSessaoAgendada'

/**
 * O ingresso de cinema: a próxima sessão FUTURA, em destaque no topo do
 * Cinema. Canhoto perfurado com a data e contagem regressiva ao vivo
 * (re-render por minuto). Sessões com horário vencido moram na seção
 * "Sessões passadas".
 */
export function CartaoSessao() {
  const sessoes = useSessoesAgendadas()

  // Tique de 1 minuto só para a contagem regressiva respirar.
  const [, setTique] = useState(0)
  useEffect(() => {
    const intervalo = setInterval(() => setTique((atual) => atual + 1), 60_000)
    return () => clearInterval(intervalo)
  }, [])

  const proxima = sessoes.data?.find((sessao) => contagemRegressiva(sessao.agendadaPara) !== null)
  if (!proxima) return null
  return <Ingresso sessao={proxima} />
}

function Ingresso({ sessao }: { sessao: SessaoCinema }) {
  const quando = new Date(sessao.agendadaPara)
  const restante = contagemRegressiva(sessao.agendadaPara)

  return (
    <section className="mt-8">
      <p className="flex items-center gap-1.5 rotulo-secao">
        <IconeSessao size={14} aria-hidden />
        {textos.sessao.cartaoTitulo}
      </p>

      <div className="relative mt-3 flex overflow-hidden ingresso">
        <EncaixeAdereco nome="ingresso-canto" />
        {/* Canhoto do ingresso */}
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

        {/* Perfurações do bilhete */}
        <span
          aria-hidden
          className="absolute -top-2 left-[92px] h-4 w-4 rounded-full border border-borda bg-fundo"
        />
        <span
          aria-hidden
          className="absolute -bottom-2 left-[92px] h-4 w-4 rounded-full border border-borda bg-fundo"
        />

        {/* Corpo: o filme e as ações */}
        <div className="min-w-0 flex-1 px-4 py-4">
          {restante && (
            <p className="inline-block rounded-full bg-afeto/20 px-2.5 py-0.5 text-[11px] font-medium text-afeto-claro">
              {restante}
            </p>
          )}
          <Link
            to={`/filme/${sessao.filme.tmdbId}`}
            className="mt-2 block truncate titulo text-xl text-texto"
          >
            {sessao.filme.titulo}
          </Link>
          {sessao.observacao && (
            <p className="mt-0.5 truncate font-titulo text-sm text-texto-secundario italic">
              {sessao.observacao}
            </p>
          )}

          <div className="mt-3">
            <AcoesSessaoAgendada sessao={sessao} />
          </div>
        </div>
      </div>
    </section>
  )
}
