import { useState } from 'react'
import { CartaoMomento } from '../componentes/momentos/CartaoMomento'
import { FolhaNovaMemoria } from '../componentes/momentos/FolhaNovaMemoria'
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
    <main className="area-segura-topo px-5 pt-8 pb-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-voz text-3xl font-semibold tracking-tight text-neve">
            {textos.momentos.titulo}
          </h1>
          <p className="mt-1 text-sm text-rosa-suave">{textos.momentos.subtitulo}</p>
        </div>
        <button
          type="button"
          onClick={() => setFolhaAberta(true)}
          className="flex items-center gap-1.5 rounded-full border border-rosa/50 px-4 py-2 text-sm font-medium text-rosa-suave transition-transform active:scale-95"
        >
          <IconeMais size={15} aria-hidden />
          {textos.momentos.nova}
        </button>
      </div>

      {linhaDoTempo.isLoading && (
        <div className="mt-6 space-y-4">
          <Esqueleto className="h-48 rounded-2xl" />
          <Esqueleto className="h-24 rounded-2xl" />
        </div>
      )}

      {linhaDoTempo.isSuccess && dias.length === 0 && (
        <div className="mt-6">
          <EstadoVazio
            icone={<IconeMomentos size={28} aria-hidden />}
            titulo={textos.momentos.vazio}
            acao={
              <button
                type="button"
                onClick={() => setFolhaAberta(true)}
                className="rounded-full bg-rosa px-5 py-2 text-sm font-medium text-neve"
              >
                {textos.momentos.nova}
              </button>
            }
          />
        </div>
      )}

      <div className="mt-5 space-y-6">
        {dias.map(({ dia, itens }) => (
          <section key={dia}>
            <h2 className="text-sm font-medium tracking-wide text-cinza">{rotuloDoDia(dia)}</h2>
            <div className="mt-2 space-y-3">
              {itens.map((item) =>
                item.tipo === 'marco' ? (
                  <p
                    key={`marco-${item.marco.data}`}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-rosa/40 bg-rosa/10 p-4 text-center font-voz text-lg font-semibold text-rosa-suave"
                  >
                    <IconeComemoracao size={20} aria-hidden />
                    {item.marco.rotulo}
                  </p>
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
