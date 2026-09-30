import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FolhaBuscarFilme } from '../componentes/filmes/FolhaBuscarFilme'
import { Poster } from '../componentes/filmes/Poster'
import { CabecalhoPagina } from '../componentes/layout/CabecalhoPagina'
import { EstrelasNota } from '../componentes/mural/EstrelasNota'
import { Botao } from '../componentes/ui/Botao'
import { AreaTexto } from '../componentes/ui/Campo'
import { IconeFechar, IconeFilme, IconeFoto } from '../componentes/ui/icones'
import type { RefFilme } from '../dominio/tipos'
import { useCriarAvaliacao, useCriarTexto } from '../hooks/useMural'
import { useConcluirSessao } from '../hooks/useSessoes'
import { useAutenticacao } from '../hooks/useAutenticacao'
import { useAvaliacoesDoFilme } from '../hooks/useMural'
import { textos } from '../lib/textos'

/** O cartão de sessão navega para cá com o filme e a sessão a concluir. */
interface EstadoDaNovaPublicacao {
  filme?: RefFilme
  sessaoId?: string
  voltarPara?: string
}

/**
 * O composer do Mural: texto e/ou fotos (quantas quiser) — ou uma
 * avaliação, quando um filme é escolhido (aí a nota vira obrigatória e as
 * fotos saem de cena).
 * Vindo do "E aí, como foi?", publicar a avaliação também conclui a sessão.
 */
export function PaginaNovaPublicacao() {
  const navegar = useNavigate()
  const estado = (useLocation().state ?? {}) as EstadoDaNovaPublicacao
  const { usuario } = useAutenticacao()
  const criarTexto = useCriarTexto()
  const criarAvaliacao = useCriarAvaliacao()
  const concluirSessao = useConcluirSessao()

  const [corpo, setCorpo] = useState('')
  const [fotos, setFotos] = useState<File[]>([])
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

  const previews = useMemo(() => fotos.map((foto) => URL.createObjectURL(foto)), [fotos])
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews])

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

    if (!texto && fotos.length === 0) {
      setErro(textos.novo.faltaConteudo)
      return
    }

    setPublicando(true)
    try {
      await criarTexto.mutateAsync({ corpo: texto, fotos })
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
          livre
          className="mt-3 resize-none font-titulo text-2xl leading-snug font-light italic"
        />

        {/* Filme escolhido → avaliação */}
        {filme && (
          <div className="mt-4 rounded-cartao border border-borda bg-superficie p-4">
            <div className="flex items-center gap-4">
              <Poster
                caminho={filme.caminhoPoster}
                titulo={filme.titulo}
                largura={185}
                className="w-20"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate titulo text-xl text-texto">{filme.titulo}</p>
                <p className="mt-3 text-[11px] font-medium tracking-[0.12em] text-texto-discreto uppercase">
                  {textos.novo.notaRotulo}
                </p>
                <EstrelasNota valor={nota} aoMudar={setNota} />
                {minhaAvaliacao && (
                  <button
                    type="button"
                    onClick={() =>
                      navegar(`/publicacao/${minhaAvaliacao.id}`, {
                        state: { voltarPara: estado.voltarPara ?? `/filme/${filme.tmdbId}` },
                      })
                    }
                    className="mt-2 text-sm text-texto-secundario underline decoration-texto/30 underline-offset-4"
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
                className="p-1 text-texto-discreto transition-transform active:scale-90"
              >
                <IconeFechar size={17} aria-hidden />
              </button>
            </div>
          </div>
        )}

        {/* Fotos escolhidas (só em publicação de texto) */}
        {previews.length > 0 && !filme && (
          <div
            className={`mt-3 grid gap-2 ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}
          >
            {previews.map((url, indice) => (
              <div key={url} className="relative">
                <img
                  src={url}
                  alt=""
                  className={`w-full rounded-cartao object-cover ${previews.length === 1 ? 'max-h-72' : 'aspect-square'}`}
                />
                <button
                  type="button"
                  aria-label={textos.novo.removerFoto}
                  onClick={() => setFotos((atuais) => atuais.filter((_, i) => i !== indice))}
                  className="absolute top-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-vidro-borda bg-fundo-profundo/60 text-texto backdrop-blur-vidro"
                >
                  <IconeFechar size={15} aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex gap-2">
          {!filme && (
            <>
              <Botao
                variante="fantasma"
                onClick={() => campoFoto.current?.click()}
                className="py-2.5"
              >
                <IconeFoto size={17} aria-hidden />
                {fotos.length > 0 ? textos.novo.maisFotos : textos.novo.foto}
              </Botao>
              {/* Cada escolha SOMA às fotos já escolhidas */}
              <input
                ref={campoFoto}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(evento) => {
                  const escolhidas = [...(evento.target.files ?? [])]
                  evento.target.value = ''
                  setFotos((atuais) => [...atuais, ...escolhidas])
                }}
              />
            </>
          )}
          {fotos.length === 0 && (
            <Botao variante="fantasma" onClick={() => setBuscaAberta(true)} className="py-2.5">
              <IconeFilme size={17} aria-hidden />
              {filme ? textos.novo.trocarFilme : textos.novo.avaliarFilme}
            </Botao>
          )}
        </div>

        {erro && <p className="mt-3 text-sm text-perigo-texto">{erro}</p>}

        <Botao
          onClick={aoPublicar}
          carregando={publicando}
          disabled={Boolean(filme && (avaliacoesDoFilme.isLoading || minhaAvaliacao))}
          grande
          className="mt-6 w-full"
        >
          {textos.novo.publicar}
        </Botao>

        {buscaAberta && (
          <FolhaBuscarFilme
            aoEscolher={(escolhido) => {
              setFilme(escolhido)
              setFotos([])
              setBuscaAberta(false)
            }}
            aoFechar={() => setBuscaAberta(false)}
          />
        )}
      </div>
    </main>
  )
}
