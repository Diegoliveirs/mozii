import type { IdTema } from './contrato'

/**
 * Liga a pilha de temas no `<html>` (cada `tokens.css` responde a
 * `[data-tema~='id']`) e pinta a barra do navegador com o fundo do tema.
 * Chamado depois do CSS do tema carregar, para o `--fundo` já existir.
 */
export function aplicarTema(pilha: IdTema[]) {
  const raiz = document.documentElement
  raiz.dataset.tema = pilha.join(' ')

  const fundo = getComputedStyle(raiz).getPropertyValue('--fundo').trim()
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta && fundo) meta.content = fundo
}
