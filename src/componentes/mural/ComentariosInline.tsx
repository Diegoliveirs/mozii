import { useState, type FormEvent } from 'react'
import type { Perfil } from '../../dominio/tipos'
import { useComentar, useComentarios } from '../../hooks/useMural'
import { tempoAtras } from '../../lib/datas'
import { textos } from '../../lib/textos'
import { AvatarPerfil } from './AvatarPerfil'

/**
 * Comentários dentro do cartão: contagem que expande a conversa,
 * com envio otimista (o comentário aparece na hora).
 */
export function ComentariosInline({
  publicacaoId,
  quantidade,
  membros,
  abertoInicial = false,
}: {
  publicacaoId: string
  quantidade: number
  membros: Perfil[]
  abertoInicial?: boolean
}) {
  const [aberto, setAberto] = useState(abertoInicial)
  const comentarios = useComentarios(publicacaoId, aberto)
  const comentar = useComentar()
  const [corpo, setCorpo] = useState('')

  function indiceDe(autorId: string): number {
    return Math.max(
      0,
      membros.findIndex((membro) => membro.id === autorId),
    )
  }
  function nomeDe(autorId: string): string {
    return membros.find((membro) => membro.id === autorId)?.nomeExibicao ?? '…'
  }

  function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    const texto = corpo.trim()
    if (!texto) return
    comentar.mutate({ publicacaoId, corpo: texto })
    setCorpo('')
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setAberto((estava) => !estava)}
        aria-expanded={aberto}
        className="text-sm text-cinza"
      >
        💬 {aberto ? textos.publicacao.comentarios : quantidade || textos.publicacao.comentarDica}
      </button>

      {aberto && (
        <div className="entrada-folha mt-2 space-y-2">
          {comentarios.data?.map((comentario) => (
            <div key={comentario.id} className="flex items-start gap-2">
              <AvatarPerfil
                nome={nomeDe(comentario.autorId)}
                indice={indiceDe(comentario.autorId)}
                tamanho="pequeno"
              />
              <p className="min-w-0 flex-1 text-sm text-nevoa">
                <span className="font-medium text-neve">{nomeDe(comentario.autorId)}</span>{' '}
                {comentario.corpo}
                <span className="ml-2 text-xs text-cinza">{tempoAtras(comentario.criadoEm)}</span>
              </p>
            </div>
          ))}

          <form onSubmit={aoEnviar} className="flex gap-2">
            <input
              type="text"
              maxLength={1000}
              placeholder={textos.publicacao.comentarDica}
              value={corpo}
              onChange={(evento) => setCorpo(evento.target.value)}
              className="min-w-0 flex-1 rounded-full border border-linha bg-veu px-4 py-2 text-sm text-neve outline-none placeholder:text-cinza focus:border-rosa"
            />
            <button
              type="submit"
              disabled={corpo.trim().length === 0}
              className="rounded-full bg-rosa px-4 py-2 text-sm font-medium text-neve disabled:opacity-50"
            >
              {textos.publicacao.enviar}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
