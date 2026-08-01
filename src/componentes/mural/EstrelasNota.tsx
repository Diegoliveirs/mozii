/**
 * Estrelas de avaliação com MEIA estrela: no modo editável, tocar na
 * metade esquerda da estrela dá x,5 e na direita dá o número cheio.
 * Exibição usa preenchimento parcial (largura 50%) — sem lib.
 */
function Estrela({ fracao }: { fracao: 0 | 0.5 | 1 }) {
  return (
    <span className="relative inline-block text-xl leading-none">
      <span className="text-estrela-apagada">★</span>
      {fracao > 0 && (
        <span
          className="absolute inset-0 overflow-hidden text-estrela"
          style={{ width: fracao === 1 ? '100%' : '50%' }}
        >
          ★
        </span>
      )}
    </span>
  )
}

export function EstrelasNota({
  valor,
  aoMudar,
}: {
  valor: number
  /** Presente = modo edição. */
  aoMudar?: (nota: number) => void
}) {
  const estrelas = [1, 2, 3, 4, 5] as const

  return (
    <span role={aoMudar ? 'radiogroup' : undefined} aria-label={`Nota ${valor} de 5`}>
      {estrelas.map((estrela) => {
        const fracao: 0 | 0.5 | 1 = valor >= estrela ? 1 : valor >= estrela - 0.5 ? 0.5 : 0

        if (!aoMudar) return <Estrela key={estrela} fracao={fracao} />

        return (
          <span key={estrela} className="relative inline-block">
            <Estrela fracao={fracao} />
            <button
              type="button"
              aria-label={`${estrela - 0.5} estrelas`}
              onClick={() => aoMudar(estrela - 0.5)}
              className="absolute inset-y-0 left-0 w-1/2"
            />
            <button
              type="button"
              aria-label={`${estrela} estrelas`}
              onClick={() => aoMudar(estrela)}
              className="absolute inset-y-0 right-0 w-1/2"
            />
          </span>
        )
      })}
    </span>
  )
}
