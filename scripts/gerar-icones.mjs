/**
 * Gera os PNGs da PWA a partir do public/icone.svg, rasterizando com o
 * Chromium do Playwright (já é dependência do projeto — nada de binário
 * nativo extra). Rodar quando o ícone mudar:
 *
 *   node scripts/gerar-icones.mjs
 *
 * Saídas em public/:
 * - icone-192.png / icone-512.png  → ícone padrão (cantos arredondados)
 * - icone-maskable-512.png         → fundo cheio + coração a 72% (zona
 *                                     segura da máscara do Android)
 * - apple-touch-icon.png (180px)   → fundo cheio (o iOS aplica a própria
 *                                     máscara; transparência vira preto)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const CORACAO =
  'M32 44c-.6 0-1.2-.2-1.7-.6C22.5 37.2 16 31.6 16 24.6 16 19.3 20.1 15 25.2 15c2.7 0 5.2 1.2 6.8 3.2C33.6 16.2 36.1 15 38.8 15 43.9 15 48 19.3 48 24.6c0 7-6.5 12.6-14.3 18.8-.5.4-1.1.6-1.7.6z'

const svgPadrao = readFileSync(new URL('../public/icone.svg', import.meta.url), 'utf8')

// Fundo cheio (sem cantos transparentes) + coração reduzido para a zona segura.
const svgQuadrado = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#16131c"/>
  <g transform="translate(32 32) scale(0.72) translate(-32 -32)">
    <path d="${CORACAO}" fill="#d4537e"/>
  </g>
</svg>`

const saidas = [
  { arquivo: 'icone-192.png', tamanho: 192, svg: svgPadrao },
  { arquivo: 'icone-512.png', tamanho: 512, svg: svgPadrao },
  { arquivo: 'icone-maskable-512.png', tamanho: 512, svg: svgQuadrado },
  { arquivo: 'apple-touch-icon.png', tamanho: 180, svg: svgQuadrado },
]

// Splash screens do iOS (apple-touch-startup-image): fundo noite + coração.
// Tamanhos dos iPhones que interessam (retrato, pixels reais).
function svgSplash(largura, altura) {
  const escala = largura / 6.4 // coração ocupa ~10% da largura
  const x = (largura - escala) / 2
  const y = (altura - escala) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} ${altura}">
  <rect width="${largura}" height="${altura}" fill="#16131c"/>
  <g transform="translate(${x} ${y}) scale(${escala / 64})">
    <path d="${CORACAO}" fill="#d4537e"/>
  </g>
</svg>`
}

const splashes = [
  { arquivo: 'splash-1170x2532.png', largura: 1170, altura: 2532 }, // 12/13/14
  { arquivo: 'splash-1179x2556.png', largura: 1179, altura: 2556 }, // 14–16 Pro
  { arquivo: 'splash-1290x2796.png', largura: 1290, altura: 2796 }, // Pro Max
]

// Mesmo canal dos E2E: o Edge do sistema (dispensa `playwright install`).
const navegador = await chromium.launch({ channel: 'msedge' })
const pagina = await navegador.newPage()

for (const { arquivo, tamanho, svg } of saidas) {
  await pagina.setViewportSize({ width: tamanho, height: tamanho })
  const svgBase64 = Buffer.from(svg).toString('base64')
  await pagina.setContent(
    `<style>*{margin:0;padding:0}</style>` +
      `<img src="data:image/svg+xml;base64,${svgBase64}" width="${tamanho}" height="${tamanho}">`,
  )
  const png = await pagina.screenshot({ omitBackground: true })
  writeFileSync(new URL(`../public/${arquivo}`, import.meta.url), png)
  console.log(`✓ public/${arquivo} (${tamanho}px)`)
}

for (const { arquivo, largura, altura } of splashes) {
  await pagina.setViewportSize({ width: largura, height: altura })
  const svgBase64 = Buffer.from(svgSplash(largura, altura)).toString('base64')
  await pagina.setContent(
    `<style>*{margin:0;padding:0}</style>` +
      `<img src="data:image/svg+xml;base64,${svgBase64}" width="${largura}" height="${altura}">`,
  )
  const png = await pagina.screenshot()
  writeFileSync(new URL(`../public/${arquivo}`, import.meta.url), png)
  console.log(`✓ public/${arquivo} (${largura}×${altura})`)
}

await navegador.close()
