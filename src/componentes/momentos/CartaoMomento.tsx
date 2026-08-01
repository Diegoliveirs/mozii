import { useState } from 'react'
import type { Momento, Perfil } from '../../dominio/tipos'
import { useUrlsFotos } from '../../hooks/useMomentos'
import { textos } from '../../lib/textos'
import { Lightbox } from '../ui/Lightbox'
import { AvatarPerfil } from '../mural/AvatarPerfil'

/** Uma memória na linha do tempo: fotos (com lightbox), legenda e autor. */
export function CartaoMomento({
  momento,
  membros,
  meuId,
  aoExcluir,
}: {
  momento: Momento
  membros: Perfil[]
  meuId: string | undefined
  aoExcluir: (momento: Momento) => void
}) {
  const urls = useUrlsFotos(momento.caminhosFotos)
  const [fotoAberta, setFotoAberta] = useState<number | null>(null)

  const indiceAutor = Math.max(
    0,
    membros.findIndex((membro) => membro.id === momento.autorId),
  )
  const autor = membros.find((membro) => membro.id === momento.autorId)

  return (
    <article className="rounded-2xl bg-cartao p-4">
      {momento.caminhosFotos.length > 0 && (
        <div
          className={`grid gap-1.5 ${momento.caminhosFotos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
        >
          {urls.data
            ? urls.data.map((url, indice) => (
                <button key={url} type="button" onClick={() => setFotoAberta(indice)}>
                  <img
                    src={url}
                    alt=""
                    className="max-h-72 w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                </button>
              ))
            : momento.caminhosFotos.map((caminho) => (
                <div key={caminho} className="h-40 animate-pulse rounded-xl bg-veu" />
              ))}
        </div>
      )}

      {momento.legenda && (
        <p className="mt-3 font-voz whitespace-pre-wrap text-neve">{momento.legenda}</p>
      )}

      <footer className="mt-3 flex items-center gap-2 text-xs text-cinza">
        {autor && (
          <>
            <AvatarPerfil
              nome={autor.nomeExibicao}
              indice={indiceAutor}
              caminhoAvatar={autor.urlAvatar}
              tamanho="pequeno"
            />
            {autor.nomeExibicao}
          </>
        )}
        {momento.autorId === meuId && (
          <button
            type="button"
            onClick={() => aoExcluir(momento)}
            className="ml-auto text-rosa-suave underline"
          >
            {textos.momentos.excluir}
          </button>
        )}
      </footer>

      {fotoAberta !== null && urls.data && (
        <Lightbox
          urls={urls.data}
          indiceInicial={fotoAberta}
          aoFechar={() => setFotoAberta(null)}
        />
      )}
    </article>
  )
}
