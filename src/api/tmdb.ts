import { ambiente } from '../lib/ambiente'

/**
 * Cliente do TMDB (The Movie Database). Fica FORA da camada de repositórios
 * de propósito: o catálogo seria idêntico com qualquer backend.
 *
 * Chave v3 via query string — é pública por design (vai para o bundle e o
 * TMDB limita por taxa). Idioma pt-BR e provedores da região BR.
 */
const URL_BASE = 'https://api.themoviedb.org/3'
const URL_IMAGEM = 'https://image.tmdb.org/t/p'

export interface FilmeBuscado {
  tmdbId: number
  titulo: string
  caminhoPoster: string | null
  anoLancamento: number | null
}

export interface DetalhesFilme extends FilmeBuscado {
  sinopse: string | null
  duracaoMinutos: number | null
  generos: string[]
  caminhoBackdrop: string | null
}

export interface Provedor {
  nome: string
  caminhoLogo: string | null
}

export interface OndeAssistir {
  streaming: Provedor[]
  aluguel: Provedor[]
  /** Página do JustWatch com todas as opções (atribuição exigida pelo TMDB). */
  linkJustWatch: string | null
}

async function buscarNoTmdb<T>(
  caminho: string,
  parametros: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${URL_BASE}${caminho}`)
  url.searchParams.set('api_key', ambiente.tmdbChave)
  url.searchParams.set('language', 'pt-BR')
  for (const [nome, valor] of Object.entries(parametros)) {
    url.searchParams.set(nome, valor)
  }

  const resposta = await fetch(url)
  if (!resposta.ok) {
    throw new Error(`TMDB respondeu ${resposta.status} em ${caminho}`)
  }
  return resposta.json()
}

function anoDe(dataLancamento: string | null | undefined): number | null {
  const ano = dataLancamento?.slice(0, 4)
  return ano ? Number(ano) : null
}

export async function buscarFilmes(termo: string): Promise<FilmeBuscado[]> {
  if (!termo.trim()) return []

  const dados = await buscarNoTmdb<{
    results: Array<{
      id: number
      title: string
      poster_path: string | null
      release_date: string | null
    }>
  }>('/search/movie', { query: termo, include_adult: 'false' })

  return dados.results.map((filme) => ({
    tmdbId: filme.id,
    titulo: filme.title,
    caminhoPoster: filme.poster_path,
    anoLancamento: anoDe(filme.release_date),
  }))
}

export async function obterFilme(tmdbId: number): Promise<DetalhesFilme> {
  const filme = await buscarNoTmdb<{
    id: number
    title: string
    poster_path: string | null
    backdrop_path: string | null
    release_date: string | null
    overview: string | null
    runtime: number | null
    genres: Array<{ name: string }>
  }>(`/movie/${tmdbId}`)

  return {
    tmdbId: filme.id,
    titulo: filme.title,
    caminhoPoster: filme.poster_path,
    caminhoBackdrop: filme.backdrop_path,
    anoLancamento: anoDe(filme.release_date),
    sinopse: filme.overview || null,
    duracaoMinutos: filme.runtime || null,
    generos: filme.genres.map((genero) => genero.name),
  }
}

export async function obterOndeAssistir(tmdbId: number): Promise<OndeAssistir> {
  const dados = await buscarNoTmdb<{
    results?: Record<
      string,
      {
        link?: string
        flatrate?: Array<{ provider_name: string; logo_path: string | null }>
        rent?: Array<{ provider_name: string; logo_path: string | null }>
      }
    >
  }>(`/movie/${tmdbId}/watch/providers`)

  const brasil = dados.results?.BR
  const paraProvedor = (bruto: { provider_name: string; logo_path: string | null }): Provedor => ({
    nome: bruto.provider_name,
    caminhoLogo: bruto.logo_path,
  })

  return {
    streaming: brasil?.flatrate?.map(paraProvedor) ?? [],
    aluguel: brasil?.rent?.map(paraProvedor) ?? [],
    linkJustWatch: brasil?.link ?? null,
  }
}

export function urlPoster(caminho: string | null, largura: 185 | 342 | 500 = 342): string | null {
  return caminho ? `${URL_IMAGEM}/w${largura}${caminho}` : null
}

export function urlBackdrop(caminho: string | null): string | null {
  return caminho ? `${URL_IMAGEM}/w780${caminho}` : null
}

export function urlLogoProvedor(caminho: string | null): string | null {
  return caminho ? `${URL_IMAGEM}/w92${caminho}` : null
}
