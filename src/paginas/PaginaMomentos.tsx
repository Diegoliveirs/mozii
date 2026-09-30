import { useState } from 'react'
import { CartaoMomento } from '../componentes/momentos/CartaoMomento'
import { FolhaNovaMemoria } from '../componentes/momentos/FolhaNovaMemoria'
import { Botao } from '../componentes/ui/Botao'
import { DialogoConfirmar } from '../componentes/ui/DialogoConfirmar'
import { Esqueleto } from '../componentes/ui/Esqueleto'
import { EstadoVazio } from '../componentes/ui/EstadoVazio'
import { IconeComemoracao, IconeMais, IconeMomentos } from '../componentes/ui/icones'
import type { Momento } from '../dominio/tipos'
import { useAutenticacao } from '../hooks/useAutenticacao'
import { useCasalComMembros } from '../hooks/useCasal'
import { useExcluirMomento, useLinhaDoTempo } from '../hooks/useMomentos'
import { marcosDeAniversario, type MarcoAniversario } from '../lib/aniversario'
import { rotuloDoDia } from '../lib/datas'
import { textos } from '../lib/textos'

type ItemDoDia = { tipo: 'momento'; momento: Momento } | { tipo: 'marco'; marco: MarcoAniversario }

/**
 * Monta a linha do tempo: memórias + marcos de aniversário, agrupados por
 * dia (mais recente primeiro). Pura o bastante para ler de uma vez.
 */
function montarLinhaDoTempo(
  momentos: Momento[],
  marcos: MarcoAniversario[],
): Array<{ dia: string; itens: ItemDoDia[] }> {
  const porDia = new Map<string, ItemDoDia[]>()

  for (const momento of momentos) {
    const itens = porDia.get(momento.aconteceuEm) ?? []
    itens.push({ tipo: 'momento', momento })
    porDia.set(momento.aconteceuEm, itens)
  }
  for (const marco of marcos) {
    const itens = porDia.get(marco.data) ?? []
    itens.unshift({ tipo: 'marco', marco }) // marco abre o dia
    porDia.set(marco.data, itens)
  }

  return [...porDia.entries()]
    .sort(([diaA], [diaB]) => (diaA < diaB ? 1 : -1))
    .map(([dia, itens]) => ({ dia, itens }))
}

export function PaginaMomentos() {
  const { usuario } = useAutenticacao()
  const casal = useCasalComMembros()
  const linhaDoTempo = useLinhaDoTempo()
  const excluir = useExcluirMomento()
  const [folhaAberta, setFolhaAberta] = useState(false)
  const [excluindo, setExcluindo] = useState<Momento | null>(null)

  const marcos = marcosDeAniversario(casal.data?.casal.dataAniversario ?? null)
  const dias = montarLinhaDoTempo(linhaDoTempo.data ?? [], marcos)

  return (
    <main className="area-segura-topo px-5 pt-10 pb-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="rotulo-secao">{textos.momentos.subtitulo}</p>
          <h1 className="mt-2.5 titulo text-4xl leading-none tracking-tight text-texto">
            {textos.momentos.titulo}
          </h1>
        </div>
        <Botao onClick={() => setFolhaAberta(true)} className="shrink-0">
          <IconeMais size={15} weight="bold" aria-hidden />
          {textos.momentos.nova}
        </Botao>
      </div>

      {linhaDoTempo.isLoading && (
        <div className="mt-6 space-y-4">
          <Esqueleto className="h-48 rounded-cartao" />
          <Esqueleto className="h-24 rounded-cartao" />
        </div>
      )}

      {linhaDoTempo.isSuccess && dias.length === 0 && (
        <div className="mt-6">
          <EstadoVazio
            icone={<IconeMomentos size={28} aria-hidden />}
            titulo={textos.momentos.vazio}
            acao={<Botao onClick={() => setFolhaAberta(true)}>{textos.momentos.nova}</Botao>}
          />
        </div>
      )}

      <div className="mt-8 space-y-9">
        {dias.map(({ dia, itens }) => (
          <section key={dia}>
            <h2 className="flex items-baseline gap-3 font-titulo text-xl font-light text-texto italic">
              {rotuloDoDia(dia)}
              <span aria-hidden className="h-px flex-1 bg-borda" />
            </h2>
            <div className="mt-3.5 space-y-6">
              {itens.map((item) =>
                item.tipo === 'marco' ? (
                  <div key={`marco-${item.marco.data}`} className="py-2 text-center">
                    <div aria-hidden className="flex items-center gap-3.5 text-afeto">
                      <span className="h-px flex-1 bg-linear-to-r from-transparent to-afeto/50" />
                      <IconeComemoracao size={18} />
                      <span className="h-px flex-1 bg-linear-to-l from-transparent to-afeto/50" />
                    </div>
                    <p className="mt-3 font-titulo text-3xl font-light text-afeto-claro italic">
                      {item.marco.rotulo}
                    </p>
                  </div>
                ) : (
                  <CartaoMomento
                    key={item.momento.id}
                    momento={item.momento}
                    membros={casal.data?.membros ?? []}
                    meuId={usuario?.id}
                    aoExcluir={setExcluindo}
                  />
                ),
              )}
            </div>
          </section>
        ))}
      </div>

      {folhaAberta && <FolhaNovaMemoria aoFechar={() => setFolhaAberta(false)} />}

      <DialogoConfirmar
        aberto={excluindo !== null}
        titulo={textos.momentos.excluirConfirmar}
        descricao={textos.momentos.excluirExplicacao}
        rotuloConfirmar={textos.comuns.confirmar}
        perigosa
        confirmando={excluir.isPending}
        aoConfirmar={async () => {
          if (excluindo) await excluir.mutateAsync(excluindo)
          setExcluindo(null)
        }}
        aoCancelar={() => setExcluindo(null)}
      />
    </main>
  )
}
