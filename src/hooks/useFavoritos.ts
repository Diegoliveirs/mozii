import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAviso } from '../componentes/ui/Avisos'
import { useRepositorios } from '../dados/ContextoRepositorios'
import type { RefFilme } from '../dominio/tipos'
import { textos } from '../lib/textos'

const chaveFavoritos = (perfilId: string) => ['favoritos', perfilId] as const

export function useFavoritosDe(perfilId: string | undefined) {
  const { favoritos } = useRepositorios()
  return useQuery({
    queryKey: chaveFavoritos(perfilId ?? ''),
    queryFn: () => favoritos.favoritosDe(perfilId!),
    enabled: !!perfilId,
  })
}

export function useDefinirFavorito() {
  const { favoritos } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: ({ posicao, filme }: { posicao: number; filme: RefFilme }) =>
      favoritos.definir(posicao, filme),
    onSuccess: () => clienteQuery.invalidateQueries({ queryKey: ['favoritos'] }),
  })
}

export function useRemoverFavorito() {
  const { favoritos } = useRepositorios()
  const clienteQuery = useQueryClient()
  const avisar = useAviso()
  return useMutation({
    mutationFn: (favoritoId: string) => favoritos.remover(favoritoId),
    onSuccess: () => clienteQuery.invalidateQueries({ queryKey: ['favoritos'] }),
    onError: () => avisar(textos.comuns.erroInesperado, 'erro'),
  })
}
