import type { Momento, Perfil } from '../../dominio/tipos'
import { textos } from '../../lib/textos'
import { GradeFotos } from '../ui/GradeFotos'
import { IconeLixeira } from '../ui/icones'
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
  const indiceAutor = Math.max(
    0,
    membros.findIndex((membro) => membro.id === momento.autorId),
  )
  const autor = membros.find((membro) => membro.id === momento.autorId)

  return (
    <article>
      <GradeFotos caminhos={momento.caminhosFotos} />

      <div className="pt-3.5">
        {momento.legenda && (
          <p className="font-titulo text-lg leading-snug whitespace-pre-wrap text-texto">
            {momento.legenda}
          </p>
        )}

        <footer className="mt-2 flex items-center gap-2 text-xs text-texto-discreto">
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
              className="ml-auto p-1 text-perigo-texto transition-transform active:scale-90"
            >
              <IconeLixeira size={17} aria-hidden />
            </button>
          )}
        </footer>
      </div>
    </article>
  )
}
