/**
 * Redimensionamento de fotos NO NAVEGADOR, antes do upload.
 * WebP com qualidade 0,85 e lado máximo de 1600px (~200–400 KB por foto):
 * é o que faz 1 GB de Storage gratuito render milhares de fotos.
 */
export async function redimensionarFoto(arquivo: File, ladoMaximo = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo)

  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height))
  const largura = Math.round(bitmap.width * escala)
  const altura = Math.round(bitmap.height * escala)

  const tela = document.createElement('canvas')
  tela.width = largura
  tela.height = altura
  tela.getContext('2d')!.drawImage(bitmap, 0, 0, largura, altura)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolver) =>
    tela.toBlob(resolver, 'image/webp', 0.85),
  )
  if (!blob) throw new Error('não consegui converter a foto')
  return blob
}
