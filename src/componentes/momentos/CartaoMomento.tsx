import { useState } from 'react'
import type { Momento, Perfil } from '../../dominio/tipos'
import { useUrlsFotos } from '../../hooks/useMomentos'
import { textos } from '../../lib/textos'
import { Esqueleto } from '../ui/Esqueleto'
import { IconeLixeira } from '../ui/icones'
import { Lightbox } from '../ui/Lightbox'
import { AvatarPerfil } from '../mural/AvatarPerfil'

/**
 * Uma memória na linha do tempo. As fotos são o foco: sangram de borda
 * a borda do cartão. Excluir é uma lixeira visível no rodapé.
 */
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
    <article className="overflow-hidden rounded-2xl border border-linha bg-cartao shadow-cartao">
      {momento.caminhosFotos.length > 0 && (
        <div
          className={`grid gap-0.5 ${momento.caminhosFotos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
        >
          {urls.data
            ? urls.data.map((url, indice) => (
                <button key={url} type="button" onClick={() => setFotoAberta(indice)}>
                  <img src={url} alt="" className="max-h-80 w-full object-cover" loading="lazy" />
                </button>
              ))
            : momento.caminhosFotos.map((caminho) => (
                <Esqueleto key={caminho} className="h-44 rounded-none" />
              ))}
        </div>
      )}

      <div className="px-4 pt-3 pb-3.5">
        {momento.legenda && (
          <p className="font-voz text-[15px] whitespace-pre-wrap text-neve italic">
            {momento.legenda}
          </p>
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
              aria-label={textos.momentos.excluir}
              onClick={() => aoExcluir(momento)}
              className="ml-auto p-1 text-erro transition-transform active:scale-90"
            >
              <IconeLixeira size={17} aria-hidden />
            </button>
          )}
        </footer>
      </div>

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
