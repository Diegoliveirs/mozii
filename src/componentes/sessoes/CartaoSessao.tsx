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
    <section className="mt-4">
      <p className="flex items-center gap-1.5 rotulo-secao">
        <IconeSessao size={14} aria-hidden />
        {textos.sessao.cartaoTitulo}
      </p>

      <div className="relative mt-2 flex overflow-hidden ingresso">
        <EncaixeAdereco nome="ingresso-canto" />
        {/* Canhoto do ingresso */}
        <div className="w-[88px] shrink-0 border-r-2 border-dashed border-borda-forte px-2 py-3 text-center">
          <p className="text-[11px] tracking-widest text-texto-discreto uppercase">
            {format(quando, 'EEEEEE', { locale: ptBR })}
          </p>
          <p className="titulo text-3xl leading-tight text-texto">{format(quando, 'dd')}</p>
          <p className="text-[11px] text-texto-discreto">
            {format(quando, 'MMM', { locale: ptBR })} · {format(quando, 'HH:mm')}
          </p>
          {restante && (
            <p className="mt-2 inline-block rounded-full bg-afeto/25 px-2 py-0.5 text-[11px] text-afeto-claro">
              {restante}
            </p>
          )}
        </div>

        {/* Perfurações do bilhete */}
        <span
          aria-hidden
          className="absolute -top-2 left-[80px] h-4 w-4 rounded-full border border-borda bg-fundo"
        />
        <span
          aria-hidden
          className="absolute -bottom-2 left-[80px] h-4 w-4 rounded-full border border-borda bg-fundo"
        />

        {/* Corpo: o filme e as ações */}
        <div className="min-w-0 flex-1 px-4 py-3">
          <Link
            to={`/filme/${sessao.filme.tmdbId}`}
            className="block truncate titulo text-lg text-texto"
          >
            {sessao.filme.titulo}
          </Link>
          {sessao.observacao && (
            <p className="mt-0.5 truncate text-xs text-texto-discreto">{sessao.observacao}</p>
          )}

          <div className="mt-3">
            <AcoesSessaoAgendada sessao={sessao} />
          </div>
        </div>
      </div>
    </section>
  )
}
