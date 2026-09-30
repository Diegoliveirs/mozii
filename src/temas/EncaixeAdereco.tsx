import type { NomeEncaixe } from './contrato'
import { useTema } from './contextoTema'

/**
 * Ponto fixo onde o tema ativo pode prender um enfeite (laço no ingresso,
 * azevinho no Mural…). Sem enfeite para este ponto, não renderiza nada.
 * O pai precisa ser `relative`; o enfeite se posiciona sozinho.
 */
export function EncaixeAdereco({ nome }: { nome: NomeEncaixe }) {
  const Adereco = useTema().encaixes[nome]
  if (!Adereco) return null
  return (
    <span aria-hidden className="pointer-events-none">
      <Adereco />
    </span>
  )
}
