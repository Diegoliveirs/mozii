import { useQuery } from '@tanstack/react-query'
import { buscarFilmes, obterFilme, obterOndeAssistir } from '../api/tmdb'
import { useValorAtrasado } from './useValorAtrasado'

/** Busca no TMDB com debounce de 400ms. */
export function useBuscaTmdb(termo: string) {
  const termoAtrasado = useValorAtrasado(termo)
  return useQuery({
    queryKey: ['tmdb', 'busca', termoAtrasado],
    queryFn: () => buscarFilmes(termoAtrasado),
    enabled: termoAtrasado.trim().length > 1,
    // Catálogo muda devagar: 10 minutos de frescor poupa requisições.
    staleTime: 10 * 60_000,
  })
}

export function useFilmeTmdb(tmdbId: number | null) {
  return useQuery({
    queryKey: ['tmdb', 'filme', tmdbId],
    queryFn: () => obterFilme(tmdbId!),
    enabled: tmdbId !== null,
    staleTime: 10 * 60_000,
  })
}

export function useOndeAssistir(tmdbId: number | null) {
  return useQuery({
    queryKey: ['tmdb', 'onde-assistir', tmdbId],
    queryFn: () => obterOndeAssistir(tmdbId!),
    enabled: tmdbId !== null,
    staleTime: 10 * 60_000,
  })
}
