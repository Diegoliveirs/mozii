import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FolhaBuscarFilme } from '../componentes/filmes/FolhaBuscarFilme'
import { Poster } from '../componentes/filmes/Poster'
import { CabecalhoPagina } from '../componentes/layout/CabecalhoPagina'
import { EstrelasNota } from '../componentes/mural/EstrelasNota'
import { Botao } from '../componentes/ui/Botao'
import { AreaTexto } from '../componentes/ui/Campo'
import { IconeFechar, IconeFilme, IconeFoto } from '../componentes/ui/icones'
import { useRepositorios } from '../dados/ContextoRepositorios'
import type { RefFilme } from '../dominio/tipos'
import { useCriarAvaliacao, useCriarTexto } from '../hooks/useMural'
import { useConcluirSessao } from '../hooks/useSessoes'
import { useAutenticacao } from '../hooks/useAutenticacao'
import { useAvaliacoesDoFilme } from '../hooks/useMural'
import { redimensionarFoto } from '../lib/imagem'
import { textos } from '../lib/textos'

/** O cartão de sessão navega para cá com o filme e a sessão a concluir. */
interface EstadoDaNovaPublicacao {
  filme?: RefFilme
  sessaoId?: string
  voltarPara?: string
}

/**
 * O composer do Mural: texto e/ou foto — ou uma avaliação, quando um
 * filme é escolhido (aí a nota vira obrigatória e a foto sai de cena).
 * Vindo do "E aí, como foi?", publicar a avaliação também conclui a sessão.
 */
export function PaginaNovaPublicacao() {
  const navegar = useNavigate()
  const estado = (useLocation().state ?? {}) as EstadoDaNovaPublicacao
  const { usuario } = useAutenticacao()
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
  const avaliacoesDoFilme = useAvaliacoesDoFilme(filme?.tmdbId ?? null)
  const minhaAvaliacao = avaliacoesDoFilme.data?.find(
    (avaliacao) => avaliacao.autorId === usuario?.id,
  )

  const previewFoto = foto ? URL.createObjectURL(foto) : null

  async function aoPublicar() {
    setErro(null)
    const texto = corpo.trim() || null

    if (filme) {
      if (minhaAvaliacao) {
        navegar(`/publicacao/${minhaAvaliacao.id}`, {
          replace: true,
          state: { voltarPara: estado.voltarPara ?? `/filme/${filme.tmdbId}` },
        })
        return
      }
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
        navegar(estado.voltarPara ?? '/', { replace: true })
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
    <main>
      {/* O voltar aqui É o "cancelar" da publicação */}
      <CabecalhoPagina titulo={textos.novo.titulo} fallback="/" />
      <div className="px-5">
        <AreaTexto
          rows={4}
          maxLength={2000}
          placeholder={textos.novo.dicaTexto}
          value={corpo}
          onChange={(evento) => setCorpo(evento.target.value)}
          className="mt-2 resize-none"
        />

        {/* Filme escolhido → avaliação */}
        {filme && (
          <div className="mt-3 rounded-2xl border border-linha bg-cartao p-4">
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
                {minhaAvaliacao && (
                  <button
                    type="button"
                    onClick={() =>
                      navegar(`/publicacao/${minhaAvaliacao.id}`, {
                        state: { voltarPara: estado.voltarPara ?? `/filme/${filme.tmdbId}` },
                      })
                    }
                    className="mt-2 text-sm text-rosa-suave underline"
                  >
                    {textos.novo.avaliacaoExistente}
                  </button>
                )}
              </div>
              <button
                type="button"
                aria-label={textos.novo.removerFilme}
                onClick={() => {
                  setFilme(null)
                  setNota(0)
                }}
                className="p-1 text-cinza transition-transform active:scale-90"
              >
                <IconeFechar size={17} aria-hidden />
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
              className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-abismo/80 text-neve"
            >
              <IconeFechar size={16} aria-hidden />
            </button>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {!filme && (
            <>
              <Botao
                variante="fantasma"
                onClick={() => campoFoto.current?.click()}
                className="py-2.5"
              >
                <IconeFoto size={17} aria-hidden />
                {textos.novo.foto}
              </Botao>
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
            <Botao variante="fantasma" onClick={() => setBuscaAberta(true)} className="py-2.5">
              <IconeFilme size={17} aria-hidden />
              {filme ? textos.novo.trocarFilme : textos.novo.avaliarFilme}
            </Botao>
          )}
        </div>

        {erro && <p className="mt-3 text-sm text-erro">{erro}</p>}

        <Botao
          onClick={aoPublicar}
          carregando={publicando}
          disabled={Boolean(filme && (avaliacoesDoFilme.isLoading || minhaAvaliacao))}
          className="mt-5 w-full"
        >
          {textos.novo.publicar}
        </Botao>

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
      </div>
    </main>
  )
}
