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

/**
 * Rótulo de um DIA da linha do tempo dos Momentos ("Hoje", "Ontem",
 * "12 de março", "25 de dezembro de 2024"). Recebe AAAA-MM-DD.
 */
export function rotuloDoDia(dataIso: string, hoje: Date = new Date()): string {
  const [ano, mes, dia] = dataIso.split('-').map(Number)
  const data = new Date(ano, mes - 1, dia)

  const mesmoDia = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  const ontem = new Date(hoje)
  ontem.setDate(hoje.getDate() - 1)

  if (mesmoDia(data, hoje)) return 'Hoje'
  if (mesmoDia(data, ontem)) return 'Ontem'
  if (ano === hoje.getFullYear()) return format(data, "d 'de' MMMM", { locale: ptBR })
  return format(data, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

/**
 * Quando a sessão acontece, para humanos: "sábado, 15 de ago · 20h"
 * (o minuto só aparece quando não é em ponto: "· 20h30").
 */
export function formatarQuando(iso: string): string {
  const data = new Date(iso)
  const dia = format(data, "EEEE, d 'de' MMM", { locale: ptBR })
  const minutos = format(data, 'mm')
  return `${dia} · ${format(data, 'HH')}h${minutos === '00' ? '' : minutos}`
}

/** Valor local, sem sufixo de fuso, aceito por `<input type="datetime-local">`. */
export function valorParaCampoDataHoraLocal(iso: string): string {
  return format(new Date(iso), "yyyy-MM-dd'T'HH:mm")
}

/**
 * Contagem regressiva do cartão de sessão: "em 3 dias", "em 5 h",
 * "em 42 min", "é agora! 🍿" — e `null` quando o horário já passou
 * (o cartão vira o estado "como foi?").
 */
export function contagemRegressiva(ateIso: string, agora: Date = new Date()): string | null {
  const minutos = Math.floor((new Date(ateIso).getTime() - agora.getTime()) / 60_000)

  if (minutos < -1) return null
  if (minutos <= 1) return 'é agora! 🍿'
  if (minutos < 60) return `em ${minutos} min`

  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `em ${horas} h`

  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'em 1 dia' : `em ${dias} dias`
}

/** Data de hoje no formato do <input type="date"> (AAAA-MM-DD, fuso local). */
export function hojeParaCampoData(agora: Date = new Date()): string {
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}
