import { useTema } from '../../temas/contextoTema'

/**
 * Splash exibida enquanto as guardas resolvem sessão e casal — substitui
 * o flash de tela vazia no boot. Quem desenha é o tema ativo.
 */
export function TelaAbertura() {
  const { TelaAbertura: AberturaDoTema } = useTema().componentes
  return <AberturaDoTema />
}
