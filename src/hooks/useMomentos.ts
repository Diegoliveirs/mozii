import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRepositorios } from '../dados/ContextoRepositorios'
import type { Momento } from '../dominio/tipos'
import { redimensionarFoto } from '../lib/imagem'
import { chaveFeed } from './useMural'

export const chaveMomentos = ['momentos'] as const

/** URLs assinadas de várias fotos de uma vez (as fotos de um momento). */
export function useUrlsFotos(caminhos: string[]) {
  const { arquivos } = useRepositorios()
  return useQuery({
    queryKey: ['arquivos', 'urls', caminhos],
    queryFn: () => Promise.all(caminhos.map((caminho) => arquivos.urlFoto(caminho))),
    enabled: caminhos.length > 0,
    staleTime: 45 * 60_000,
  })
}

export function useLinhaDoTempo() {
  const { momentos } = useRepositorios()
  return useQuery({ queryKey: chaveMomentos, queryFn: () => momentos.linhaDoTempo() })
}

/** Cria a memória: redimensiona e sobe as fotos, grava e espelha no Mural. */
export function useCriarMomento() {
  const { momentos, arquivos } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: async (dados: { legenda: string | null; aconteceuEm: string; fotos: File[] }) => {
      const caminhos: string[] = []
      for (const foto of dados.fotos) {
        caminhos.push(await arquivos.enviarFoto(await redimensionarFoto(foto)))
      }
      return momentos.criar({
        legenda: dados.legenda,
        aconteceuEm: dados.aconteceuEm,
        caminhosFotos: caminhos,
      })
    },
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: chaveMomentos })
      clienteQuery.invalidateQueries({ queryKey: chaveFeed })
    },
  })
}

export function useExcluirMomento() {
  const { momentos } = useRepositorios()
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: (momento: Momento) => momentos.excluir(momento),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: chaveMomentos })
      clienteQuery.invalidateQueries({ queryKey: chaveFeed })
    },
  })
}
