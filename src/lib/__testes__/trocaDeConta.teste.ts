import { describe, expect, it, vi } from 'vitest'
import { aoTrocarDeConta } from '../trocaDeConta'

describe('aoTrocarDeConta', () => {
  it('não limpa na sessão inicial nem em renovação de token da mesma conta', () => {
    const limpar = vi.fn()
    const ouvir = aoTrocarDeConta(limpar)
    ouvir({ id: 'a' })
    ouvir({ id: 'a' })
    expect(limpar).not.toHaveBeenCalled()
  })

  it('limpa no logout (inclusive vindo de outra aba) e na entrada de outra conta', () => {
    const limpar = vi.fn()
    const ouvir = aoTrocarDeConta(limpar)
    ouvir({ id: 'a' })
    ouvir(null)
    ouvir({ id: 'b' })
    expect(limpar).toHaveBeenCalledTimes(2)
  })

  it('limpa quando a primeira sessão aparece depois de começar deslogado', () => {
    const limpar = vi.fn()
    const ouvir = aoTrocarDeConta(limpar)
    ouvir(null)
    ouvir({ id: 'a' })
    expect(limpar).toHaveBeenCalledTimes(1)
  })
})
