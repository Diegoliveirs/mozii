import { describe, expect, it } from 'vitest'
import { urlDeConfirmacaoEmail } from '../autenticacao'

describe('urlDeConfirmacaoEmail', () => {
  it('preserva a origem e aponta para a rota pública de confirmação', () => {
    expect(urlDeConfirmacaoEmail('https://mozii.exemplo.com')).toBe(
      'https://mozii.exemplo.com/confirmar-email',
    )
  })

  it('funciona com origem local que já termina em barra', () => {
    expect(urlDeConfirmacaoEmail('http://localhost:5173/')).toBe(
      'http://localhost:5173/confirmar-email',
    )
  })
})
