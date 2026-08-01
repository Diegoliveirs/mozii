import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Tempo relativo curto para o Mural: "agora", "há 5 min", "há 2 h",
 * "ontem", "há 3 dias" e, mais velho que uma semana, a data por extenso.
 * `agora` é injetável para os testes.
 */
export function tempoAtras(iso: string, agora: Date = new Date()): string {
  const segundos = Math.floor((agora.getTime() - new Date(iso).getTime()) / 1000)

  if (segundos < 45) return 'agora'

  const minutos = Math.floor(segundos / 60)
  if (minutos < 60) return `há ${minutos} min`

  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `há ${horas} h`

  const dias = Math.floor(horas / 24)
  if (dias === 1) return 'ontem'
  if (dias < 7) return `há ${dias} dias`

  return format(new Date(iso), "d 'de' MMM", { locale: ptBR })
}
