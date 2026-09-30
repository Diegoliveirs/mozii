/**
 * Abas sublinhadas, usadas no Cinema para alternar entre Buscar e Listas
 * sem trocar de rota.
 */
export function ControleSegmentado<T extends string>({
  opcoes,
  valor,
  aoMudar,
}: {
  opcoes: readonly { valor: T; rotulo: string }[]
  valor: T
  aoMudar: (novo: T) => void
}) {
  return (
    <div className="flex gap-6 border-b border-borda" role="tablist">
      {opcoes.map((opcao) => {
        const ativa = opcao.valor === valor
        return (
          <button
            key={opcao.valor}
            type="button"
            role="tab"
            aria-selected={ativa}
            onClick={() => aoMudar(opcao.valor)}
            className={`-mb-px border-b-2 py-2.5 text-[15px] transition-colors ${
              ativa
                ? 'border-texto font-medium text-texto'
                : 'border-transparent text-texto-discreto'
            }`}
          >
            {opcao.rotulo}
          </button>
        )
      })}
    </div>
  )
}
