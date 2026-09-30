import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { urlBackdrop, urlLogoProvedor } from '../api/tmdb'
import { AvaliacoesDoFilme } from '../componentes/filmes/AvaliacoesDoFilme'
import { Poster } from '../componentes/filmes/Poster'
import { FolhaAdicionarALista } from '../componentes/filmes/FolhaAdicionarALista'
import { CabecalhoPagina } from '../componentes/layout/CabecalhoPagina'
import { ModalAgendarSessao } from '../componentes/sessoes/ModalAgendarSessao'
import { Botao } from '../componentes/ui/Botao'
import { Esqueleto } from '../componentes/ui/Esqueleto'
import { IconeEstrela, IconeMais, IconeSessao } from '../componentes/ui/icones'
import { useAutenticacao } from '../hooks/useAutenticacao'
import { useAvaliacoesDoFilme } from '../hooks/useMural'
import { useFilmeTmdb, useOndeAssistir } from '../hooks/useTmdb'
import { textos } from '../lib/textos'

/** Página do filme: dados do TMDB, onde assistir no Brasil e adicionar à lista. */
export function PaginaFilme() {
  const { tmdbId } = useParams()
  const navegar = useNavigate()
  const { usuario } = useAutenticacao()
  const id = tmdbId ? Number(tmdbId) : null
  const filme = useFilmeTmdb(id)
  const ondeAssistir = useOndeAssistir(id)
  const avaliacoes = useAvaliacoesDoFilme(id)
  const [folhaAberta, setFolhaAberta] = useState(false)
  const [agendando, setAgendando] = useState(false)

  if (filme.isLoading) {
    return (
      <main>
        <CabecalhoPagina titulo={textos.comuns.carregando} fallback="/cinema" />
        <div className="mt-4 space-y-4 px-5">
          <Esqueleto className="h-44 rounded-cartao" />
          <Esqueleto className="h-24" />
        </div>
      </main>
    )
  }
  if (!filme.data) {
    return (
      <main>
        <CabecalhoPagina titulo={textos.filme.naoEncontrado} fallback="/cinema" />
      </main>
    )
  }

  const dados = filme.data
  const minhaAvaliacao = avaliacoes.data?.find((avaliacao) => avaliacao.autorId === usuario?.id)
  const fundo = urlBackdrop(dados.caminhoBackdrop)
  const provedores =
    ondeAssistir.data && ondeAssistir.data.streaming.length > 0
      ? { rotulo: textos.filme.ondeAssistir, lista: ondeAssistir.data.streaming }
      : ondeAssistir.data && ondeAssistir.data.aluguel.length > 0
        ? { rotulo: textos.filme.aluguel, lista: ondeAssistir.data.aluguel }
        : null

  return (
    <main>
      <CabecalhoPagina titulo={dados.titulo} fallback="/cinema" />
      <section className="relative overflow-hidden">
        {fundo && (
          <>
            <img
              src={fundo}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-linear-to-b from-fundo/0 via-fundo/70 to-fundo" />
          </>
        )}

        <div className={`relative px-5 pb-2 ${fundo ? 'pt-44' : 'pt-6'}`}>
          {!fundo && (
            <Poster
              caminho={dados.caminhoPoster}
              titulo={dados.titulo}
              largura={342}
              className="mb-5 w-28"
            />
          )}
          {dados.generos.length > 0 && (
            <p className="rotulo-secao text-texto-secundario">{dados.generos.join(' · ')}</p>
          )}
          {/* O h1 é o do cabeçalho; aqui é só o destaque visual do herói */}
          <p className="mt-2.5 titulo text-5xl leading-none tracking-tight text-texto">
            {dados.titulo}
          </p>
          <p className="mt-3 text-sm text-texto-secundario">
            {[
              dados.anoLancamento ? String(dados.anoLancamento) : null,
              dados.duracaoMinutos ? textos.filme.duracao(dados.duracaoMinutos) : null,
            ]
              .filter((pedaco): pedaco is string => pedaco !== null)
              .join(' · ')}
          </p>
        </div>
      </section>

      <div className="px-5">
        <div className="mt-5 flex gap-2.5">
          <Botao onClick={() => setFolhaAberta(true)} grande className="flex-1">
            <IconeMais size={17} aria-hidden />
            {textos.filme.adicionarALista}
          </Botao>
          <button
            type="button"
            aria-label={textos.sessao.agendarBotao}
            onClick={() => setAgendando(true)}
            className="flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-full border border-vidro-borda bg-vidro text-texto transition-transform active:scale-95"
          >
            <IconeSessao size={21} aria-hidden />
          </button>
          <button
            type="button"
            aria-label={minhaAvaliacao ? textos.filme.editarAvaliacao : textos.filme.avaliar}
            disabled={avaliacoes.isLoading}
            onClick={() => {
              if (minhaAvaliacao) {
                navegar(`/publicacao/${minhaAvaliacao.id}`, {
                  state: { voltarPara: `/filme/${dados.tmdbId}` },
                })
                return
              }
              navegar('/novo', {
                state: {
                  filme: {
                    tmdbId: dados.tmdbId,
                    titulo: dados.titulo,
                    caminhoPoster: dados.caminhoPoster,
                    anoLancamento: dados.anoLancamento,
                  },
                  voltarPara: `/filme/${dados.tmdbId}`,
                },
              })
            }}
            className="flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-full border border-vidro-borda bg-vidro text-texto transition-transform active:scale-95 disabled:opacity-50"
          >
            <IconeEstrela size={21} weight={minhaAvaliacao ? 'fill' : 'regular'} aria-hidden />
          </button>
        </div>

        {dados.sinopse && (
          <p className="mt-6 text-[15px] leading-relaxed text-texto-secundario">{dados.sinopse}</p>
        )}

        {/* Onde assistir (região BR) — atribuição JustWatch exigida pelo TMDB */}
        <section className="mt-8 pb-8">
          <h2 className="rotulo-secao">{textos.filme.ondeAssistir}</h2>
          {provedores ? (
            <>
              <ul className="mt-3 flex flex-wrap gap-2">
                {provedores.lista.map((provedor) => (
                  <li
                    key={provedor.nome}
                    className="flex h-11 items-center gap-2.5 rounded-full border border-vidro-borda bg-vidro pr-4 pl-1.5"
                  >
                    {urlLogoProvedor(provedor.caminhoLogo) && (
                      <img
                        src={urlLogoProvedor(provedor.caminhoLogo)!}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <span className="text-sm text-texto-secundario">{provedor.nome}</span>
                  </li>
                ))}
              </ul>
              {ondeAssistir.data?.linkJustWatch && (
                <a
                  href={ondeAssistir.data.linkJustWatch}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-texto-secundario underline decoration-texto/30 underline-offset-4"
                >
                  {textos.filme.verNoJustWatch}
                </a>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-texto-discreto">{textos.filme.semProvedores}</p>
          )}
        </section>

        <AvaliacoesDoFilme tmdbId={dados.tmdbId} />
      </div>

      {agendando && (
        <ModalAgendarSessao
          filme={{
            tmdbId: dados.tmdbId,
            titulo: dados.titulo,
            caminhoPoster: dados.caminhoPoster,
            anoLancamento: dados.anoLancamento,
          }}
          itemListaId={null}
          aoFechar={() => setAgendando(false)}
        />
      )}

      {folhaAberta && (
        <FolhaAdicionarALista
          filme={{
            tmdbId: dados.tmdbId,
            titulo: dados.titulo,
            caminhoPoster: dados.caminhoPoster,
            anoLancamento: dados.anoLancamento,
          }}
          aoFechar={() => setFolhaAberta(false)}
        />
      )}
    </main>
  )
}
