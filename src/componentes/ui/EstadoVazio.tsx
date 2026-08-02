import type { ReactNode } from 'react'

/**
 * Tela vazia como convite: ícone, uma frase e, quando fizer sentido,
 * uma ação para começar — nunca só um parágrafo solto.
 */
export function EstadoVazio({
  icone,
  titulo,
  descricao,
  acao,
}: {
  icone: ReactNode
  titulo: string
  descricao?: string
  acao?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-linha bg-cartao px-6 py-8 text-center">
      <div className="text-cinza [&>svg]:mx-auto">{icone}</div>
      <p className="mt-3 font-medium text-neve">{titulo}</p>
      {descricao && <p className="mt-1 text-sm text-cinza">{descricao}</p>}
      {acao && <div className="mt-4 flex justify-center">{acao}</div>}
    </div>
  )
}
