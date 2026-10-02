import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ReactNode } from 'react'
import type { NotaDeAtualizacao } from '../../dominio/tipos'
import { textos } from '../../lib/textos'
import { IconeComemoracao, IconeConfirmado, IconeSino } from '../ui/icones'
import { TituloAfetivo } from '../ui/TituloAfetivo'
import { Perfuracao } from '../ui/Perfuracao'

function Secao({
  rotulo,
  icone,
  itens,
}: {
  rotulo: string
  icone: ReactNode
  itens: readonly string[]
}) {
  if (itens.length === 0) return null
  return (
    <section className="mt-6">
      <h3 className="flex items-center gap-1.5 rotulo-secao">
        {icone}
        {rotulo}
      </h3>
      <ul className="mt-2.5 space-y-2">
        {itens.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-texto-secundario">
            <span aria-hidden className="text-metal">
              •
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * Uma nota de atualização: o ingresso da versão (canhoto com número e
 * data, título em duas vozes) e as seções que tiverem itens. `sobre` é a
 * cor atrás do cartão — as perfurações do ingresso "vazam" para ela.
 */

export function CartaoNota({
  nota,
  sobre = 'fundo',
}: {
  nota: NotaDeAtualizacao
  sobre?: 'fundo' | 'superficie'
}) {
  return (
    <article>
      <div className="relative flex ingresso">
        <div className="flex w-[92px] shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-borda-forte py-4 text-center">
          <p className="text-[10px] tracking-[0.18em] text-texto-secundario uppercase">
            {textos.novidades.rotuloVersao}
          </p>
          <p className="titulo text-4xl leading-none tracking-tight text-texto">{nota.versao}</p>
          <p className="mt-1 text-[10px] tracking-[0.12em] text-texto-secundario uppercase">
            {format(parseISO(nota.data), 'd MMM', { locale: ptBR })}
          </p>
        </div>
        <Perfuracao lado="topo" sobre={sobre} className="left-[84px]" />
        <Perfuracao lado="base" sobre={sobre} className="left-[84px]" />
        <div className="min-w-0 flex-1 px-4 py-4">
          <p className="rotulo-secao">
            <span className="text-afeto-claro">{textos.novidades.rotuloNota}</span>
          </p>
          <h2 className="mt-1.5 titulo text-2xl leading-tight text-texto">
            <TituloAfetivo inicio={nota.tituloInicio} destaque={nota.tituloDestaque} />
          </h2>
        </div>
      </div>

      <Secao
        rotulo={textos.novidades.novidades}
        icone={<IconeComemoracao size={14} className="text-metal" aria-hidden />}
        itens={nota.novidades}
      />
      <Secao
        rotulo={textos.novidades.correcoes}
        icone={<IconeConfirmado size={14} aria-hidden />}
        itens={nota.correcoes}
      />
      <Secao
        rotulo={textos.novidades.avisos}
        icone={<IconeSino size={14} className="text-afeto" aria-hidden />}
        itens={nota.avisos}
      />
    </article>
  )
}
