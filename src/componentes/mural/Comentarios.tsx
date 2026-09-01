import { useState, type FormEvent } from 'react'
import type { Perfil } from '../../dominio/tipos'
import { useComentar, useComentarios } from '../../hooks/useMural'
import { tempoAtras } from '../../lib/datas'
import { textos } from '../../lib/textos'
import { IconeEnviar } from '../ui/icones'
import { AvatarPerfil } from './AvatarPerfil'

/**
 * A conversa da publicação, sempre aberta na visão detalhada,
 * com envio otimista (o comentário aparece na hora).
 */
export function Comentarios({
  publicacaoId,
  membros,
  focarCampo = false,
}: {
  publicacaoId: string
  membros: Perfil[]
  focarCampo?: boolean
}) {
  const comentarios = useComentarios(publicacaoId, true)
  const comentar = useComentar()
  const [corpo, setCorpo] = useState('')

  function perfilDe(autorId: string) {
    return membros.find((membro) => membro.id === autorId)
  }

  function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    const texto = corpo.trim()
    if (!texto) return
    comentar.mutate({ publicacaoId, corpo: texto })
    setCorpo('')
  }

  return (
    <div className="space-y-3">
      {comentarios.data?.map((comentario) => {
        const autor = perfilDe(comentario.autorId)
        const nomeAutor = autor?.nomeExibicao ?? '…'
        const indiceAutor = Math.max(
          0,
          membros.findIndex((membro) => membro.id === comentario.autorId),
        )

        return (
          <div key={comentario.id} className="flex items-start gap-2">
            <AvatarPerfil
              nome={nomeAutor}
              indice={indiceAutor}
              caminhoAvatar={autor?.urlAvatar}
              tamanho="pequeno"
            />
            <p className="min-w-0 flex-1 text-sm text-nevoa">
              <span className="font-medium text-neve">{nomeAutor}</span> {comentario.corpo}
              <span className="ml-2 text-xs text-cinza">{tempoAtras(comentario.criadoEm)}</span>
            </p>
          </div>
        )
      })}

      <form onSubmit={aoEnviar} className="flex items-center gap-2">
        <input
          type="text"
          maxLength={1000}
          autoFocus={focarCampo}
          placeholder={textos.publicacao.comentarDica}
          value={corpo}
          onChange={(evento) => setCorpo(evento.target.value)}
          className="min-w-0 flex-1 rounded-full border border-linha bg-veu px-4 py-2.5 text-sm text-neve outline-none transition-colors placeholder:text-cinza focus:border-rosa focus:ring-2 focus:ring-rosa/25"
        />
        <button
          type="submit"
          aria-label={textos.publicacao.enviar}
          disabled={corpo.trim().length === 0}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rosa text-neve transition-transform active:scale-90 disabled:opacity-50"
        >
          <IconeEnviar size={17} weight="fill" aria-hidden />
        </button>
      </form>
    </div>
  )
}
