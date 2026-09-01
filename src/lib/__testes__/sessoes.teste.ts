import { describe, expect, it } from 'vitest'
import type { SessaoCinema } from '../../dominio/tipos'
import { organizarSessoesAgendadas } from '../sessoes'

const agora = new Date('2026-08-31T20:00:00-03:00')

function sessao(id: string, diferencaMinutos: number): SessaoCinema {
  return {
    id,
    criadoPor: 'perfil-1',
    filme: {
      tmdbId: Number(id.replace(/\D/g, '')) || 1,
      titulo: `Filme ${id}`,
      caminhoPoster: null,
      anoLancamento: 2026,
    },
    itemListaId: null,
    agendadaPara: new Date(agora.getTime() + diferencaMinutos * 60_000).toISOString(),
    observacao: null,
    status: 'agendada',
    criadoEm: agora.toISOString(),
  }
}

describe('organizarSessoesAgendadas', () => {
  it('separa futuras e passadas e mantém cada grupo em ordem cronológica', () => {
    const entrada = [sessao('f2', 240), sessao('p2', -60), sessao('f1', 30), sessao('p1', -120)]

    const resultado = organizarSessoesAgendadas(entrada, agora)

    expect(resultado.futuras.map(({ id }) => id)).toEqual(['f1', 'f2'])
    expect(resultado.passadas.map(({ id }) => id)).toEqual(['p1', 'p2'])
    expect(entrada.map(({ id }) => id)).toEqual(['f2', 'p2', 'f1', 'p1'])
  })
})
