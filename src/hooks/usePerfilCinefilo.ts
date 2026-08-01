import { useQuery } from '@tanstack/react-query'
import { useRepositorios } from '../dados/ContextoRepositorios'
import type { Publicacao } from '../dominio/tipos'
import { useListas } from './useListas'

/**
 * Estatísticas do perfil, calculadas NO CLIENTE a partir
 * das avaliações da pessoa — volume de um casal cabe numa consulta.
 */
export interface EstatisticasPerfil {
  filmesAvaliados: number
  notaMedia: number | null
  avaliadosEsteAno: number
  listasCriadas: number
  /** nota (0.5–5, passo 0.5) → quantidade; base do histograma. */
  distribuicaoNotas: Map<number, number>
}

export function useAvaliacoesDe(perfilId: string | undefined) {
  const { mural } = useRepositorios()
  return useQuery({
    queryKey: ['perfil', 'avaliacoes', perfilId],
    queryFn: () => mural.avaliacoesDe(perfilId!),
    enabled: !!perfilId,
  })
}

export function useEstatisticasPerfil(perfilId: string | undefined): EstatisticasPerfil | null {
  const avaliacoes = useAvaliacoesDe(perfilId)
  const listas = useListas()

  if (!avaliacoes.data || !listas.data || !perfilId) return null
  return calcularEstatisticas(
    avaliacoes.data,
    listas.data.filter((l) => l.criadoPor === perfilId).length,
  )
}

function calcularEstatisticas(avaliacoes: Publicacao[], listasCriadas: number): EstatisticasPerfil {
  const notas = avaliacoes
    .map((avaliacao) => avaliacao.nota)
    .filter((nota): nota is number => nota !== null)

  const anoAtual = new Date().getFullYear()
  const distribuicao = new Map<number, number>()
  for (const nota of notas) {
    distribuicao.set(nota, (distribuicao.get(nota) ?? 0) + 1)
  }

  return {
    filmesAvaliados: notas.length,
    notaMedia:
      notas.length > 0
        ? Math.round((notas.reduce((soma, nota) => soma + nota, 0) / notas.length) * 10) / 10
        : null,
    avaliadosEsteAno: avaliacoes.filter(
      (avaliacao) => new Date(avaliacao.criadoEm).getFullYear() === anoAtual,
    ).length,
    listasCriadas,
    distribuicaoNotas: distribuicao,
  }
}
