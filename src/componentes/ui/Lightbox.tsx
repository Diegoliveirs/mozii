import { useCallback, useEffect, useState } from 'react'

/**
 * Visualizador de fotos em tela cheia: navegação por toque nas bordas,
 * setas do teclado e Esc para fechar. Sem lib — é um overlay e três teclas.
 */
export function Lightbox({
  urls,
  indiceInicial,
  aoFechar,
}: {
  urls: string[]
  indiceInicial: number
  aoFechar: () => void
}) {
  const [indice, setIndice] = useState(indiceInicial)

  const anterior = useCallback(
    () => setIndice((atual) => (atual - 1 + urls.length) % urls.length),
    [urls.length],
  )
  const proxima = useCallback(() => setIndice((atual) => (atual + 1) % urls.length), [urls.length])

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') aoFechar()
      if (evento.key === 'ArrowLeft') anterior()
      if (evento.key === 'ArrowRight') proxima()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aoFechar, anterior, proxima])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-abismo/95"
      role="dialog"
      aria-modal="true"
      aria-label="Foto ampliada"
      onClick={aoFechar}
    >
      <img
        src={urls[indice]}
        alt=""
        className="max-h-[85dvh] max-w-full object-contain"
        onClick={(evento) => evento.stopPropagation()}
      />

      {urls.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(evento) => {
              evento.stopPropagation()
              anterior()
            }}
            className="absolute left-2 rounded-full bg-cartao/80 px-3 py-2 text-neve"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={(evento) => {
              evento.stopPropagation()
              proxima()
            }}
            className="absolute right-2 rounded-full bg-cartao/80 px-3 py-2 text-neve"
          >
            →
          </button>
          <span className="absolute bottom-6 rounded-full bg-cartao/80 px-3 py-1 text-sm text-nevoa">
            {indice + 1} / {urls.length}
          </span>
        </>
      )}

      {/* Abaixo do notch do iPhone, sempre */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={aoFechar}
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 rounded-full bg-cartao/80 px-3 py-2 text-neve"
      >
        ✕
      </button>
    </div>
  )
}
