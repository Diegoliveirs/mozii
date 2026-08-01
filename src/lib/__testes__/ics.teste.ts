import { describe, expect, it } from 'vitest'
import { gerarIcs } from '../ics'

describe('gerarIcs', () => {
  const evento = {
    id: 'abc-123',
    titulo: 'Cinema: Duna',
    descricao: 'Sessão do casal; leva pipoca, por favor',
    inicio: new Date('2026-08-15T20:00:00-03:00'),
    duracaoMinutos: 150,
  }

  it('gera o evento com início/fim em UTC e alarme de 30 minutos', () => {
    const ics = gerarIcs(evento)
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('DTSTART:20260815T230000Z') // 20h de Brasília = 23h UTC
    expect(ics).toContain('DTEND:20260816T013000Z') // +150 minutos
    expect(ics).toContain('SUMMARY:Cinema: Duna')
    expect(ics).toContain('TRIGGER:-PT30M')
    expect(ics).toContain('UID:abc-123@mozii')
  })

  it('escapa vírgulas e ponto-e-vírgulas (RFC 5545)', () => {
    const ics = gerarIcs(evento)
    expect(ics).toContain('DESCRIPTION:Sessão do casal\\; leva pipoca\\, por favor')
  })

  it('usa CRLF entre as linhas', () => {
    expect(gerarIcs(evento)).toContain('\r\n')
  })
})
