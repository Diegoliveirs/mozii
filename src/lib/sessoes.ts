import type { SessaoCinema } from '../dominio/tipos'
import { contagemRegressiva } from './datas'

/** Ordena e separa tudo que ainda está com status agendado. */
export function organizarSessoesAgendadas(
  sessoes: SessaoCinema[],
  agora: Date = new Date(),
): { futuras: SessaoCinema[]; passadas: SessaoCinema[] } {
  const ordenadas = [...sessoes].sort(
    (a, b) => new Date(a.agendadaPara).getTime() - new Date(b.agendadaPara).getTime(),
  )

  return {
    futuras: ordenadas.filter((sessao) => contagemRegressiva(sessao.agendadaPara, agora) !== null),
    passadas: ordenadas.filter((sessao) => contagemRegressiva(sessao.agendadaPara, agora) === null),
  }
}
