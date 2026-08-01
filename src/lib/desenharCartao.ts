import { urlPoster } from '../api/tmdb'
import { CARTAO, TEMAS, quebrarLinhas, type NomeTema } from './layoutCartao'

/**
 * Desenha o cartão de compartilhar DIRETO num canvas 2D e devolve o PNG.
 *
 * Lições herdadas do Mozii original:
 * - Capturar DOM (html-to-image) gerava PNG transparente — por isso canvas puro.
 * - O pôster vem via `fetch` com CORS: `https://image.tmdb.org` precisa estar
 *   no `connect-src` da CSP. O `?share=1` evita reusar a entrada de cache
 *   sem CORS criada pelos `<img>` do feed.
 * - Blob minúsculo = imagem em branco; melhor um erro claro que um cartão vazio.
 */
export interface DadosCartao {
  tituloFilme: string
  ano: number | null
  caminhoPoster: string | null
  nota: number
  corpo: string | null
  nomes: string[]
  tema: NomeTema
}

export async function desenharCartao(dados: DadosCartao): Promise<Blob> {
  const tema = TEMAS[dados.tema]
  const tela = document.createElement('canvas')
  tela.width = CARTAO.largura
  tela.height = CARTAO.altura
  const ctx = tela.getContext('2d')!

  // Fundo em degradê vertical
  const fundo = ctx.createLinearGradient(0, 0, 0, CARTAO.altura)
  fundo.addColorStop(0, tema.fundoTopo)
  fundo.addColorStop(1, tema.fundoBase)
  ctx.fillStyle = fundo
  ctx.fillRect(0, 0, CARTAO.largura, CARTAO.altura)

  // Pôster centralizado no topo, com cantos arredondados
  let baseY = 200
  const poster = await carregarPoster(dados.caminhoPoster)
  if (poster) {
    const { largura, altura, raio } = CARTAO.poster
    const x = (CARTAO.largura - largura) / 2
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(x, baseY, largura, altura, raio)
    ctx.clip()
    desenharCobrindo(ctx, poster, x, baseY, largura, altura)
    ctx.restore()
    poster.close()
    baseY += altura + 88
  } else {
    baseY += 120
  }

  // Título e ano
  ctx.textAlign = 'center'
  ctx.fillStyle = tema.texto
  ctx.font = '600 64px system-ui, sans-serif'
  const centro = CARTAO.largura / 2
  for (const linha of quebrarLinhas(dados.tituloFilme, 24, 2)) {
    ctx.fillText(linha, centro, baseY)
    baseY += 76
  }
  if (dados.ano) {
    ctx.fillStyle = tema.textoSuave
    ctx.font = '44px system-ui, sans-serif'
    ctx.fillText(String(dados.ano), centro, baseY)
    baseY += 72
  }

  // Estrelas (com meia estrela via clip)
  desenharEstrelas(ctx, dados.nota, baseY, tema.destaque)
  baseY += CARTAO.estrela.tamanho + 88

  // Texto da avaliação
  if (dados.corpo) {
    ctx.fillStyle = tema.texto
    ctx.font = 'italic 46px Georgia, serif'
    for (const linha of quebrarLinhas(`“${dados.corpo}”`, 38, 6)) {
      ctx.fillText(linha, centro, baseY)
      baseY += 64
    }
  }

  // Assinatura do casal + marca do app
  ctx.fillStyle = tema.destaque
  ctx.font = '48px Georgia, serif'
  ctx.fillText(dados.nomes.join(' ♥ '), centro, CARTAO.altura - 180)
  ctx.fillStyle = tema.textoSuave
  ctx.font = '36px system-ui, sans-serif'
  ctx.fillText('mozii 💜', centro, CARTAO.altura - 100)

  const blob = await new Promise<Blob | null>((resolver) => tela.toBlob(resolver, 'image/png'))
  if (!blob || blob.size < 25_000) {
    throw new Error('imagem gerada em branco')
  }
  return blob
}

async function carregarPoster(caminho: string | null): Promise<ImageBitmap | null> {
  const url = urlPoster(caminho, 500)
  if (!url) return null

  // 1 nova tentativa: a primeira falha ocasional do CDN não estraga o cartão.
  for (let tentativa = 0; tentativa < 2; tentativa++) {
    try {
      const resposta = await fetch(`${url}?share=1`, { mode: 'cors', cache: 'no-store' })
      if (!resposta.ok) continue
      return await createImageBitmap(await resposta.blob())
    } catch {
      // tenta de novo
    }
  }
  return null
}

/** Desenha a imagem cobrindo a área (crop central, sem distorcer). */
function desenharCobrindo(
  ctx: CanvasRenderingContext2D,
  imagem: ImageBitmap,
  x: number,
  y: number,
  largura: number,
  altura: number,
) {
  const escala = Math.max(largura / imagem.width, altura / imagem.height)
  const larguraFinal = imagem.width * escala
  const alturaFinal = imagem.height * escala
  ctx.drawImage(
    imagem,
    x - (larguraFinal - largura) / 2,
    y - (alturaFinal - altura) / 2,
    larguraFinal,
    alturaFinal,
  )
}

function desenharEstrelas(ctx: CanvasRenderingContext2D, nota: number, y: number, cor: string) {
  const { tamanho, espaco } = CARTAO.estrela
  const larguraTotal = 5 * tamanho + 4 * espaco
  let x = (CARTAO.largura - larguraTotal) / 2

  for (let estrela = 1; estrela <= 5; estrela++) {
    const fracao = Math.max(0, Math.min(1, nota - (estrela - 1)))
    // Contorno apagado
    ctx.save()
    ctx.translate(x, y)
    ctx.fillStyle = `${cor}40`
    ctx.fill(caminhoEstrela(tamanho))
    // Preenchimento proporcional (meia estrela = metade do clip)
    if (fracao > 0) {
      ctx.beginPath()
      ctx.rect(0, -tamanho, tamanho * fracao, tamanho * 2)
      ctx.clip()
      ctx.fillStyle = cor
      ctx.fill(caminhoEstrela(tamanho))
    }
    ctx.restore()
    x += tamanho + espaco
  }
}

function caminhoEstrela(tamanho: number): Path2D {
  const caminho = new Path2D()
  const centro = tamanho / 2
  const raioExterno = tamanho / 2
  const raioInterno = raioExterno * 0.4

  for (let ponta = 0; ponta < 10; ponta++) {
    const raio = ponta % 2 === 0 ? raioExterno : raioInterno
    const angulo = (Math.PI / 5) * ponta - Math.PI / 2
    const x = centro + raio * Math.cos(angulo)
    const y = centro + raio * Math.sin(angulo)
    if (ponta === 0) caminho.moveTo(x, y)
    else caminho.lineTo(x, y)
  }
  caminho.closePath()
  return caminho
}
