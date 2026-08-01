import { useState, type FormEvent } from 'react'
import type { Reacao } from '../../dominio/tipos'
import { textos } from '../../lib/textos'

/**
 * Reações com emoji LIVRE: chips agrupados por emoji (tocar alterna a sua),
 * mais a fileira rápida e um campo para qualquer emoji do teclado.
 */
export function BarraReacoes({
  reacoes,
  meuId,
  aoReagir,
}: {
  reacoes: Reacao[]
  meuId: string | undefined
  aoReagir: (emoji: string) => void
}) {
  const [seletorAberto, setSeletorAberto] = useState(false)
  const [emojiLivre, setEmojiLivre] = useState('')

  const grupos = new Map<string, { total: number; minha: boolean }>()
  for (const reacao of reacoes) {
    const grupo = grupos.get(reacao.emoji) ?? { total: 0, minha: false }
    grupo.total += 1
    if (reacao.autorId === meuId) grupo.minha = true
    grupos.set(reacao.emoji, grupo)
  }

  function aoEnviarLivre(evento: FormEvent) {
    evento.preventDefault()
    const emoji = emojiLivre.trim()
    if (!emoji) return
    aoReagir(emoji)
    setEmojiLivre('')
    setSeletorAberto(false)
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {[...grupos.entries()].map(([emoji, grupo]) => (
          <button
            key={emoji}
            type="button"
            onClick={() => aoReagir(emoji)}
            className={`rounded-full px-2.5 py-1 text-sm ${
              grupo.minha ? 'bg-rosa/25 text-neve' : 'bg-veu text-nevoa'
            }`}
          >
            {emoji} {grupo.total}
          </button>
        ))}
        <button
          type="button"
          aria-label={textos.reacoes.reagir}
          aria-expanded={seletorAberto}
          onClick={() => setSeletorAberto((aberto) => !aberto)}
          className="rounded-full bg-veu px-2.5 py-1 text-sm text-cinza"
        >
          +
        </button>
      </div>

      {seletorAberto && (
        <div className="entrada-folha mt-2 flex flex-wrap items-center gap-1.5">
          {textos.reacoes.rapidas.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                aoReagir(emoji)
                setSeletorAberto(false)
              }}
              className="rounded-full bg-veu px-2 py-1 text-lg"
            >
              {emoji}
            </button>
          ))}
          <form onSubmit={aoEnviarLivre}>
            <input
              type="text"
              maxLength={16}
              placeholder={textos.reacoes.outroEmoji}
              value={emojiLivre}
              onChange={(evento) => setEmojiLivre(evento.target.value)}
              className="w-28 rounded-full border border-linha bg-veu px-3 py-1 text-sm text-neve outline-none placeholder:text-cinza"
            />
          </form>
        </div>
      )}
    </div>
  )
}
