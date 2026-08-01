import { useEffect, useState } from 'react'

/**
 * Devolve o valor só depois de `atrasoMs` sem mudanças (debounce).
 * Usado na busca do TMDB: uma requisição por pausa de digitação, não por tecla.
 */
export function useValorAtrasado<T>(valor: T, atrasoMs = 400): T {
  const [atrasado, setAtrasado] = useState(valor)

  useEffect(() => {
    const temporizador = setTimeout(() => setAtrasado(valor), atrasoMs)
    return () => clearTimeout(temporizador)
  }, [valor, atrasoMs])

  return atrasado
}
