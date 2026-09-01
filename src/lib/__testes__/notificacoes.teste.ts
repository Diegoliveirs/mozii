import { describe, expect, it } from 'vitest'
import { chaveVapidParaBytes, decidirSuporte } from '../notificacoes'

describe('decidirSuporte', () => {
  const base = {
    temServiceWorker: true,
    temPushManager: true,
    temNotification: true,
    ehIos: false,
    estaInstalado: false,
  }

  it('navegador completo fora do iOS é suportado', () => {
    expect(decidirSuporte(base)).toBe('suportado')
  })

  it('iOS sem instalar pede a instalação, mesmo com APIs presentes', () => {
    expect(decidirSuporte({ ...base, ehIos: true })).toBe('precisa-instalar')
  })

  it('iOS instalado com APIs é suportado', () => {
    expect(decidirSuporte({ ...base, ehIos: true, estaInstalado: true })).toBe('suportado')
  })

  it('sem PushManager é indisponível', () => {
    expect(decidirSuporte({ ...base, temPushManager: false })).toBe('indisponivel')
  })

  it('sem service worker é indisponível', () => {
    expect(decidirSuporte({ ...base, temServiceWorker: false })).toBe('indisponivel')
  })
})

describe('chaveVapidParaBytes', () => {
  it('converte base64url (com - e _) nos bytes certos', () => {
    // 'BQ-_' em base64url = bytes [0x05, 0x0f, 0xbf]
    expect([...chaveVapidParaBytes('BQ-_')]).toEqual([0x05, 0x0f, 0xbf])
  })

  it('aceita chave sem padding (comprimento não múltiplo de 4)', () => {
    // 'AAA' = 2 bytes zerados
    expect([...chaveVapidParaBytes('AAA')]).toEqual([0, 0])
  })

  it('chave VAPID real (65 bytes, começa com 0x04)', () => {
    const chave =
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
    const bytes = chaveVapidParaBytes(chave)
    expect(bytes.length).toBe(65)
    expect(bytes[0]).toBe(0x04)
  })
})
