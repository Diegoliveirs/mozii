import { useCallback, useEffect, useState } from 'react'
import { textos } from '../../lib/textos'
import { IconeAvancar, IconeFechar, IconeVoltar } from './icones'

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-fundo-profundo/95"
      role="dialog"
      aria-modal="true"
      aria-label={textos.lightbox.rotulo}
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
            aria-label={textos.lightbox.anterior}
            onClick={(evento) => {
              evento.stopPropagation()
              anterior()
            }}
            className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-superficie/80 text-texto"
          >
            <IconeVoltar size={18} aria-hidden />
          </button>
          <button
            type="button"
            aria-label={textos.lightbox.proxima}
            onClick={(evento) => {
              evento.stopPropagation()
              proxima()
            }}
            className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-superficie/80 text-texto"
          >
            <IconeAvancar size={18} aria-hidden />
          </button>
          <span className="absolute bottom-6 rounded-full bg-superficie/80 px-3 py-1 text-sm text-texto-secundario">
            {indice + 1} / {urls.length}
          </span>
        </>
      )}

      {/* Abaixo do notch do iPhone, sempre */}
      <button
        type="button"
        aria-label={textos.comuns.fechar}
        onClick={aoFechar}
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 flex h-10 w-10 items-center justify-center rounded-full bg-superficie/80 text-texto"
      >
        <IconeFechar size={18} aria-hidden />
      </button>
    </div>
  )
}
