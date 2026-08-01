/**
 * Gera um evento de calendário (.ics) para a sessão de cinema.
 * O calendário do celular lembra o casal melhor que qualquer push caseiro —
 * zero infraestrutura. Lógica pura, testada.
 */
export interface DadosEvento {
  id: string
  titulo: string
  descricao: string
  inicio: Date
  duracaoMinutos: number
}

function paraUtc(data: Date): string {
  return data
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}

function escapar(texto: string): string {
  return texto
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export function gerarIcs(evento: DadosEvento): string {
  const fim = new Date(evento.inicio.getTime() + evento.duracaoMinutos * 60_000)

  // Linhas separadas por CRLF, como manda a RFC 5545.
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mozii//Sessao de cinema//PT',
    'BEGIN:VEVENT',
    `UID:${evento.id}@mozii`,
    `DTSTAMP:${paraUtc(new Date())}`,
    `DTSTART:${paraUtc(evento.inicio)}`,
    `DTEND:${paraUtc(fim)}`,
    `SUMMARY:${escapar(evento.titulo)}`,
    `DESCRIPTION:${escapar(evento.descricao)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Sessão de cinema em 30 minutos 🍿',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

/** Baixa o .ics no navegador (o app de calendário assume dali em diante). */
export function baixarIcs(nomeArquivo: string, conteudo: string): void {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([conteudo], { type: 'text/calendar' }))
  link.download = nomeArquivo
  link.click()
}
