import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FolhaBuscarFilme } from '../filmes/FolhaBuscarFilme'
import { Poster } from '../filmes/Poster'
import { useDefinirFavorito, useFavoritosDe, useRemoverFavorito } from '../../hooks/useFavoritos'
import { textos } from '../../lib/textos'

const POSICOES = [1, 2, 3, 4, 5]

/** A fileira dos 5 favoritos. Só o dono do perfil edita os seus. */
export function FavoritosFileira({ perfilId, editavel }: { perfilId: string; editavel: boolean }) {
  const favoritos = useFavoritosDe(perfilId)
  const definir = useDefinirFavorito()
  const remover = useRemoverFavorito()
  const [escolhendoPosicao, setEscolhendoPosicao] = useState<number | null>(null)

  return (
    <section className="mt-6">
      <h2 className="font-medium text-neve">{textos.perfil.favoritos}</h2>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {POSICOES.map((posicao) => {
          const favorito = favoritos.data?.find((cada) => cada.posicao === posicao)

          if (favorito) {
            return (
              <div key={posicao} className="relative">
                <Link to={`/filme/${favorito.filme.tmdbId}`}>
                  <Poster
                    caminho={favorito.filme.caminhoPoster}
                    titulo={favorito.filme.titulo}
                    largura={185}
                  />
                </Link>
                {editavel && (
                  <button
                    type="button"
                    aria-label={textos.perfil.removerFavorito}
                    onClick={() => remover.mutate(favorito.id)}
                    className="absolute -top-1.5 -right-1.5 rounded-full bg-abismo px-1.5 text-xs text-nevoa"
                  >
                    ✕
                  </button>
                )}
              </div>
            )
          }

          return (
            <button
              key={posicao}
              type="button"
              disabled={!editavel}
              aria-label={`${textos.perfil.favoritos} ${posicao}`}
              onClick={() => setEscolhendoPosicao(posicao)}
              className="flex aspect-[2/3] items-center justify-center rounded-lg border border-dashed border-linha-forte text-cinza disabled:opacity-40"
            >
              +
            </button>
          )
        })}
      </div>
      {editavel && favoritos.data?.length === 0 && (
        <p className="mt-2 text-xs text-cinza">{textos.perfil.favoritosDica}</p>
      )}

      {escolhendoPosicao !== null && (
        <FolhaBuscarFilme
          aoEscolher={async (filme) => {
            await definir.mutateAsync({ posicao: escolhendoPosicao, filme })
            setEscolhendoPosicao(null)
          }}
          aoFechar={() => setEscolhendoPosicao(null)}
        />
      )}
    </section>
  )
}
