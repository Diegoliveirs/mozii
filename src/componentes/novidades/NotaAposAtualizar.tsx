import { useState } from 'react'
import type { NotaDeAtualizacao } from '../../dominio/tipos'
import { consumirMarcaDeNovidades, notasDesde, registrarNotaVista } from '../../lib/novidades'
import { textos } from '../../lib/textos'
import { FolhaNovidades } from './FolhaNovidades'

// A marca é consumida ao ser lida: calcula UMA vez por carga do app (o
// StrictMode chama inicializadores de estado duas vezes em dev).
let notasDestaCarga: NotaDeAtualizacao[] | null = null

function notasParaMostrar(): NotaDeAtualizacao[] {
  if (notasDestaCarga === null) {
    const { marcado, ultimaVista } = consumirMarcaDeNovidades()
    notasDestaCarga = marcado ? notasDesde(textos.novidades.notas, ultimaVista) : []
  }
  return notasDestaCarga
}

/**
 * Depois do toque em "Atualizar" (que marca o aparelho), o app novo abre
 * a nota de atualização uma única vez. Sem marca ou sem nota nova, nada.
 */
export function NotaAposAtualizar() {
  const [notas, setNotas] = useState(notasParaMostrar)

  if (notas.length === 0) return null

  function aoFechar() {
    registrarNotaVista(textos.novidades.notas[0].versao)
    setNotas([])
  }

  return <FolhaNovidades notas={notas} aoFechar={aoFechar} />
}
