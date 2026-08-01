/**
 * Trava o zoom no iOS de verdade. O viewport já declara
 * `maximum-scale=1, user-scalable=no`, mas o Safari do iPhone IGNORA isso
 * para o gesto de pinça e o toque duplo — este módulo bloqueia os dois.
 * (Os campos com 16px cuidam do terceiro caso: o auto-zoom ao focar.)
 */
export function travarZoom(): void {
  // Pinça (evento proprietário do Safari/iOS)
  document.addEventListener('gesturestart', (evento) => evento.preventDefault())

  // Toque duplo: dois toques em menos de 300ms viram zoom — cancela o segundo.
  let ultimoToque = 0
  document.addEventListener(
    'touchend',
    (evento) => {
      const agora = Date.now()
      if (agora - ultimoToque < 300) evento.preventDefault()
      ultimoToque = agora
    },
    { passive: false },
  )
}
