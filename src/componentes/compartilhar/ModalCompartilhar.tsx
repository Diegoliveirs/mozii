import { useEffect, useState } from 'react'
import type { Publicacao } from '../../dominio/tipos'
import { desenharCartao } from '../../lib/desenharCartao'
import { TEMAS, type NomeTema } from '../../lib/layoutCartao'
import { textos } from '../../lib/textos'

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
  const [tema, setTema] = useState<NomeTema>('meianoite')
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
      tema,
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
  }, [publicacao, nomes, tema])

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-abismo/90 px-6"
      role="dialog"
      aria-modal="true"
      aria-label={textos.compartilhar.titulo}
      onClick={aoFechar}
    >
      <div
        className="w-full max-w-xs rounded-2xl bg-cartao p-5 text-center"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 className="font-voz text-xl text-neve">{textos.compartilhar.titulo}</h2>

        <div className="mx-auto mt-4 aspect-[9/16] w-44 overflow-hidden rounded-xl bg-veu">
          {urlPreview ? (
            <img src={urlPreview} alt="" className="h-full w-full object-cover" />
          ) : (
            <p className="mt-24 text-sm text-cinza">{erro ?? textos.compartilhar.gerando}</p>
          )}
        </div>

        {/* Temas */}
        <div className="mt-4 flex justify-center gap-2">
          {(Object.keys(TEMAS) as NomeTema[]).map((nome) => (
            <button
              key={nome}
              type="button"
              onClick={() => setTema(nome)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                tema === nome ? 'bg-rosa text-neve' : 'bg-veu text-nevoa'
              }`}
            >
              {TEMAS[nome].nome}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={aoCompartilhar}
          disabled={!blob}
          className="mt-4 w-full rounded-xl bg-rosa py-3 font-medium text-neve disabled:opacity-50"
        >
          {textos.compartilhar.compartilhar}
        </button>
      </div>
    </div>
  )
}
