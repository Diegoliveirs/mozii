import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FolhaBuscarFilme } from '../componentes/filmes/FolhaBuscarFilme'
import { Poster } from '../componentes/filmes/Poster'
import { EstrelasNota } from '../componentes/mural/EstrelasNota'
import { useRepositorios } from '../dados/ContextoRepositorios'
import type { RefFilme } from '../dominio/tipos'
import { useCriarAvaliacao, useCriarTexto } from '../hooks/useMural'
import { useConcluirSessao } from '../hooks/useSessoes'
import { redimensionarFoto } from '../lib/imagem'
import { textos } from '../lib/textos'

/** O cartão de sessão navega para cá com o filme e a sessão a concluir. */
interface EstadoDeSessao {
  filme?: RefFilme
  sessaoId?: string
}

/**
 * O composer do Mural: texto e/ou foto — ou uma avaliação, quando um
 * filme é escolhido (aí a nota vira obrigatória e a foto sai de cena).
 * Vindo do "E aí, como foi?", publicar a avaliação também conclui a sessão.
 */
export function PaginaNovaPublicacao() {
  const navegar = useNavigate()
  const estado = (useLocation().state ?? {}) as EstadoDeSessao
  const { arquivos } = useRepositorios()
  const criarTexto = useCriarTexto()
  const criarAvaliacao = useCriarAvaliacao()
  const concluirSessao = useConcluirSessao()

  const [corpo, setCorpo] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [filme, setFilme] = useState<RefFilme | null>(estado.filme ?? null)
  const [nota, setNota] = useState(0)
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [publicando, setPublicando] = useState(false)
  const campoFoto = useRef<HTMLInputElement>(null)

  const previewFoto = foto ? URL.createObjectURL(foto) : null

  async function aoPublicar() {
    setErro(null)
    const texto = corpo.trim() || null

    if (filme) {
      if (nota === 0) {
        setErro(textos.novo.faltaNota)
        return
      }
      setPublicando(true)
      try {
        const avaliacao = await criarAvaliacao.mutateAsync({ filme, nota, corpo: texto })
        // Veio do "E aí, como foi?": a avaliação conclui a sessão
        // (assistida + assistido na lista de origem, numa transação só).
        if (estado.sessaoId) {
          await concluirSessao.mutateAsync({
            sessaoId: estado.sessaoId,
            publicacaoAvaliacaoId: avaliacao.id,
          })
        }
        navegar('/', { replace: true })
      } catch {
        setErro(textos.comuns.erroInesperado)
      } finally {
        setPublicando(false)
      }
      return
    }

    if (!texto && !foto) {
      setErro(textos.novo.faltaConteudo)
      return
    }

    setPublicando(true)
    try {
      let caminhoFoto: string | null = null
      if (foto) {
        caminhoFoto = await arquivos.enviarFoto(await redimensionarFoto(foto))
      }
      await criarTexto.mutateAsync({ corpo: texto, caminhoFoto })
      navegar('/', { replace: true })
    } catch {
      setErro(textos.comuns.erroInesperado)
    } finally {
      setPublicando(false)
    }
  }

  return (
    <main className="px-5 pt-8">
      <h1 className="font-voz text-3xl text-neve">{textos.novo.titulo}</h1>

      <textarea
        rows={4}
        maxLength={2000}
        placeholder={textos.novo.dicaTexto}
        value={corpo}
        onChange={(evento) => setCorpo(evento.target.value)}
        className="mt-5 w-full resize-none rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none placeholder:text-cinza focus:border-rosa"
      />

      {/* Filme escolhido → avaliação */}
      {filme && (
        <div className="mt-3 rounded-2xl bg-cartao p-4">
          <div className="flex items-center gap-3">
            <Poster
              caminho={filme.caminhoPoster}
              titulo={filme.titulo}
              largura={185}
              className="w-12"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-neve">{filme.titulo}</p>
              <p className="mt-1 text-sm text-nevoa">{textos.novo.notaRotulo}</p>
              <EstrelasNota valor={nota} aoMudar={setNota} />
            </div>
            <button
              type="button"
              aria-label={textos.novo.removerFilme}
              onClick={() => {
                setFilme(null)
                setNota(0)
              }}
              className="text-cinza"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Foto escolhida (só em publicação de texto) */}
      {previewFoto && !filme && (
        <div className="relative mt-3">
          <img src={previewFoto} alt="" className="max-h-72 w-full rounded-xl object-cover" />
          <button
            type="button"
            aria-label={textos.novo.removerFoto}
            onClick={() => setFoto(null)}
            className="absolute top-2 right-2 rounded-full bg-abismo/80 px-2.5 py-1 text-neve"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!filme && (
          <>
            <button
              type="button"
              onClick={() => campoFoto.current?.click()}
              className="rounded-xl border border-linha-forte px-4 py-2.5 text-sm text-nevoa"
            >
              {textos.novo.foto}
            </button>
            <input
              ref={campoFoto}
              type="file"
              accept="image/*"
              hidden
              onChange={(evento) => setFoto(evento.target.files?.[0] ?? null)}
            />
          </>
        )}
        {!foto && (
          <button
            type="button"
            onClick={() => setBuscaAberta(true)}
            className="rounded-xl border border-linha-forte px-4 py-2.5 text-sm text-nevoa"
          >
            {filme ? textos.novo.trocarFilme : textos.novo.avaliarFilme}
          </button>
        )}
      </div>

      {erro && <p className="mt-3 text-sm text-rosa-suave">{erro}</p>}

      <button
        type="button"
        onClick={aoPublicar}
        disabled={publicando}
        className="mt-5 w-full rounded-xl bg-rosa py-3 font-medium text-neve disabled:opacity-60"
      >
        {publicando ? textos.novo.publicando : textos.novo.publicar}
      </button>

      {buscaAberta && (
        <FolhaBuscarFilme
          aoEscolher={(escolhido) => {
            setFilme(escolhido)
            setFoto(null)
            setBuscaAberta(false)
          }}
          aoFechar={() => setBuscaAberta(false)}
        />
      )}
    </main>
  )
}
