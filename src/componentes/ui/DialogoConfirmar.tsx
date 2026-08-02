import { useEffect, useRef, type KeyboardEvent } from 'react'
import { textos } from '../../lib/textos'
import { Botao } from './Botao'

/**
 * Confirmação para ações sérias (excluir publicação, sair do espaço…).
 * `perigosa` pinta o botão de confirmação com a cor de erro — rosa é
 * afeto, nunca destruição.
 */
export function DialogoConfirmar({
  aberto,
  titulo,
  descricao,
  rotuloConfirmar,
  perigosa = false,
  confirmando = false,
  aoConfirmar,
  aoCancelar,
}: {
  aberto: boolean
  titulo: string
  descricao: string
  rotuloConfirmar: string
  perigosa?: boolean
  confirmando?: boolean
  aoConfirmar: () => void
  aoCancelar: () => void
}) {
  const painelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aberto) painelRef.current?.focus()
  }, [aberto])

  if (!aberto) return null

  function aoTeclar(evento: KeyboardEvent) {
    if (evento.key === 'Escape') aoCancelar()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-abismo/80 px-6"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={aoCancelar}
      onKeyDown={aoTeclar}
    >
      <div
        ref={painelRef}
        tabIndex={-1}
        onClick={(evento) => evento.stopPropagation()}
        className="entrada-pop w-full max-w-sm rounded-2xl border border-linha bg-cartao p-5 shadow-cartao outline-none"
      >
        <h2 className="font-voz text-xl text-neve">{titulo}</h2>
        <p className="mt-2 text-sm text-nevoa">{descricao}</p>
        <div className="mt-5 flex gap-3">
          <Botao variante="fantasma" onClick={aoCancelar} className="flex-1">
            {textos.comuns.cancelar}
          </Botao>
          <Botao
            variante={perigosa ? 'perigo' : 'primario'}
            carregando={confirmando}
            onClick={aoConfirmar}
            className="flex-1"
          >
            {rotuloConfirmar}
          </Botao>
        </div>
      </div>
    </div>
  )
}
