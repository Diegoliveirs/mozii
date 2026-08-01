import { textos } from '../../lib/textos'

const NOTAS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

/** Distribuição das notas da pessoa — barras puras de CSS, sem lib. */
export function HistogramaNotas({ distribuicao }: { distribuicao: Map<number, number> }) {
  const maior = Math.max(1, ...distribuicao.values())

  return (
    <section className="mt-6">
      <h2 className="font-medium text-neve">{textos.perfil.histograma}</h2>
      <div
        className="mt-3 flex h-24 items-end gap-1"
        role="img"
        aria-label={textos.perfil.histograma}
      >
        {NOTAS.map((nota) => {
          const quantidade = distribuicao.get(nota) ?? 0
          return (
            <div key={nota} className="flex flex-1 flex-col items-center gap-1">
              <div
                title={`${nota}★: ${quantidade}`}
                className={`w-full rounded-t ${quantidade > 0 ? 'bg-rosa' : 'bg-veu'}`}
                style={{ height: `${Math.max(4, (quantidade / maior) * 80)}px` }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-1 flex justify-between text-xs text-cinza">
        <span>½★</span>
        <span>5★</span>
      </div>
    </section>
  )
}
