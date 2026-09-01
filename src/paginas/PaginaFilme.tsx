import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { urlBackdrop, urlLogoProvedor } from '../api/tmdb'
import { Poster } from '../componentes/filmes/Poster'
import { FolhaAdicionarALista } from '../componentes/filmes/FolhaAdicionarALista'
import { CabecalhoPagina } from '../componentes/layout/CabecalhoPagina'
import { ModalAgendarSessao } from '../componentes/sessoes/ModalAgendarSessao'
import { Botao } from '../componentes/ui/Botao'
import { Esqueleto } from '../componentes/ui/Esqueleto'
import { IconeMais, IconeSessao } from '../componentes/ui/icones'
import { useFilmeTmdb, useOndeAssistir } from '../hooks/useTmdb'
import { textos } from '../lib/textos'

/** Página do filme: dados do TMDB, onde assistir no Brasil e adicionar à lista. */
export function PaginaFilme() {
  const { tmdbId } = useParams()
  const id = tmdbId ? Number(tmdbId) : null
  const filme = useFilmeTmdb(id)
  const ondeAssistir = useOndeAssistir(id)
  const [folhaAberta, setFolhaAberta] = useState(false)
  const [agendando, setAgendando] = useState(false)

  if (filme.isLoading) {
    return (
      <main>
        <CabecalhoPagina titulo={textos.comuns.carregando} fallback="/cinema" />
        <div className="mt-4 space-y-4 px-5">
          <Esqueleto className="h-44 rounded-2xl" />
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
      <section className={`relative ${fundo ? 'overflow-hidden bg-noite' : 'px-5 pt-8'}`}>
        {fundo && (
          <>
            <img
              src={fundo}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-noite/10 via-noite/55 to-noite" />
          </>
        )}

        <div className={`relative ${fundo ? 'px-5 pt-24 pb-5' : ''}`}>
          <div className="flex items-end gap-4">
            <Poster
              caminho={dados.caminhoPoster}
              titulo={dados.titulo}
              largura={342}
              className="w-28 rounded-lg border border-linha-forte shadow-cartao"
            />
            <div className="pb-1">
              {/* O h1 é o do cabeçalho; aqui é só o destaque visual do herói */}
              <p className="font-voz text-2xl leading-tight font-semibold text-neve">
                {dados.titulo}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  dados.anoLancamento ? String(dados.anoLancamento) : null,
                  dados.duracaoMinutos ? textos.filme.duracao(dados.duracaoMinutos) : null,
                ]
                  .filter((pedaco): pedaco is string => pedaco !== null)
                  .map((pedaco) => (
                    <span
                      key={pedaco}
                      className="rounded-full bg-veu px-2.5 py-0.5 text-xs text-nevoa"
                    >
                      {pedaco}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-5">
        {dados.generos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {dados.generos.map((genero) => (
              <span key={genero} className="rounded-full bg-veu px-2.5 py-0.5 text-xs text-nevoa">
                {genero}
              </span>
            ))}
          </div>
        )}

        {dados.sinopse && (
          <p className="mt-4 text-sm leading-relaxed text-nevoa">{dados.sinopse}</p>
        )}

        <div className="mt-5 flex gap-2">
          <Botao onClick={() => setFolhaAberta(true)} className="flex-1">
            <IconeMais size={17} aria-hidden />
            {textos.filme.adicionarALista}
          </Botao>
          <Botao variante="secundario" onClick={() => setAgendando(true)} className="flex-1">
            <IconeSessao size={17} aria-hidden />
            {textos.sessao.agendarBotao}
          </Botao>
        </div>

        {/* Onde assistir (região BR) — atribuição JustWatch exigida pelo TMDB */}
        <section className="mt-7 pb-8">
          <h2 className="text-xs font-medium tracking-wide text-rosa-suave uppercase">
            {textos.filme.ondeAssistir}
          </h2>
          {provedores ? (
            <>
              <ul className="mt-3 flex flex-wrap gap-3">
                {provedores.lista.map((provedor) => (
                  <li
                    key={provedor.nome}
                    className="flex items-center gap-2 rounded-xl border border-linha bg-cartao px-3 py-2"
                  >
                    {urlLogoProvedor(provedor.caminhoLogo) && (
                      <img
                        src={urlLogoProvedor(provedor.caminhoLogo)!}
                        alt=""
                        className="h-6 w-6 rounded"
                      />
                    )}
                    <span className="text-sm text-nevoa">{provedor.nome}</span>
                  </li>
                ))}
              </ul>
              {ondeAssistir.data?.linkJustWatch && (
                <a
                  href={ondeAssistir.data.linkJustWatch}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-rosa-suave underline"
                >
                  {textos.filme.verNoJustWatch}
                </a>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-cinza">{textos.filme.semProvedores}</p>
          )}
        </section>
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
