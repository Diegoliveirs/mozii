import { describe, expect, it, vi } from 'vitest'
import type { RepositorioArquivos } from '../../dados/repositorios'
import { gravarComFotos } from '../gravarComFotos'

// O redimensionamento é do navegador (canvas); aqui só importa o fluxo.
vi.mock('../imagem', () => ({ redimensionarFoto: async (foto: File) => foto }))

function arquivosFalsos(falharNoEnvio?: number) {
  let enviadas = 0
  const apagadas: string[] = []
  const arquivos: RepositorioArquivos = {
    async enviarFoto() {
      enviadas++
      if (enviadas === falharNoEnvio) throw new Error('upload falhou')
      return `casal/${enviadas}.webp`
    },
    async urlFoto(caminho) {
      return caminho
    },
    async apagarFotos(caminhos) {
      apagadas.push(...caminhos)
    },
  }
  return { arquivos, apagadas }
}

const fotos = [new File(['a'], 'a.png'), new File(['b'], 'b.png'), new File(['c'], 'c.png')]

describe('gravarComFotos', () => {
  it('grava com os caminhos na ordem e não apaga nada quando dá certo', async () => {
    const { arquivos, apagadas } = arquivosFalsos()
    const gravado = await gravarComFotos(arquivos, fotos, async (caminhos) => caminhos)
    expect(gravado).toEqual(['casal/1.webp', 'casal/2.webp', 'casal/3.webp'])
    expect(apagadas).toEqual([])
  })

  it('a gravação falhou: apaga todas as fotos que subiram', async () => {
    const { arquivos, apagadas } = arquivosFalsos()
    await expect(
      gravarComFotos(arquivos, fotos, async () => {
        throw new Error('CHECK violado')
      }),
    ).rejects.toThrow('CHECK violado')
    expect(apagadas).toEqual(['casal/1.webp', 'casal/2.webp', 'casal/3.webp'])
  })

  it('um upload no meio falhou: apaga as anteriores e nem tenta gravar', async () => {
    const { arquivos, apagadas } = arquivosFalsos(3)
    const gravar = vi.fn()
    await expect(gravarComFotos(arquivos, fotos, gravar)).rejects.toThrow('upload falhou')
    expect(gravar).not.toHaveBeenCalled()
    expect(apagadas).toEqual(['casal/1.webp', 'casal/2.webp'])
  })
})
