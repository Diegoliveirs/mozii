/**
 * Abas em pílula (segmented control), usadas no Cinema para alternar
 * entre Buscar e Listas sem trocar de rota.
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
    <div className="flex rounded-xl bg-veu p-1" role="tablist">
      {opcoes.map((opcao) => {
        const ativa = opcao.valor === valor
        return (
          <button
            key={opcao.valor}
            type="button"
            role="tab"
            aria-selected={ativa}
            onClick={() => aoMudar(opcao.valor)}
            className={`flex-1 rounded-lg py-2 text-sm transition-colors ${
              ativa ? 'bg-cartao font-medium text-neve shadow-cartao' : 'text-cinza'
            }`}
          >
            {opcao.rotulo}
          </button>
        )
      })}
    </div>
  )
}
