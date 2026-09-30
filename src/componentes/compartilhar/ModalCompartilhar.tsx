import { useEffect, useState } from 'react'
import type { Publicacao } from '../../dominio/tipos'
import { desenharCartao } from '../../lib/desenharCartao'
import { ESTILOS_CARTAO, type NomeEstiloCartao } from '../../lib/layoutCartao'
import { textos } from '../../lib/textos'
import { Botao } from '../ui/Botao'
import { ModalBase } from '../ui/ModalBase'

/**
 * Gera o cartão 1080×1920 e compartilha via Web Share (com arquivos);
 * onde não houver suporte, baixa o PNG. O preview é o próprio cartão
 * renderizado, em miniatura — o que se vê é o que se compartilha.
 */
export function ModalCompartilhar({
  publicacao,
  nomes,
  aoFechar,
}: {
  publicacao: Publicacao
  nomes: string[]
  aoFechar: () => void
}) {
  const [estilo, setEstilo] = useState<NomeEstiloCartao>('meianoite')
  const [urlPreview, setUrlPreview] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    setUrlPreview(null)
    setBlob(null)
    setErro(null)

    desenharCartao({
      tituloFilme: publicacao.filme?.titulo ?? '',
      ano: publicacao.filme?.anoLancamento ?? null,
      caminhoPoster: publicacao.filme?.caminhoPoster ?? null,
      nota: publicacao.nota ?? 0,
      corpo: publicacao.corpo,
      nomes,
      estilo,
    })
      .then((gerado) => {
        if (!ativo) return
        setBlob(gerado)
        setUrlPreview(URL.createObjectURL(gerado))
      })
      .catch(() => {
        if (ativo) setErro(textos.compartilhar.erro)
      })

    return () => {
      ativo = false
    }
  }, [publicacao, nomes, estilo])

  async function aoCompartilhar() {
    if (!blob) return
    const arquivo = new File([blob], 'mozii-avaliacao.png', { type: 'image/png' })

    if (navigator.canShare?.({ files: [arquivo] })) {
      await navigator.share({ files: [arquivo] }).catch(() => {})
      return
    }
    // Sem Web Share (desktop): baixa o PNG.
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'mozii-avaliacao.png'
    link.click()
  }

  return (
    <ModalBase
      rotulo={textos.compartilhar.titulo}
      aoFechar={aoFechar}
      className="max-w-xs text-center"
    >
      <h2 className="font-titulo text-xl text-texto">{textos.compartilhar.titulo}</h2>

      <div className="mx-auto mt-4 aspect-[9/16] w-44 overflow-hidden rounded-xl bg-vidro">
        {urlPreview ? (
          <img src={urlPreview} alt="" className="h-full w-full object-cover" />
        ) : (
          <p className="mt-24 text-sm text-texto-discreto">{erro ?? textos.compartilhar.gerando}</p>
        )}
      </div>

      {/* Estilos do cartão (independentes do tema do app) */}
      <div
        role="group"
        aria-label={textos.compartilhar.estilo}
        className="mt-4 flex justify-center gap-2"
      >
        {(Object.keys(ESTILOS_CARTAO) as NomeEstiloCartao[]).map((nome) => (
          <button
            key={nome}
            type="button"
            aria-pressed={estilo === nome}
            onClick={() => setEstilo(nome)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              estilo === nome ? 'bg-primario text-primario-texto' : 'bg-vidro text-texto-secundario'
            }`}
          >
            {textos.compartilhar.estilos[nome]}
          </button>
        ))}
      </div>

      <Botao onClick={aoCompartilhar} disabled={!blob} className="mt-4 w-full">
        {textos.compartilhar.compartilhar}
      </Botao>
    </ModalBase>
  )
}
